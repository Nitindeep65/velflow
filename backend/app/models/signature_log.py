from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SignatureLog(Base):
    __tablename__ = "signature_logs"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False)
    signer_name = Column(String, nullable=False)
    signer_email = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    signature_svg = Column(Text, nullable=True) # Typography text or SVG coordinates
    verification_token = Column(String, nullable=True)
    signed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    contract = relationship("Contract")
