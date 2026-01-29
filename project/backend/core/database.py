import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Charge une URL de BDD depuis l'environnement, sinon SQLite local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Pour SQLite, il faut ce connect_args (thread-safety)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Crée l'engine (futur-compatible SQLAlchemy 2.0)
engine = create_engine(
    DATABASE_URL,
    echo=False,             # passe à True si tu veux voir les requêtes
    future=True,
    connect_args=connect_args,
)

# Session factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    future=True,
)

# Base ORM
class Base(DeclarativeBase):
    pass

# Dépendance FastAPI typique
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()