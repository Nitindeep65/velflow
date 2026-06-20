import os
import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_backend_flow():
    print("🚀 Starting LexiCLM API Integration Tests...")

    # Define test user credentials
    email = "test.user@example.com"
    password = "securepassword123"
    full_name = "Test User"

    # Define HTTP client
    with httpx.Client(base_url=BASE_URL, timeout=10.0, follow_redirects=True) as client:
        # 0. Health check
        print("\n1. Checking health endpoint...")
        resp = client.get("/")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        print("✅ Health check success!")
        print(resp.json())

        # 1. Signup
        print("\n2. Testing Registration /Signup...")
        signup_data = {
            "email": email,
            "password": password,
            "full_name": full_name
        }
        resp = client.post("/api/auth/signup", json=signup_data)
        if resp.status_code == 400 and "already exists" in resp.text:
            print("⚠️ User already exists. Proceeding to login...")
        else:
            assert resp.status_code == 201, f"Signup failed: {resp.text}"
            print("✅ User registered successfully!")
            print(resp.json())

        # 2. Login
        print("\n3. Testing Login /Token generation...")
        login_data = {
            "username": email,
            "password": password
        }
        resp = client.post("/api/auth/token", data=login_data)
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        token_info = resp.json()
        token = token_info["access_token"]
        assert token, "Token not received"
        print("✅ Login success! JWT Token received.")

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Create dummy contract file for upload
        dummy_filename = "test_contract.pdf"
        with open(dummy_filename, "w") as f:
            f.write("Dummy PDF Contract text content for testing risk analysis...")
        print(f"\nCreated dummy file: {dummy_filename}")

        # 4. Upload Contract
        print("\n4. Testing Contract Upload...")
        contract_metadata = {
            "name": "BetaCorp Consulting Service Agreement",
            "counterparty": "BetaCorp Inc",
            "type": "Consulting",
            "status": "Needs Review",
            "risk": "High",
            "next_date": "2026-09-01"
        }

        try:
            with open(dummy_filename, "rb") as f:
                files = {"file": (dummy_filename, f, "application/pdf")}
                resp = client.post(
                    "/api/contracts/upload",
                    data=contract_metadata,
                    files=files,
                    headers=headers
                )
            
            assert resp.status_code == 201, f"Upload failed: {resp.text}"
            uploaded_contract = resp.json()
            contract_id = uploaded_contract["id"]
            assert contract_id, "Uploaded contract ID missing"
            print("✅ Contract uploaded successfully!")
            print(uploaded_contract)
            
            # 5. List Contracts
            print("\n5. Testing List Contracts...")
            resp = client.get("/api/contracts", headers=headers)
            assert resp.status_code == 200, f"List failed: {resp.text}"
            contracts_list = resp.json()
            assert len(contracts_list) >= 1, "Uploaded contract not in list"
            print(f"✅ Found {len(contracts_list)} contracts in database.")

            # 6. Search Contracts
            print("\n6. Testing Search Filtering...")
            resp = client.get("/api/contracts", params={"search": "BetaCorp"}, headers=headers)
            assert resp.status_code == 200, f"Search failed: {resp.text}"
            search_results = resp.json()
            assert len(search_results) >= 1, "Search didn't find contract"
            print(f"✅ Search success! Found contract by search term 'BetaCorp'.")

            # 7. Get specific contract
            print("\n7. Testing Get Contract Detail...")
            resp = client.get(f"/api/contracts/{contract_id}", headers=headers)
            assert resp.status_code == 200, f"Get detail failed: {resp.text}"
            print("✅ Fetch detail success!")
            print(resp.json())

            # 8. Delete Contract
            print("\n8. Testing Contract Deletion...")
            resp = client.delete(f"/api/contracts/{contract_id}", headers=headers)
            assert resp.status_code == 200, f"Delete failed: {resp.text}"
            print("✅ Contract deletion success!")
            print(resp.json())

            # Verify deletion from DB
            resp = client.get(f"/api/contracts/{contract_id}", headers=headers)
            assert resp.status_code == 404, "Contract was not deleted from DB"
            print("✅ Verified deletion from Database (HTTP 404).")



        finally:
            # Clean up dummy test file from directory
            if os.path.exists(dummy_filename):
                os.remove(dummy_filename)
                print(f"\nCleaned up local test file: {dummy_filename}")

    print("\n🎉 ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    test_backend_flow()
