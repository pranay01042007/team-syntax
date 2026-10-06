def test_health_check_returns_200_and_correct_data(client):
    """Test health endpoint responds with 200 and baseline data."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "MarketHub API"

def test_health_check_security_headers(client):
    """Test required security headers on health endpoint."""
    response = client.get("/health")
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-content-type-options") == "nosniff"
