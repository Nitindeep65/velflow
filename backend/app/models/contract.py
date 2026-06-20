from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, JSON, Boolean, LargeBinary
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    counterparty = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    status = Column(String, default="Uploaded")  # Uploaded, Analyzed, Needs Review
    risk = Column(String, default="Low")         # Low, Medium, High
    next_date = Column(Date, nullable=True)      # Upcoming renewal date
    file_name = Column(String, nullable=False)   # Original file name
    mime_type = Column(String, nullable=False)   # e.g., application/pdf
    file_data = Column(LargeBinary, nullable=False) # Binary data of the file
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Rich AI analysis metadata fields
    summary_points = Column(JSON, nullable=True)  # List of strings
    risks = Column(JSON, nullable=True)           # List of dicts {"text": str, "severity": str}
    dates_timeline = Column(JSON, nullable=True)  # List of dicts {"id": str, "title": str, "date": str, "badge": str, "active": bool, "description": str}
    details_extracted = Column(Boolean, default=False)

    # Relationship to User
    owner = relationship("User", back_populates="contracts")
