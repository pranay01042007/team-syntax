import jwt
from app.core.config import settings

def test_global_security_headers_present(client):
    """Test that all API responses contain the mandatory security headers."""
    response = client.get("/api/products")
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert "default-src" in response.headers.get("content-security-policy", "")
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

def test_password_hash_never_exposed(client, test_users, auth_headers):
    """Ensure password hashes are never serialized or returned in user responses."""
    headers = auth_headers(test_users["customer1"])
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "password" not in data
    assert "password_hash" not in data

def test_forged_jwt_token_rejected(client):
    """Ensure tokens signed with a different key are strictly rejected."""
    fake_token = jwt.encode({"sub": "1", "role": "ADMIN"}, "fake-secret-key", algorithm="HS256")
    headers = {"Authorization": f"Bearer {fake_token}"}
    response = client.get("/api/admin/dashboard", headers=headers)
    assert response.status_code == 401

def test_deactivated_user_blocked(client, test_users, auth_headers, db_session):
    """Ensure deactivated accounts are forbidden from making authenticated calls."""
    cust = test_users["customer2"]
    cust.is_active = False
    db_session.commit()

    headers = auth_headers(cust)
    response = client.get("/api/cart", headers=headers)
    assert response.status_code == 403
