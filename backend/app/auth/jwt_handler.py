"""
JWT authentication handler — extracts and validates tokens from requests.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError

security_scheme = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> int:
    """
    FastAPI dependency that extracts the user ID from a JWT token.
    Raises 401 if the token is invalid or expired.
    """
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise AuthenticationError("Invalid or expired token.")

    user_id = payload.get("sub")
    if user_id is None:
        raise AuthenticationError("Token payload missing user ID.")

    return int(user_id)


async def get_current_user_role(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    """Extract the user role from JWT token."""
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise AuthenticationError("Invalid or expired token.")
    return payload.get("role", "student")


def require_role(required_role: str):
    """
    Factory that creates a dependency requiring a specific role.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_role("mentor"))])
    """
    async def role_checker(
        credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    ):
        payload = decode_access_token(credentials.credentials)
        if payload is None:
            raise AuthenticationError()
        user_role = payload.get("role", "student")
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This endpoint requires '{required_role}' role.",
            )
        return payload
    return role_checker
