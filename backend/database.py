import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Tenta pegar a URL do Supabase, se não achar usar SQLite local para não bloquear o desenvolvimento
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nuiam.db")

# Se for SQLite, precisamos do check_same_thread=False
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Para o Postgres (Supabase), adicionamos propriedades essenciais:
    # pool_pre_ping checa se a conexão caiu antes de tentar usar, para não travar (hang) o servidor.
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência do FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
