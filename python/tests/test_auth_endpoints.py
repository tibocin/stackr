import pytest
from fastapi.testclient import TestClient
from python.main import app

client = TestClient(app)


def test_request_link_endpoint_should_accept_valid_email():
    """POST /auth/request-link should accept valid email and return success."""
    response = client.post("/auth/request-link", json={"email": "user@example.com"})
    
    assert response.status_code == 200, "Should return 200 for valid email"
    data = response.json()
    assert "message" in data, "Response should contain message field"
    assert "token" in data, "Response should contain token field"


def test_request_link_endpoint_should_reject_invalid_email():
    """POST /auth/request-link should reject invalid email format."""
    response = client.post("/auth/request-link", json={"email": "invalid-email"})
    
    assert response.status_code == 400, "Should return 400 for invalid email"
    data = response.json()
    assert "detail" in data, "Error response should contain detail field"


def test_verify_token_endpoint_should_accept_valid_token():
    """GET /auth/verify should accept valid token and return success."""
    # First request a link to get a token
    request_response = client.post("/auth/request-link", json={"email": "user@example.com"})
    token = request_response.json()["token"]
    
    # Then verify the token
    verify_response = client.get(f"/auth/verify?token={token}")
    
    assert verify_response.status_code == 200, "Should return 200 for valid token"
    data = verify_response.json()
    assert "message" in data, "Response should contain message field"
    assert data["message"] == "Token verified successfully", "Should confirm verification"


def test_verify_token_endpoint_should_reject_invalid_token():
    """GET /auth/verify should reject invalid token."""
    response = client.get("/auth/verify?token=fake-invalid-token")
    
    assert response.status_code == 400, "Should return 400 for invalid token"
    data = response.json()
    assert "detail" in data, "Error response should contain detail field" 