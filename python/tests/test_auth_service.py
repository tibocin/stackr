import pytest

# Import the AuthService once it exists
from python.services.auth_service import AuthService


def test_send_link_should_return_token():
    """AuthService.send_link() should return a non-empty token string."""
    service = AuthService()
    token = service.send_link("user@example.com")

    assert isinstance(token, str), "send_link should return a string token"
    assert token, "Token should not be empty"


def test_verify_token_should_validate_valid_token():
    """AuthService.verify_token() should return True for valid tokens."""
    service = AuthService()
    
    # First send a link to get a token
    token = service.send_link("user@example.com")
    
    # Then verify the token
    is_valid = service.verify_token(token)
    
    assert is_valid is True, "Valid token should return True"


def test_verify_token_should_reject_invalid_token():
    """AuthService.verify_token() should return False for invalid tokens."""
    service = AuthService()
    
    # Try to verify a fake token
    is_valid = service.verify_token("fake-invalid-token")
    
    assert is_valid is False, "Invalid token should return False" 