import pytest

# Import the AuthService once it exists
from python.services.auth_service import AuthService


def test_send_link_should_return_token():
    """AuthService.send_link() should return a non-empty token string."""
    service = AuthService()
    token = service.send_link("user@example.com")

    assert isinstance(token, str), "send_link should return a string token"
    assert token, "Token should not be empty" 