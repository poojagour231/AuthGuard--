
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_risk_analysis_saves_event():
    payload = {
        "hostname": "example.com",
        "otp_field_detected": False,
        "redirect_count": 0,
        "reputation": "unknown",
    }

    response = client.post("/api/v1/risk/analyze", json=payload)

    assert response.status_code == 200

    result = response.json()
    assert "event_id" in result
    assert result["decision"] in ["allow", "verify", "block"]
    assert 0 <= result["risk_score"] <= 100


def test_events_endpoint():
    response = client.get("/api/v1/risk/events")

    assert response.status_code == 200
    assert "items" in response.json()


def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")

    assert response.status_code == 200
    result = response.json()
    assert "total_events" in result
    assert "blocked_events" in result


def test_invalid_reputation_is_rejected():
    payload = {
        "hostname": "example.com",
        "reputation": "not-valid",
    }

    response = client.post("/api/v1/risk/analyze", json=payload)

    assert response.status_code == 422


def test_event_not_found():
    response = client.get("/api/v1/risk/events/999999999")

    assert response.status_code == 404


def test_malicious_reputation_returns_block():
    payload = {
        "hostname": "example.com",
        "otp_field_detected": True,
        "redirect_count": 0,
        "reputation": "malicious",
    }

    response = client.post("/api/v1/risk/analyze", json=payload)

    assert response.status_code == 200

    result = response.json()
    assert result["risk_score"] == 70
    assert result["risk_level"] == "high"
    assert result["decision"] == "block"
    assert result["event_id"] is not None


def test_invalid_hostname_is_rejected():
    response = client.post(
        "/api/v1/risk/analyze",
        json={
            "hostname": "https://example.com/login",
            "reputation": "unknown",
        },
    )

    assert response.status_code == 422


def test_missing_event_returns_404():
    response = client.get("/api/v1/risk/events/999999999")

    assert response.status_code == 404


def test_event_pagination():
    response = client.get(
        "/api/v1/risk/events?limit=5&offset=0"
    )

    assert response.status_code == 200
    result = response.json()
    assert "items" in result
    assert result["limit"] == 5
    assert result["offset"] == 0