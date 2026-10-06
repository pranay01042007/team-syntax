from app.models.entities import User

def test_customer_registration_success(client, db_session):
    payload = {
        "name": "Alice Green",
        "email": "alice@example.com",
        "password": "Password123!",
        "role": "CUSTOMER"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["role"] == "CUSTOMER"

    # Verify password is not plaintext in database
    user = db_session.query(User).filter(User.email == "alice@example.com").first()
    assert user is not None
    assert user.password_hash != "Password123!"
    assert user.password_hash.startswith("$2")  # bcrypt hash

def test_vendor_registration_success(client, db_session):
    payload = {
        "name": "Bob Craftsman",
        "email": "bob@crafts.com",
        "password": "Password123!",
        "role": "VENDOR",
        "store_name": "Bob Woodworks"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "VENDOR"

def test_duplicate_registration_rejected(client, test_users):
    payload = {
        "name": "Duplicate Tester",
        "email": test_users["customer1"].email,
        "password": "Password123!",
        "role": "CUSTOMER"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409

def test_admin_public_registration_rejected(client):
    payload = {
        "name": "Attacker",
        "email": "attacker@example.com",
        "password": "Password123!",
        "role": "ADMIN"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422

def test_login_success(client, test_users):
    payload = {
        "email": test_users["customer1"].email,
        "password": "CustomerPass123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_users["customer1"].email

def test_login_invalid_password_rejected(client, test_users):
    payload = {
        "email": test_users["customer1"].email,
        "password": "WrongPassword123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_protected_me_rejects_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
