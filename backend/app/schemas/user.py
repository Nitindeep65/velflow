from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# Base schema for shared attributes
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Schema for creating a user (registration)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

# Response schema, excludes hashed password
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for JWT Token responses
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
