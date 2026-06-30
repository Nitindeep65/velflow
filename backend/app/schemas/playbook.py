from pydantic import BaseModel
from typing import Optional

class PlaybookBase(BaseModel):
    rule_category: str
    preferred_terms: Optional[str] = None
    forbidden_terms: Optional[str] = None
    risk_level: Optional[str] = "High"

class PlaybookCreate(PlaybookBase):
    pass

class PlaybookUpdate(BaseModel):
    rule_category: Optional[str] = None
    preferred_terms: Optional[str] = None
    forbidden_terms: Optional[str] = None
    risk_level: Optional[str] = None

class PlaybookResponse(PlaybookBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class PlaybookViolation(BaseModel):
    rule_category: str
    violation: str
    clause_text: str
    severity: str  # "High", "Medium", "Low"

class PlaybookCheckResponse(BaseModel):
    contract_id: int
    total_violations: int
    violations: list[PlaybookViolation]
    overall_compliance: str  # "Pass", "Warning", "Fail"
