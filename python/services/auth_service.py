"""
Stackr Authentication Service

PURPOSE: Handles magic link authentication for secure user access
RELATED: main.py, FastAPI endpoints, security
TAGS: authentication, security, magic-link
"""

import secrets
import time
from typing import Dict, Optional
from datetime import datetime, timedelta

class AuthService:
    """Authentication service for magic link generation and verification."""
    
    def __init__(self):
        """Initialize the authentication service."""
        # In-memory token storage (replace with database in production)
        self._tokens: Dict[str, Dict] = {}
        self._token_expiry_hours = 24
    
    def send_link(self, email: str) -> str:
        """
        Generate and store a magic link token for the given email.
        
        Args:
            email: User's email address
            
        Returns:
            str: Generated token
            
        Raises:
            ValueError: If email is invalid or empty
        """
        if not email or '@' not in email:
            raise ValueError("Invalid email address")
        
        # Generate a secure random token
        token = secrets.token_urlsafe(32)
        
        # Store token with metadata
        self._tokens[token] = {
            'email': email,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(hours=self._token_expiry_hours),
            'used': False
        }
        
        # In production, send email here
        print(f"Magic link generated for {email}: {token}")
        
        return token
    
    def verify_token(self, token: str) -> bool:
        """
        Verify if a token is valid and not expired.
        
        Args:
            token: Token to verify
            
        Returns:
            bool: True if token is valid, False otherwise
        """
        if not token or token not in self._tokens:
            return False
        
        token_data = self._tokens[token]
        
        # Check if token is expired
        if datetime.now() > token_data['expires_at']:
            # Clean up expired token
            del self._tokens[token]
            return False
        
        # Check if token has been used
        if token_data['used']:
            return False
        
        # Mark token as used
        token_data['used'] = True
        
        return True
    
    def get_token_info(self, token: str) -> Optional[Dict]:
        """
        Get information about a token without marking it as used.
        
        Args:
            token: Token to check
            
        Returns:
            Optional[Dict]: Token information or None if invalid
        """
        if not token or token not in self._tokens:
            return None
        
        token_data = self._tokens[token].copy()
        token_data['email'] = token_data['email']  # Keep email for reference
        
        return token_data
    
    def cleanup_expired_tokens(self) -> int:
        """
        Remove expired tokens from storage.
        
        Returns:
            int: Number of tokens removed
        """
        current_time = datetime.now()
        expired_tokens = [
            token for token, data in self._tokens.items()
            if current_time > data['expires_at']
        ]
        
        for token in expired_tokens:
            del self._tokens[token]
        
        return len(expired_tokens) 
