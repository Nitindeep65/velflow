from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Counterparty(Base):
    __tablename__ = "counterparties"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False, index=True)
    primary_contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    billing_address = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User")
    contracts = relationship("Contract", back_populates="counterparty_ref", cascade="all, delete-orphan")
    pipelines = relationship("Pipeline", back_populates="counterparty", cascade="all, delete-orphan")
