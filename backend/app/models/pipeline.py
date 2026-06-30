from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    deal_name = Column(String, nullable=False, index=True)
    stage = Column(String, default="Drafting", nullable=False) # Drafting, Internal Review, In Negotiation, Out for Signature, Signed, Active
    value = Column(Float, default=0.0, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    counterparty_id = Column(Integer, ForeignKey("counterparties.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User")
    counterparty = relationship("Counterparty", back_populates="pipelines")
    contracts = relationship("Contract", back_populates="pipeline")
