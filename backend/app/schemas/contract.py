from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Base schema for contract attributes
class ContractBase(BaseModel):
    name: str
    counterparty: str
    type: str
    status: Optional[str] = "Uploaded"
    risk: Optional[str] = "Low"
    next_date: Optional[date] = None
    counterparty_id: Optional[int] = None
    pipeline_id: Optional[int] = None

# Schema for creating a contract (metadata fields)
class ContractCreate(ContractBase):
    pass

# Response schema returned by endpoints
class ContractResponse(ContractBase):
    id: int
    created_at: datetime
    owner_id: int
    summary_points: Optional[list[str]] = None
    risks: Optional[list[dict]] = None
    dates_timeline: Optional[list[dict]] = None
    details_extracted: Optional[bool] = False

    class Config:
        from_attributes = True
