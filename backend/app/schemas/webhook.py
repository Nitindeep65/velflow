from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class WebhookCreate(BaseModel):
    name: str
    url: str
    events: List[str]  # ["contract.signed", "contract.uploaded"]
    is_active: Optional[bool] = True

class WebhookUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    events: Optional[List[str]] = None
    is_active: Optional[bool] = None

class WebhookResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    url: str
    events: List[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
