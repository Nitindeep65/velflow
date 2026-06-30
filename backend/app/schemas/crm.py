from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- Counterparty ---
class CounterpartyBase(BaseModel):
    company_name: str
    primary_contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    billing_address: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None

class CounterpartyCreate(CounterpartyBase):
    pass

class CounterpartyUpdate(BaseModel):
    company_name: Optional[str] = None
    primary_contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    billing_address: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None

class CounterpartyResponse(CounterpartyBase):
    id: int
    owner_id: int
    created_at: datetime
    contracts_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --- Pipeline (Deal) ---
class PipelineBase(BaseModel):
    deal_name: str
    stage: Optional[str] = "Drafting"
    value: Optional[float] = 0.0
    counterparty_id: Optional[int] = None

class PipelineCreate(PipelineBase):
    pass

class PipelineUpdate(BaseModel):
    deal_name: Optional[str] = None
    stage: Optional[str] = None
    value: Optional[float] = None
    counterparty_id: Optional[int] = None

class PipelineResponse(PipelineBase):
    id: int
    owner_id: int
    created_at: datetime
    counterparty_name: Optional[str] = None
    contracts_count: Optional[int] = 0

    class Config:
        from_attributes = True
