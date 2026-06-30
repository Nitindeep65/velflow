import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import Base, get_db
from app.services.auth import get_current_user
from app.models.user import User

# Setup a clean in-memory sqlite DB for test run
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crm.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Re-create database schemas
Base.metadata.create_all(bind=engine)

# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create a mock user
db = TestingSessionLocal()
mock_user = db.query(User).filter(User.email == "crm.tester@example.com").first()
if not mock_user:
    from app.services.auth import get_password_hash
    mock_user = User(
        email="crm.tester@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="CRM Tester"
    )
    db.add(mock_user)
    db.commit()
    db.refresh(mock_user)

# Override get_current_user dependency to bypass JWT for testing
def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_crm_endpoints():
    print("🚀 Running CRM API Integration Tests...")

    # 1. Test Seed Endpoint
    print("\n1. Seeding CRM data...")
    resp = client.post("/api/crm/seed")
    assert resp.status_code == 200, f"Seed failed: {resp.text}"
    print("✅ Seed successful!")
    print(resp.json())

    # 2. Test Get Counterparties
    print("\n2. Getting counterparties list...")
    resp = client.get("/api/crm/counterparties")
    assert resp.status_code == 200, f"Get counterparties failed: {resp.text}"
    cps = resp.json()
    assert len(cps) >= 4, f"Expected at least 4 seeded counterparties, got {len(cps)}"
    print(f"✅ Found {len(cps)} counterparties.")
    acme_id = next(c["id"] for c in cps if c["company_name"] == "Acme Corporation")
    print(f"Acme Corp ID: {acme_id}")

    # 3. Test Get Pipelines
    print("\n3. Getting deal pipelines list...")
    resp = client.get("/api/crm/pipelines")
    assert resp.status_code == 200, f"Get pipelines failed: {resp.text}"
    pipelines = resp.json()
    assert len(pipelines) >= 5, f"Expected at least 5 seeded pipelines, got {len(pipelines)}"
    print(f"✅ Found {len(pipelines)} deals.")
    acme_deal = next(p for p in pipelines if p["deal_name"] == "Acme Enterprise SaaS Subscription")
    assert acme_deal["value"] == 120000.0, "Expected Acme subscription value to be 120000"
    print(f"Acme Deal stage: {acme_deal['stage']}, value: {acme_deal['value']}")

    # 4. Create custom Counterparty
    print("\n4. Creating custom counterparty...")
    cp_data = {
        "company_name": "Test Partner Ltd",
        "primary_contact_email": "hello@testpartner.com",
        "industry": "Tech Education",
        "notes": "Testing note attributes"
    }
    resp = client.post("/api/crm/counterparties", json=cp_data)
    assert resp.status_code == 201, f"Create counterparty failed: {resp.text}"
    new_cp = resp.json()
    new_cp_id = new_cp["id"]
    assert new_cp["company_name"] == "Test Partner Ltd"
    print("✅ Custom counterparty created successfully!")
    print(new_cp)

    # 5. Create custom Pipeline Deal linked to custom Counterparty
    print("\n5. Creating custom deal pipeline card...")
    deal_data = {
        "deal_name": "Test Custom Integration Deal",
        "value": 15000.50,
        "stage": "Drafting",
        "counterparty_id": new_cp_id
    }
    resp = client.post("/api/crm/pipelines", json=deal_data)
    assert resp.status_code == 201, f"Create pipeline failed: {resp.text}"
    new_deal = resp.json()
    new_deal_id = new_deal["id"]
    assert new_deal["deal_name"] == "Test Custom Integration Deal"
    assert new_deal["counterparty_name"] == "Test Partner Ltd"
    print("✅ Custom deal pipeline created successfully!")
    print(new_deal)

    # 6. Update Pipeline Stage (e.g. Move Drafting -> In Negotiation)
    print("\n6. Moving deal card stage...")
    update_data = {
        "stage": "In Negotiation"
    }
    resp = client.put(f"/api/crm/pipelines/{new_deal_id}", json=update_data)
    assert resp.status_code == 200, f"Update stage failed: {resp.text}"
    updated_deal = resp.json()
    assert updated_deal["stage"] == "In Negotiation"
    print("✅ Deal card moved successfully!")
    print(updated_deal)

    # 7. Delete Deal
    print("\n7. Deleting custom deal...")
    resp = client.delete(f"/api/crm/pipelines/{new_deal_id}")
    assert resp.status_code == 204, f"Delete deal failed: {resp.text}"
    print("✅ Deal deleted successfully!")

    # 8. Delete Counterparty
    print("\n8. Deleting custom counterparty...")
    resp = client.delete(f"/api/crm/counterparties/{new_cp_id}")
    assert resp.status_code == 204, f"Delete counterparty failed: {resp.text}"
    print("✅ Counterparty deleted successfully!")

    print("\n🎉 ALL CRM API ENDPOINT TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    try:
        test_crm_endpoints()
    finally:
        # Clean up database file
        db.close()
        if os.path.exists("./test_crm.db"):
            os.remove("./test_crm.db")
            print("\nCleaned up database: ./test_crm.db")
