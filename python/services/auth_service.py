from __future__ import annotations

"""python/services/auth_service.py

Service layer for authentication-related operations.
Currently supports magic-link email login.

PURPOSE: Provide methods for sending and verifying magic-link tokens.
RELATED: FastAPI auth endpoints, crypto_utils for secret encryption
TAGS: auth, magic-link, service-layer
"""

from typing import Final
import re

EMAIL_REGEX: Final[re.Pattern[str]] = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AuthService:
    """Service responsible for magic-link authentication.

    Notes
    -----
    This is a *stub* implementation created as part of the atomic
    development process. Real logic (token generation, persistence,
    email dispatch) will be added in a subsequent commit.
    """

    def send_link(self, email: str) -> str:  # noqa: D401
        """Send a magic-login link to *email* and return the token.

        Parameters
        ----------
        email : str
            Target email to receive the login link.

        Edge Cases
        ----------
        • Invalid email format → raises :class:`ValueError`.
        • Excessive requests (rate-limit) → *not implemented yet*.

        Returns
        -------
        str
            One-time token to be embedded in the magic link. Empty string in
            stub to ensure unit test currently fails.
        """
        if not EMAIL_REGEX.match(email):
            raise ValueError("Invalid email format")

        # TODO: Generate cryptographically-secure token, persist, dispatch email
        return "" 