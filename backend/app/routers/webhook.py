from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.webhook import Webhook
from app.schemas.webhook import WebhookCreate, WebhookUpdate, WebhookResponse
from app.services.auth import get_current_user
from app.services.webhook_dispatcher import send_test_payload

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

ALLOWED_EVENTS = [
    "contract.uploaded",
    "contract.analyzed",
    "contract.signed",
    "contract.updated",
    "pipeline.stage_changed",
]


@router.get("", response_model=List[WebhookResponse])
def list_webhooks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Webhook).filter(Webhook.owner_id == current_user.id).all()


@router.post("", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
def create_webhook(
    schema: WebhookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate events
    for event in schema.events:
        if event not in ALLOWED_EVENTS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid event '{event}'. Allowed: {ALLOWED_EVENTS}"
            )

    wh = Webhook(
        name=schema.name,
        url=schema.url,
        events=schema.events,
        is_active=schema.is_active if schema.is_active is not None else True,
        owner_id=current_user.id,
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


@router.put("/{id}", response_model=WebhookResponse)
def update_webhook(
    id: int,
    schema: WebhookUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wh = db.query(Webhook).filter(
        Webhook.id == id, Webhook.owner_id == current_user.id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Webhook not found")
    for k, v in schema.model_dump(exclude_unset=True).items():
        setattr(wh, k, v)
    db.commit()
    db.refresh(wh)
    return wh


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_webhook(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wh = db.query(Webhook).filter(
        Webhook.id == id, Webhook.owner_id == current_user.id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Webhook not found")
    db.delete(wh)
    db.commit()


@router.post("/test/{id}")
def test_webhook(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wh = db.query(Webhook).filter(
        Webhook.id == id, Webhook.owner_id == current_user.id
    ).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Webhook not found")

    result = send_test_payload(wh.url, wh.name)
    return result


@router.get("/events")
def list_allowed_events():
    """Returns the list of all supported webhook event types."""
    return {"events": ALLOWED_EVENTS}
