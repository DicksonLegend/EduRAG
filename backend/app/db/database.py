"""
SQLAlchemy engine, session factory, and Base model.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Call once at application startup."""
    # Import all models so they register with Base.metadata
    from app.db.models import user, document, chunk, topic, mcq_attempt, progress, qa_history, mcq_history  # noqa: F401
    Base.metadata.create_all(bind=engine)
