from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, DateTime, Text
)

from database import Base


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(253), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)
    decision = Column(String(20), nullable=False)
    reasons = Column(Text, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )