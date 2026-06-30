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
from app.models.contract import Contract

# Setup a clean in-memory sqlite DB for test run
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crm_collaboration.db"
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
mock_user = db.query(User).filter(User.email == "collab.tester@example.com").first()
if not mock_user:
    from app.services.auth import get_password_hash
    mock_user = User(
        email="collab.tester@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Collab Tester"
    )
    db.add(mock_user)
    db.commit()
    db.refresh(mock_user)

# Create a mock contract for testing comments and signing
mock_contract = db.query(Contract).filter(Contract.name == "Collab NDA").first()
if not mock_contract:
    mock_contract = Contract(
        name="Collab NDA",
        counterparty="Globex Legal",
        type="NDA",
        status="Uploaded",
        file_name="collab-nda.txt",
        mime_type="text/plain",
        file_data=b"Clause 1: Disclose information. Clause 2: Keep secrets. Clause 3: Delaware Law.",
        owner_id=mock_user.id
    )
    db.add(mock_contract)
    db.commit()
    db.refresh(mock_contract)

# Override get_current_user dependency to bypass JWT for testing
def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_collaboration_and_signing():
    print("🚀 Running CRM Collaboration & Signing API Integration Tests...")
    contract_id = mock_contract.id

    # 1. Test Commenting API
    print("\n1. Posting redline clause comment...")
    comment_data = {
        "text": "Change Delaware Law to California Law.",
        "clause_index": 2,
        "author_name": "Globex Legal Counsel"
    }
    resp = client.post(f"/api/contracts/{contract_id}/comments", json=comment_data)
    assert resp.status_code == 200, f"Comment failed: {resp.text}"
    c = resp.json()
    assert c["text"] == "Change Delaware Law to California Law."
    assert c["clause_index"] == 2
    assert c["author_name"] == "Globex Legal Counsel"
    print("✅ Redline comment posted successfully!")
    print(c)

    # 2. Test Get Comments List
    print("\n2. Fetching redlines timeline thread...")
    resp = client.get(f"/api/contracts/{contract_id}/comments")
    assert resp.status_code == 200, f"Get comments failed: {resp.text}"
    comments = resp.json()
    assert len(comments) == 1
    print(f"✅ Found {len(comments)} comments.")

    # 3. Test Public Shared Details endpoint
    print("\n3. Testing public shared portal access...")
    resp = client.get(f"/api/contracts/{contract_id}/share")
    assert resp.status_code == 200, f"Public share failed: {resp.text}"
    share = resp.json()
    assert share["name"] == "Collab NDA"
    assert "Delaware Law" in share["text"]
    print("✅ Public shared portal endpoint details match!")
    print(share)

    # 4. Test E-Sign Agreement
    print("\n4. E-Signing agreement...")
    sig_data = {
        "signer_name": "Alice Counsel",
        "signer_email": "alice@globex.com",
        "signature_svg": "AliceSignatureCoordinates",
        "ip_address": "192.168.1.100"
    }
    resp = client.post(f"/api/contracts/{contract_id}/sign", json=sig_data)
    assert resp.status_code == 200, f"Sign failed: {resp.text}"
    sig = resp.json()
    assert sig["signer_name"] == "Alice Counsel"
    assert sig["signer_email"] == "alice@globex.com"
    assert sig["verification_token"] is not None
    print("✅ Document e-signed and verification token generated!")
    print(sig)

    # 5. Verify contract status is now Signed
    print("\n5. Checking contract status updates...")
    resp = client.get(f"/api/contracts/{contract_id}/share")
    assert resp.status_code == 200
    assert resp.json()["status"] == "Signed"
    print("✅ Verification: Contract status has transitioned to 'Signed'.")

    # 6. Test Get Signatures list
    print("\n6. Retrieving cryptographic signing certificates...")
    resp = client.get(f"/api/contracts/{contract_id}/signatures")
    assert resp.status_code == 200, f"Get signatures failed: {resp.text}"
    sigs = resp.json()
    assert len(sigs) == 1
    assert sigs[0]["verification_token"] is not None
    print(f"✅ Found {len(sigs)} valid signature log.")

    print("\n🎉 ALL COLLABORATION & SIGNING API TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    try:
        test_collaboration_and_signing()
    finally:
        # Clean up database file
        db.close()
        if os.path.exists("./test_crm_collaboration.db"):
            os.remove("./test_crm_collaboration.db")
            print("\nCleaned up database: ./test_crm_collaboration.db")
