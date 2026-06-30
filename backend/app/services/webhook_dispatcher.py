import json
import httpx
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.webhook import Webhook


def dispatch_event(event_name: str, payload: dict, db: Session, owner_id: int) -> None:
    """
    Fires all active webhooks for the given owner that subscribed to this event.
    Runs synchronously (fire-and-forget with a short timeout).
    """
    webhooks = db.query(Webhook).filter(
        Webhook.owner_id == owner_id,
        Webhook.is_active == True
    ).all()

    for wh in webhooks:
        subscribed_events = wh.events or []
        if event_name not in subscribed_events:
            continue

        full_payload = {
            "event": event_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": payload,
        }

        try:
            httpx.post(
                wh.url,
                json=full_payload,
                headers={"Content-Type": "application/json", "X-VelFlow-Event": event_name},
                timeout=5.0,
            )
        except Exception as e:
            print(f"[webhook_dispatcher] Failed to deliver event '{event_name}' to {wh.url}: {e}")


def send_test_payload(webhook_url: str, webhook_name: str) -> dict:
    """
    Sends a test payload to the given webhook URL for verification.
    """
    payload = {
        "event": "webhook.test",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "message": f"Test delivery from VelFlow for webhook '{webhook_name}'",
            "status": "ok",
        },
    }

    try:
        resp = httpx.post(
            webhook_url,
            json=payload,
            headers={"Content-Type": "application/json", "X-VelFlow-Event": "webhook.test"},
            timeout=8.0,
        )
        return {
            "success": True,
            "status_code": resp.status_code,
            "message": f"Delivered successfully (HTTP {resp.status_code})",
        }
    except Exception as e:
        return {
            "success": False,
            "status_code": None,
            "message": f"Delivery failed: {str(e)}",
        }
