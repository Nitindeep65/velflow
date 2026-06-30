"""
Integration tests for Webhook Management API
Uses in-memory SQLite + dependency overrides (no JWT needed)
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.services.auth import get_current_user, get_password_hash
from app.models.user import User

# ── In-Memory Test DB Setup ───────────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_webhooks.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

db = TestingSessionLocal()
mock_user = db.query(User).filter(User.email == "webhook.tester@velflow.dev").first()
if not mock_user:
    mock_user = User(
        email="webhook.tester@velflow.dev",
        hashed_password=get_password_hash("testpassword"),
        full_name="Webhook Tester"
    )
    db.add(mock_user)
    db.commit()
    db.refresh(mock_user)

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


def test_full_webhook_flow():
    print("\n🚀 Running Webhook API Integration Tests...\n")

    # 1. List allowed events
    print("1. Fetching allowed webhook event types...")
    resp = client.get("/api/webhooks/events")
    assert resp.status_code == 200
    events_data = resp.json()
    assert "events" in events_data
    allowed_events = events_data["events"]
    print(f"   ✅ Found {len(allowed_events)} allowed event types: {allowed_events}")

    # 2. Create a webhook
    print("\n2. Creating a webhook endpoint...")
    resp = client.post("/api/webhooks", json={
        "name": "Test Server Endpoint",
        "url": "https://webhook.site/test-velflow",
        "events": ["contract.signed", "contract.uploaded"],
        "is_active": True
    })
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    webhook = resp.json()
    wh_id = webhook["id"]
    print(f"   ✅ Webhook created! ID: {wh_id}, Name: {webhook['name']}")

    # 3. List webhooks
    print("\n3. Listing all webhooks...")
    resp = client.get("/api/webhooks")
    assert resp.status_code == 200
    webhooks = resp.json()
    assert len(webhooks) >= 1
    print(f"   ✅ Found {len(webhooks)} webhook(s).")

    # 4. Update webhook (disable)
    print("\n4. Disabling webhook...")
    resp = client.put(f"/api/webhooks/{wh_id}", json={"is_active": False})
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["is_active"] == False
    print(f"   ✅ Webhook disabled. is_active: {updated['is_active']}")

    # 5. Invalid event type rejection
    print("\n5. Testing invalid event type rejection (expect 400)...")
    resp = client.post("/api/webhooks", json={
        "name": "Invalid Events",
        "url": "https://example.com/hook",
        "events": ["invalid.event.type"]
    })
    assert resp.status_code == 400
    print("   ✅ Correctly rejected invalid event type with 400.")

    # 6. Delete webhook
    print("\n6. Deleting webhook...")
    resp = client.delete(f"/api/webhooks/{wh_id}")
    assert resp.status_code == 204
    print("   ✅ Webhook deleted successfully.")

    # 7. Verify deletion
    resp = client.get("/api/webhooks")
    remaining = [w for w in resp.json() if w["id"] == wh_id]
    assert len(remaining) == 0
    print("   ✅ Webhook no longer listed.")

    print("\n🎉 ALL WEBHOOK API TESTS PASSED SUCCESSFULLY! 🎉\n")


if __name__ == "__main__":
    test_full_webhook_flow()
