from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.security import hash_password
from ..models import Admin
from .base import Base
from .session import SessionLocal, engine

settings = get_settings()


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


def seed_admin(db: Session) -> None:
    existing = db.scalar(select(Admin).where(Admin.username == settings.admin_username))
    if existing:
        return

    admin = Admin(
        username=settings.admin_username,
        password_hash=hash_password(settings.admin_password),
    )
    db.add(admin)
    db.commit()


def initialize_database() -> None:
    create_tables()
    with SessionLocal() as db:
        seed_admin(db)
