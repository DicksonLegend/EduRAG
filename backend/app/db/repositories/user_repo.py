"""
Data access layer for User operations.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.db.models.user import User
from app.core.constants import UserRole


class UserRepository:
    """Encapsulates all database operations for the User model."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create(
        self,
        username: str,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        role: UserRole = UserRole.STUDENT,
    ) -> User:
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_students(self) -> list[User]:
        """Get all users with student role (used by mentors)."""
        return self.db.query(User).filter(User.role == UserRole.STUDENT).all()

    def get_all(self) -> list[User]:
        return self.db.query(User).all()
