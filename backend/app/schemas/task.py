from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = False
    contract_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None
    contract_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    contract_name: Optional[str] = None

    class Config:
        from_attributes = True
