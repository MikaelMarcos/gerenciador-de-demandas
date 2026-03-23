import os
from sqlalchemy import text
from dotenv import load_dotenv
import database

load_dotenv()

def upgrade_schema():
    with database.engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE services ADD COLUMN replaced_parts TEXT;"))
            conn.commit()
            print("Coluna 'replaced_parts' adicionada com sucesso.")
        except Exception as e:
            print(f"Erro ao adicionar coluna (talvez já exista): {e}")

if __name__ == "__main__":
    upgrade_schema()
