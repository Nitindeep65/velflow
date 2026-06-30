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
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crm_tasks.db"
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
mock_user = db.query(User).filter(User.email == "tasks.tester@example.com").first()
if not mock_user:
    from app.services.auth import get_password_hash
    mock_user = User(
        email="tasks.tester@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Tasks Tester"
    )
    db.add(mock_user)
    db.commit()
    db.refresh(mock_user)

# Override get_current_user dependency to bypass JWT for testing
def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_tasks_and_drafting():
    print("🚀 Running CRM Tasks & AI Drafting API Integration Tests...")

    # 1. Test Custom Task Creation
    print("\n1. Creating task obligation...")
    task_data = {
        "title": "Review NDA SLA provisions",
        "description": "Examine liability parameters under Section 4.",
        "due_date": "2026-07-15",
        "completed": False
    }
    resp = client.post("/api/crm/tasks", json=task_data)
    assert resp.status_code == 201, f"Create task failed: {resp.text}"
    task = resp.json()
    task_id = task["id"]
    assert task["title"] == "Review NDA SLA provisions"
    assert task["completed"] is False
    print("✅ Custom task created successfully!")
    print(task)

    # 2. Test Get Tasks List
    print("\n2. Getting active tasks list...")
    resp = client.get("/api/crm/tasks")
    assert resp.status_code == 200, f"Get tasks failed: {resp.text}"
    tasks = resp.json()
    assert len(tasks) >= 1, "Expected created task in the list"
    print(f"✅ Found {len(tasks)} tasks.")

    # 3. Test Toggle Task Completed status
    print("\n3. Toggling task completion...")
    update_data = {
        "completed": True
    }
    resp = client.put(f"/api/crm/tasks/{task_id}", json=update_data)
    assert resp.status_code == 200, f"Toggle completed failed: {resp.text}"
    updated_task = resp.json()
    assert updated_task["completed"] is True
    print("✅ Task toggled successfully!")
    print(updated_task)

    # 4. Test AI Draft Generation endpoint
    print("\n4. Testing contract draft generator endpoint...")
    draft_data = {
        "template_type": "NDA",
        "variables": {
            "disclosing_party": "Test Disclosing Inc",
            "receiving_party": "Test Receiving LLC",
            "effective_date": "2026-07-01",
            "purpose": "discussing partnership opportunities",
            "term": "5 years",
            "governing_law": "Delaware"
        }
    }
    resp = client.post("/api/contracts/generate", json=draft_data)
    assert resp.status_code == 200, f"Draft generation failed: {resp.text}"
    draft_resp = resp.json()
    assert "draft" in draft_resp, "Generated draft text missing"
    assert "MUTUAL NON-DISCLOSURE AGREEMENT" in draft_resp["draft"], "NDA title not found in draft"
    print("✅ Contract draft generated successfully!")
    print(draft_resp["draft"][:200] + "...\n[TRUNCATED]")

    # 5. Delete Task
    print("\n5. Deleting task...")
    resp = client.delete(f"/api/crm/tasks/{task_id}")
    assert resp.status_code == 204, f"Delete task failed: {resp.text}"
    print("✅ Task deleted successfully!")

    # Verify task list is empty
    resp = client.get("/api/crm/tasks")
    assert resp.status_code == 200
    assert len(resp.json()) == 0, "Expected task list to be empty"
    print("✅ Verification: Task list empty.")

    print("\n🎉 ALL TASKS & DRAFTING INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    try:
        test_tasks_and_drafting()
    finally:
        # Clean up database file
        db.close()
        if os.path.exists("./test_crm_tasks.db"):
            os.remove("./test_crm_tasks.db")
            print("\nCleaned up database: ./test_crm_tasks.db")
