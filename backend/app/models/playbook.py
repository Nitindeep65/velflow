from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Playbook(Base):
    __tablename__ = "playbooks"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rule_category = Column(String, nullable=False)  # e.g., "Governing Law", "Liability"
    preferred_terms = Column(String, nullable=True)   # e.g., "Delaware"
    forbidden_terms = Column(String, nullable=True)   # e.g., "unlimited liability"
    risk_level = Column(String, default="High")       # "High", "Medium", "Low"

    owner = relationship("User")
