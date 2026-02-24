"""
Authentication service — handles registration, login, and token management.
"""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import AuthenticationError, UserAlreadyExistsError
from app.core.constants import UserRole
from app.db.repositories.user_repo import UserRepository
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)

logger = logging.getLogger(__name__)


class AuthService:
    """Handles user registration, authentication, and JWT token management."""

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, request: RegisterRequest) -> UserResponse:
        """Register a new user (student or mentor)."""
        # Check for existing user
        if self.user_repo.get_by_username(request.username):
            raise UserAlreadyExistsError()
        if self.user_repo.get_by_email(request.email):
            raise UserAlreadyExistsError()

        # Create user
        hashed = hash_password(request.password)
        user = self.user_repo.create(
            username=request.username,
            email=request.email,
            hashed_password=hashed,
            full_name=request.full_name,
            role=request.role,
        )

        logger.info(f"New user registered: {user.username} ({user.role})")
        return UserResponse.model_validate(user)

    def login(self, request: LoginRequest) -> TokenResponse:
        """Authenticate user and return JWT token."""
        user = self.user_repo.get_by_username(request.username)
        if not user or not verify_password(request.password, user.hashed_password):
            raise AuthenticationError("Invalid username or password.")

        token = create_access_token(
            data={"sub": str(user.id), "role": user.role.value}
        )

        logger.info(f"User logged in: {user.username}")
        return TokenResponse(access_token=token)

    def get_current_user(self, user_id: int) -> UserResponse:
        """Get user info by ID."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found.")
        return UserResponse.model_validate(user)
