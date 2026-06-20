import os
import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.contract import Contract
from app.schemas.contract import ContractResponse
from app.services.auth import get_current_user
from app.utils.document import extract_text_from_bytes
from app.services.ai import extract_contract_metadata, ask_contract_question, compare_contracts_ai

class ChatRequest(BaseModel):
    question: str

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

# Restrict allowed file formats
ALLOWED_EXTENSIONS = {".pdf", ".docx"}

@router.post("/upload", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def upload_contract(
    name: str = Form(None),
    counterparty: str = Form(None),
    type: str = Form(None),
    status: str = Form("Uploaded"),
    risk: str = Form(None),
    next_date: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF and DOCX files are allowed."
        )

    # Validate and parse date
    parsed_date = None
    if next_date:
        try:
            parsed_date = date.fromisoformat(next_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Date must be in YYYY-MM-DD format."
            )

    # Read file content into memory
    try:
        file_bytes = file.file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read file: {str(e)}"
        )

    # AI Extraction
    extracted_text = extract_text_from_bytes(file_bytes, file.filename)
    if extracted_text:
        ai_data = extract_contract_metadata(extracted_text)
    else:
        ai_data = {}

    # Merge AI data with user-provided overrides
    final_name = name if name else file.filename
    final_counterparty = counterparty if counterparty else ai_data.get("counterparty", "Unknown Party")
    final_type = type if type else ai_data.get("type", "Other")
    final_risk = risk if risk else ai_data.get("risk", "Medium")
    
    # Handle Date
    final_date = parsed_date
    if not final_date and ai_data.get("next_date"):
        try:
            final_date = date.fromisoformat(ai_data["next_date"])
        except ValueError:
            pass

    # Save record
    new_contract = Contract(
        name=final_name,
        counterparty=final_counterparty,
        type=final_type,
        status="Analyzed" if extracted_text else status,
        risk=final_risk,
        next_date=final_date,
        file_name=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        file_data=file_bytes,
        owner_id=current_user.id,
        summary_points=ai_data.get("summary_points", []),
        risks=ai_data.get("risks", []),
        dates_timeline=ai_data.get("dates_timeline", []),
        details_extracted=True if extracted_text else False
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract

@router.get("/", response_model=List[ContractResponse])
def get_contracts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    risk_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Contract).filter(Contract.owner_id == current_user.id)

    # Search filter by name or counterparty
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Contract.name.ilike(search_term)) |
            (Contract.counterparty.ilike(search_term))
        )

    # Status, Risk, and Type Filters
    if status_filter:
        query = query.filter(Contract.status == status_filter)
    if risk_filter:
        query = query.filter(Contract.risk == risk_filter)
    if type_filter:
        query = query.filter(Contract.type.ilike(type_filter))

    return query.order_by(Contract.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=ContractResponse)
def get_contract(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found."
        )
    return contract

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_contract(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found."
        )

    # File data is deleted when the database record is deleted

    db.delete(contract)
    db.commit()
    return {"message": "Contract deleted successfully."}

@router.get("/{id}/file")
def get_contract_file(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not contract or not contract.file_data:
        raise HTTPException(status_code=404, detail="File not found")
        
    return Response(content=contract.file_data, media_type=contract.mime_type)

@router.post("/{id}/chat")
def chat_with_contract(
    id: int,
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not contract or not contract.file_data:
        raise HTTPException(status_code=404, detail="Contract document not found")

    # Extract text on the fly (or ideally this would be cached in the DB)
    text = extract_text_from_bytes(contract.file_data, contract.file_name)
    if not text:
        raise HTTPException(
            status_code=400,
            detail="The document appears to be scanned or contains no extractable text layer. LexiCLM requires a searchable PDF or a DOCX document."
        )

    answer = ask_contract_question(text, req.question)
    return {"answer": answer}

class DatesUpdateRequest(BaseModel):
    dates_timeline: List[dict]

@router.post("/{id}/reanalyze", response_model=ContractResponse)
def reanalyze_contract(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not contract or not contract.file_data:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    text = extract_text_from_bytes(contract.file_data, contract.file_name)
    if not text:
        raise HTTPException(
            status_code=400,
            detail="The document appears to be scanned or contains no extractable text layer. LexiCLM requires a searchable PDF or a DOCX document to run deep analysis."
        )
        
    ai_data = extract_contract_metadata(text)
    
    # Update fields
    if ai_data.get("counterparty"):
        contract.counterparty = ai_data["counterparty"]
    if ai_data.get("type"):
        contract.type = ai_data["type"]
    if ai_data.get("risk"):
        contract.risk = ai_data["risk"]
        
    if ai_data.get("next_date"):
        try:
            contract.next_date = date.fromisoformat(ai_data["next_date"])
        except ValueError:
            pass
            
    contract.summary_points = ai_data.get("summary_points", [])
    contract.risks = ai_data.get("risks", [])
    contract.dates_timeline = ai_data.get("dates_timeline", [])
    contract.details_extracted = True
    contract.status = "Analyzed"
    
    db.commit()
    db.refresh(contract)
    return contract

@router.post("/compare")
def compare_contracts(
    base_id: int,
    compare_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    base_contract = db.query(Contract).filter(
        Contract.id == base_id,
        Contract.owner_id == current_user.id
    ).first()
    
    compare_contract = db.query(Contract).filter(
        Contract.id == compare_id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not base_contract or not compare_contract:
        raise HTTPException(status_code=404, detail="One or both contracts not found")
        
    base_text = extract_text_from_bytes(base_contract.file_data, base_contract.file_name)
    compare_text = extract_text_from_bytes(compare_contract.file_data, compare_contract.file_name)
    
    if not base_text or not compare_text:
        raise HTTPException(status_code=400, detail="Could not read text from one or both contracts")
        
    comparison = compare_contracts_ai(base_text, compare_text, base_contract.name, compare_contract.name)
    return comparison

@router.put("/{id}/dates", response_model=ContractResponse)
def update_contract_dates(
    id: int,
    req: DatesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == id,
        Contract.owner_id == current_user.id
    ).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    contract.dates_timeline = req.dates_timeline
    
    # Sync next_date with the next active upcoming date if any
    today_str = date.today().isoformat()
    upcoming_dates = [
        d for d in req.dates_timeline 
        if d.get("active") and d.get("date") and d.get("date") >= today_str
    ]
    if upcoming_dates:
        upcoming_dates.sort(key=lambda x: x["date"])
        try:
            contract.next_date = date.fromisoformat(upcoming_dates[0]["date"])
        except ValueError:
            pass
            
    db.commit()
    db.refresh(contract)
    return contract

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_demo_contracts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Contract).filter(
        Contract.owner_id == current_user.id,
        Contract.name.like("%ACME - SaaS Subscription Agreement%")
    ).first()
    if existing:
        return {"message": "Demo data already seeded."}

    # v1
    v1_text = (
        "ACME SaaS Subscription Agreement v1 - Signed 2025.\n\n"
        "This Agreement is entered into between ACME Inc. ('Supplier') and Customer.\n"
        "1. Term & Renewal: The initial term is 12 months. The agreement automatically renews for successive 12-month periods.\n"
        "2. Termination: Either party may terminate for cause upon 30 days written notice if the other party materially breaches any provision.\n"
        "3. Liability & Indemnity: Total liability shall not exceed 12 months of fees paid in the 12 months preceding the event giving rise to liability.\n"
        "4. Payment & Fees: Customer shall pay fees in advance annually. Late fees apply.\n"
        "5. Governing Law: This Agreement shall be governed by the laws of the State of New York.\n"
    )

    contract_v1 = Contract(
        name="ACME - SaaS Subscription Agreement (v1 - Signed 2025)",
        counterparty="ACME Inc",
        type="SaaS",
        status="Analyzed",
        risk="Low",
        next_date=date(2027, 3, 12),
        file_name="seed-v1.txt",
        mime_type="text/plain",
        file_data=v1_text.encode("utf-8"),
        owner_id=current_user.id,
        summary_points=[
            "Initial term: 12 months, auto-renews annually.",
            "Liability cap: 12 months of fees; excludes indirect damages.",
            "Termination: either party may terminate for cause upon 30 days written notice.",
            "Governing law: State of New York, USA."
        ],
        risks=[
            {"text": "Total liability cap is limited to 12 months of fees, which is standard but does not have super-caps for breaches.", "severity": "Low"},
            {"text": "Governing law is set to State of New York, which may be inconvenient if your business is based elsewhere.", "severity": "Low"}
        ],
        dates_timeline=[
            {"id": "eff_date_v1", "title": "Effective Date", "date": "2025-03-12", "badge": "Important", "active": True, "description": "This is the start date of the contract v1."},
            {"id": "term_end_v1", "title": "Initial Term End", "date": "2026-03-12", "badge": "Critical - Renewal", "active": True, "description": "This is the end of the initial contract term."},
            {"id": "renewal_v1", "title": "1st Renewal Date", "date": "2027-03-12", "badge": "Upcoming", "active": True, "description": "The contract automatically renews for successive 12-month periods."}
        ],
        details_extracted=True
    )

    # v2
    v2_text = (
        "ACME SaaS Subscription Agreement v2 - Proposed 2026.\n\n"
        "This revised Agreement is proposed by ACME Inc. ('Supplier') for the next period.\n"
        "1. Term & Renewal: The term remains 12 months. Auto-renews automatically unless 30 days notice is given.\n"
        "2. Termination: Either party may terminate for cause upon 15 days written notice (shortened cure period).\n"
        "3. Liability & Indemnity: Total liability shall not exceed 24 months of fees paid in the 12 months preceding the event, but includes unlimited liability for data breach.\n"
        "4. Payment & Fees: Customer shall pay fees in advance annually. Late fees apply.\n"
        "5. Governing Law: This Agreement shall be governed by the laws of the State of New York.\n"
    )

    contract_v2 = Contract(
        name="ACME - SaaS Subscription Agreement (v2 - Proposed 2026)",
        counterparty="ACME Inc",
        type="SaaS",
        status="Analyzed",
        risk="High",
        next_date=date(2027, 3, 12),
        file_name="seed-v2.txt",
        mime_type="text/plain",
        file_data=v2_text.encode("utf-8"),
        owner_id=current_user.id,
        summary_points=[
            "Initial term: 12 months, auto-renews annually.",
            "Liability cap: 24 months of fees; includes data breaches.",
            "Termination: either party may terminate for cause upon 15 days written notice.",
            "Notice period for non-renewal is 30 days."
        ],
        risks=[
            {"text": "Notice period for termination shortened from 30 days to 15 days, leaving less time to cure breaches.", "severity": "High"},
            {"text": "Liability cap increased to 24 months of fees, which is higher, but includes broad supplier indemnity exclusions.", "severity": "Medium"},
            {"text": "New auto-renew clause added with 30-day notice window, which may lock you in if missed.", "severity": "High"}
        ],
        dates_timeline=[
            {"id": "eff_date_v2", "title": "Effective Date", "date": "2026-03-12", "badge": "Important", "active": True, "description": "This is the start date of the contract v2."},
            {"id": "notice_deadline_v2", "title": "Non-renewal notice deadline", "date": "2027-02-10", "badge": "Critical - Renewal", "active": True, "description": "Last day to send non-renewal notice to prevent automatic roll-over."},
            {"id": "term_end_v2", "title": "Initial Term End", "date": "2027-03-12", "badge": "Important", "active": True, "description": "This is the end of the initial contract term."},
            {"id": "renewal_v2", "title": "1st Renewal Date", "date": "2028-03-12", "badge": "Upcoming", "active": True, "description": "The contract automatically renews for successive 12-month periods."},
            {"id": "retention_v2", "title": "Data retention obligation", "date": "2030-03-12", "badge": "Upcoming", "active": False, "description": "The supplier must delete or return your data within 4 years."}
        ],
        details_extracted=True
    )

    db.add(contract_v1)
    db.add(contract_v2)
    db.commit()
    return {"message": "Demo data successfully seeded."}
