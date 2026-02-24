"""
FastAPI dependency injection — shared dependencies for route handlers.
"""

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.jwt_handler import get_current_user_id, get_current_user_role, require_role

__all__ = ["get_db", "get_current_user_id", "get_current_user_role", "require_role"]
