from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.playbook import Playbook
from app.models.contract import Contract
from app.schemas.playbook import (
    PlaybookCreate, PlaybookUpdate, PlaybookResponse,
    PlaybookCheckResponse, PlaybookViolation
)
from app.services.auth import get_current_user
from app.services.ai import check_contract_against_playbook
from app.utils.document import extract_text_from_bytes

router = APIRouter(prefix="/api/playbook", tags=["playbook"])


@router.get("", response_model=List[PlaybookResponse])
def get_playbooks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Playbook).filter(Playbook.owner_id == current_user.id).all()


@router.post("", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
def create_playbook(
    schema: PlaybookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_rule = Playbook(**schema.model_dump(), owner_id=current_user.id)
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.put("/{id}", response_model=PlaybookResponse)
def update_playbook(
    id: int,
    schema: PlaybookUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rule = db.query(Playbook).filter(
        Playbook.id == id, Playbook.owner_id == current_user.id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Playbook rule not found")
    for k, v in schema.model_dump(exclude_unset=True).items():
        setattr(rule, k, v)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playbook(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rule = db.query(Playbook).filter(
        Playbook.id == id, Playbook.owner_id == current_user.id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Playbook rule not found")
    db.delete(rule)
    db.commit()


@router.post("/check/{contract_id}", response_model=PlaybookCheckResponse)
def check_contract(
    contract_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.owner_id == current_user.id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    rules = db.query(Playbook).filter(Playbook.owner_id == current_user.id).all()
    if not rules:
        return PlaybookCheckResponse(
            contract_id=contract_id,
            total_violations=0,
            violations=[],
            overall_compliance="Pass"
        )

    # Extract text from contract file
    contract_text = ""
    if contract.file_data:
        try:
            contract_text = extract_text_from_bytes(contract.file_data, contract.file_name)
        except Exception:
            contract_text = ""

    rules_dicts = [
        {
            "rule_category": r.rule_category,
            "preferred_terms": r.preferred_terms,
            "forbidden_terms": r.forbidden_terms,
            "risk_level": r.risk_level,
        }
        for r in rules
    ]

    raw_violations = check_contract_against_playbook(contract_text, rules_dicts)

    violations = [PlaybookViolation(**v) for v in raw_violations]

    high_count = sum(1 for v in violations if v.severity == "High")
    overall = "Fail" if high_count > 0 else ("Warning" if violations else "Pass")

    return PlaybookCheckResponse(
        contract_id=contract_id,
        total_violations=len(violations),
        violations=violations,
        overall_compliance=overall
    )
