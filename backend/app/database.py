from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# If using sqlite, connect_args is required for multi-threading in FastAPI
connect_args = {}
db_url = settings.DATABASE_URL

# Sanitize postgres URL (SQLAlchemy requires postgresql:// instead of postgres://)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Dependency for routes to get active DB sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
