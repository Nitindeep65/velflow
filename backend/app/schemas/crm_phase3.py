from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- SIGNATURE LOG SCHEMAS ---
class SignatureLogCreate(BaseModel):
    signer_name: str
    signer_email: str
    signature_svg: Optional[str] = None
    ip_address: Optional[str] = None

class SignatureLogResponse(BaseModel):
    id: int
    contract_id: int
    signer_name: str
    signer_email: str
    ip_address: Optional[str] = None
    signature_svg: Optional[str] = None
    verification_token: Optional[str] = None
    signed_at: datetime

    class Config:
        from_attributes = True

# --- COMMENT SCHEMAS ---
class CommentCreate(BaseModel):
    text: str
    clause_index: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    contract_id: int
    user_id: Optional[int] = None
    author_name: str
    text: str
    clause_index: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
