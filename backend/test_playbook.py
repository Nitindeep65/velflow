"""
Integration tests for Playbook Guard API
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
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_playbook.db"
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
mock_user = db.query(User).filter(User.email == "playbook.tester@velflow.dev").first()
if not mock_user:
    mock_user = User(
        email="playbook.tester@velflow.dev",
        hashed_password=get_password_hash("testpassword"),
        full_name="Playbook Tester"
    )
    db.add(mock_user)
    db.commit()
    db.refresh(mock_user)

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


def test_full_playbook_flow():
    print("\n🚀 Running Playbook API Integration Tests...\n")

    # 1. Create a playbook rule
    print("1. Creating a playbook rule...")
    resp = client.post("/api/playbook", json={
        "rule_category": "Governing Law",
        "preferred_terms": "Delaware",
        "forbidden_terms": "unlimited liability",
        "risk_level": "High"
    })
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    rule = resp.json()
    rule_id = rule["id"]
    print(f"   ✅ Rule created! ID: {rule_id}, Category: {rule['rule_category']}")

    # 2. List playbook rules
    print("\n2. Fetching all playbook rules...")
    resp = client.get("/api/playbook")
    assert resp.status_code == 200
    rules = resp.json()
    assert len(rules) >= 1
    print(f"   ✅ Found {len(rules)} rule(s).")

    # 3. Update a rule
    print("\n3. Updating playbook rule risk level...")
    resp = client.put(f"/api/playbook/{rule_id}", json={"risk_level": "Medium"})
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["risk_level"] == "Medium"
    print(f"   ✅ Rule updated! New risk level: {updated['risk_level']}")

    # 4. Check compliance on a non-existent contract → 404
    print("\n4. Running compliance check on unknown contract (expect 404)...")
    resp = client.post("/api/playbook/check/99999")
    assert resp.status_code == 404
    print("   ✅ Correctly returned 404 for missing contract.")

    # 5. Delete the rule
    print("\n5. Deleting playbook rule...")
    resp = client.delete(f"/api/playbook/{rule_id}")
    assert resp.status_code == 204
    print("   ✅ Rule deleted successfully.")

    # 6. Confirm deletion
    resp = client.get("/api/playbook")
    remaining = [r for r in resp.json() if r["id"] == rule_id]
    assert len(remaining) == 0
    print("   ✅ Rule no longer listed.")

    # 7. Request compliance rephrase suggestions
    print("\n7. Requesting compliance clause suggestion...")
    resp = client.post("/api/playbook/suggest-alternative", json={
        "rule_category": "Governing Law",
        "violation": "Required term missing: Delaware",
        "clause_text": "This contract shall be subject to the laws of California.",
        "preferred_terms": "Delaware",
        "forbidden_terms": "California"
    })
    assert resp.status_code == 200
    suggestion = resp.json()
    assert "suggested_alternative" in suggestion
    assert len(suggestion["suggested_alternative"]) > 0
    print(f"   ✅ Suggestion generated successfully: '{suggestion['suggested_alternative']}'")

    print("\n🎉 ALL PLAYBOOK API TESTS PASSED SUCCESSFULLY! 🎉\n")


if __name__ == "__main__":
    test_full_playbook_flow()
