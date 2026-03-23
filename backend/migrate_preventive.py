import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE assets ADD COLUMN preventive_requested BOOLEAN DEFAULT FALSE"))
        conn.commit()
        print("Migração PG de Preventive Request concluída.")
    except Exception as e:
        if "already exists" in str(e):
            print("Coluna já existe.")
        else:
            print("Erro PG:", e)
