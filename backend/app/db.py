# backend/app/db.py

from __future__ import annotations

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# DATABASE_URL examples:
# - SQLite (local): sqlite:///./dev.db
# - Neon Postgres: postgresql+psycopg://user:pass@host/dbname?sslmode=require
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db").strip()

# SQLite needs this flag for FastAPI multi-thread access
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def init_db() -> None:
    """
    Create tables if they don't exist.
    Call once on app startup.
    """
    # Import models so Base knows them before create_all()
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db():
    """
    FastAPI dependency that yields a DB session.
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
