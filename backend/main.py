
import json
import os
import re
from urllib.parse import urlsplit

import joblib
import pandas as pd

from fastapi import FastAPI, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import Base, engine, get_db
import models

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from fastapi.middleware.cors import CORSMiddleware


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AuthGuard AI Backend",
    version="1.1.0",
    description="Explainable website risk analysis API with ML",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


# Load ML model safely
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "phishing_model.pkl",
)

ml_model = None
ML_LOAD_ERROR = None

try:
    ml_model = joblib.load(MODEL_PATH)
    print("AuthGuard ML model loaded successfully.")
except Exception as exc:
    ML_LOAD_ERROR = str(exc)
    print(f"ML model unavailable; rule-based fallback enabled: {exc}")


FEATURE_NAMES = [
    "url_length",
    "count_dots",
    "count_hyphens",
    "count_at",
    "count_question",
    "count_percent",
    "has_ip",
    "is_https",
    "subdomain_count",
]


ALLOWED_REPUTATIONS = {
    "unknown",
    "safe",
    "suspicious",
    "malicious",
}


class RiskRequest(BaseModel):
    hostname: str = Field(min_length=1, max_length=253)
    url: str | None = Field(default=None, max_length=4096)
    otp_field_detected: bool = False
    redirect_count: int = Field(default=0, ge=0, le=50)
    reputation: str = Field(default="unknown")

    @field_validator("reputation")
    @classmethod
    def validate_reputation(cls, value):
        value = value.strip().lower()
        if value not in ALLOWED_REPUTATIONS:
            raise ValueError(
                "Reputation must be unknown, safe, suspicious, or malicious."
            )
        return value

    @field_validator("hostname")
    @classmethod
    def validate_hostname(cls, value):
        value = value.strip().lower().rstrip(".")

        if not value:
            raise ValueError("Hostname cannot be empty.")

        if (
            "://" in value
            or "/" in value
            or "?" in value
            or "#" in value
            or "@" in value
            or any(ch.isspace() for ch in value)
        ):
            raise ValueError("Provide a hostname, not a full URL.")

        try:
            parsed = urlsplit("//" + value)
            if parsed.hostname != value or parsed.port is not None:
                raise ValueError("Invalid hostname.")
        except ValueError:
            raise ValueError("Invalid hostname.")

        labels = value.split(".")
        for label in labels:
            if (
                not label
                or len(label) > 63
                or not re.fullmatch(
                    r"[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                    label,
                )
            ):
                raise ValueError("Invalid hostname format.")

        return value

    @field_validator("url")
    @classmethod
    def validate_url(cls, value):
        if value is None:
            return value

        value = value.strip()

        try:
            parsed = urlsplit(value)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or parsed.username is not None
                or parsed.password is not None
            ):
                raise ValueError(
                    "URL must be a valid HTTP or HTTPS URL."
                )
        except ValueError as exc:
            raise ValueError(
                "Invalid URL. Provide a valid HTTP or HTTPS URL."
            ) from exc

        return value


def _get_analysis_url(data: RiskRequest) -> str:
    """Return the full URL and ensure its hostname matches the request."""
    if data.url:
        parsed = urlsplit(data.url)
        url_hostname = (parsed.hostname or "").lower().rstrip(".")

        if url_hostname != data.hostname:
            raise HTTPException(
                status_code=422,
                detail="URL hostname must match the hostname field.",
            )

        return data.url

    # Backward compatibility for older requests without a full URL.
    return f"https://{data.hostname}"


def _extract_url_features(url: str) -> dict:
    """Extract exactly the features used to train the ML model."""
    parsed_url = urlsplit(url)
    hostname = parsed_url.hostname or ""

    ip_pattern = re.compile(
        r"(?:\d{1,3}\.){3}\d{1,3}"
    )

    return {
        "url_length": len(url),
        "count_dots": url.count("."),
        "count_hyphens": url.count("-"),
        "count_at": url.count("@"),
        "count_question": url.count("?"),
        "count_percent": url.count("%"),
        "has_ip": 1 if ip_pattern.search(url) else 0,
        "is_https": 1 if parsed_url.scheme == "https" else 0,
        "subdomain_count": (
            hostname.count(".") - 1
            if hostname.count(".") > 1
            else 0
        ),
    }


def _rule_based_assessment(data: RiskRequest):
    """Existing explainable rule-based risk assessment."""
    score = 0
    reasons = []

    if data.redirect_count >= 3:
        score += 25
        reasons.append("Multiple redirects were reported.")

    if data.otp_field_detected:
        reasons.append(
            "An OTP-like field was detected; "
            "this alone is not suspicious."
        )

    if data.reputation == "malicious":
        score += 70
        reasons.append(
            "The supplied domain reputation is marked malicious."
        )
    elif data.reputation == "suspicious":
        score += 40
        reasons.append(
            "The supplied domain reputation is suspicious."
        )

    score = min(score, 100)

    if score >= 60:
        level = "high"
        decision = "block"
        action = (
            "Avoid entering an OTP; verify the website independently."
        )
    elif score >= 25:
        level = "medium"
        decision = "verify"
        action = (
            "Check the domain carefully before entering an OTP."
        )
    else:
        level = "low"
        decision = "allow"
        action = (
            "Continue cautiously; a low score does not guarantee safety."
        )

    if not reasons:
        reasons.append(
            "No configured risk indicators were reported."
        )

    return {
        "risk_score": score,
        "risk_level": level,
        "decision": decision,
        "reasons": reasons,
        "recommended_action": action,
    }


def assess_risk(data: RiskRequest):
    """Run ML prediction and combine it with existing rule checks."""
    if ml_model is None:
        raise RuntimeError("ML model is not available.")

    url = _get_analysis_url(data)
    features = _extract_url_features(url)

    # Keep the exact feature names and order used during training.
    input_data = pd.DataFrame(
        [[features[name] for name in FEATURE_NAMES]],
        columns=FEATURE_NAMES,
    )

    prediction = int(ml_model.predict(input_data)[0])
    probabilities = ml_model.predict_proba(input_data)[0]

    # Find the probability belonging to class 1 (phishing).
    classes = list(ml_model.classes_)
    if 1 not in classes:
        raise RuntimeError(
            "The loaded model does not contain phishing class 1."
        )

    phishing_index = classes.index(1)
    phishing_probability = float(probabilities[phishing_index])
    ml_score = round(phishing_probability * 100, 2)

    # Preserve all existing rule-based checks.
    rule_result = _rule_based_assessment(data)

    # Use the higher score so a configured serious risk indicator
    # is not discarded by a low ML probability.
    score = max(
        ml_score,
        float(rule_result["risk_score"]),
    )
    score = round(min(score, 100), 2)

    if score >= 60:
        level = "high"
        decision = "block"
        action = (
            "Avoid entering an OTP; verify the website independently."
        )
    elif score >= 25:
        level = "medium"
        decision = "verify"
        action = (
            "Check the domain carefully before entering an OTP."
        )
    else:
        level = "low"
        decision = "allow"
        action = (
            "Continue cautiously; a low score does not guarantee safety."
        )

    reasons = [
        f"ML phishing probability: {ml_score}%."
    ]

    if prediction == 1:
        reasons.append(
            "The ML model classified the URL as phishing."
        )
    else:
        reasons.append(
            "The ML model classified the URL as legitimate; "
            "this does not guarantee safety."
        )

    for reason in rule_result["reasons"]:
        if (
            reason != "No configured risk indicators were reported."
            and reason not in reasons
        ):
            reasons.append(reason)

    if not any(
        reason in reasons
        for reason in rule_result["reasons"]
    ):
        reasons.append(
            "No additional configured rule-based indicators were reported."
        )

    return {
        "risk_score": score,
        "risk_level": level,
        "decision": decision,
        "reasons": reasons,
        "recommended_action": action,
        "ml_prediction": (
            "phishing" if prediction == 1 else "legitimate"
        ),
        "ml_phishing_probability": ml_score,
    }


def fallback_assess_risk(data: RiskRequest):
    """Use the original rule-based assessment if ML fails."""
    result = _rule_based_assessment(data)
    result["ml_prediction"] = "unavailable"
    result["ml_phishing_probability"] = None
    return result


@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "service": "AuthGuard AI Backend",
        "ml_model_loaded": ml_model is not None,
    }


@app.post("/api/v1/risk/analyze")
@limiter.limit("6/minute")
def analyze_risk(
    data: RiskRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    # Validate URL/hostname consistency before running either assessment.
    _get_analysis_url(data)

    try:
        result = assess_risk(data)
        analysis_mode = "ml"

    except Exception as exc:
        print(f"ML assessment failed; using fallback: {exc}")

        try:
            result = fallback_assess_risk(data)
            analysis_mode = "fallback"
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Risk assessment and fallback both failed.",
            )

    event = models.RiskEvent(
        hostname=data.hostname,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        decision=result["decision"],
        reasons=json.dumps(result["reasons"]),
    )

    try:
        db.add(event)
        db.commit()
        db.refresh(event)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save risk event.",
        )

    return {
        **result,
        "analysis_mode": analysis_mode,
        "event_id": event.id,
        "created_at": event.created_at,
    }


@app.get("/api/v1/risk/events")
def list_risk_events(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    events = (
        db.query(models.RiskEvent)
        .order_by(models.RiskEvent.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "items": [
            {
                "event_id": event.id,
                "hostname": event.hostname,
                "risk_score": event.risk_score,
                "risk_level": event.risk_level,
                "decision": event.decision,
                "reasons": json.loads(event.reasons),
                "created_at": event.created_at,
            }
            for event in events
        ],
        "limit": limit,
        "offset": offset,
    }


@app.get("/api/v1/risk/events/{event_id}")
def get_risk_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = (
        db.query(models.RiskEvent)
        .filter(models.RiskEvent.id == event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Risk event not found.",
        )

    return {
        "event_id": event.id,
        "hostname": event.hostname,
        "risk_score": event.risk_score,
        "risk_level": event.risk_level,
        "decision": event.decision,
        "reasons": json.loads(event.reasons),
        "created_at": event.created_at,
    }


@app.get("/api/v1/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    total = (
        db.query(func.count(models.RiskEvent.id)).scalar() or 0
    )

    high_risk = (
        db.query(func.count(models.RiskEvent.id))
        .filter(models.RiskEvent.risk_level == "high")
        .scalar() or 0
    )

    medium_risk = (
        db.query(func.count(models.RiskEvent.id))
        .filter(models.RiskEvent.risk_level == "medium")
        .scalar() or 0
    )

    low_risk = (
        db.query(func.count(models.RiskEvent.id))
        .filter(models.RiskEvent.risk_level == "low")
        .scalar() or 0
    )

    blocked = (
        db.query(func.count(models.RiskEvent.id))
        .filter(models.RiskEvent.decision == "block")
        .scalar() or 0
    )

    return {
        "total_events": total,
        "high_risk_events": high_risk,
        "medium_risk_events": medium_risk,
        "low_risk_events": low_risk,
        "blocked_events": blocked,
    }
