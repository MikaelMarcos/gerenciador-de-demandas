from database import engine
from sqlalchemy import text

def upgrade_db():
    try:
        with engine.connect() as conn:
            # Em versões mais novas do SQLAlchemy, precisa passar wrapped no text()
            conn.execute(text("ALTER TABLE assets ADD COLUMN kanban_status VARCHAR DEFAULT 'backlog'"))
            conn.commit()
            print("Successfully added kanban_status column via SQLAlchemy!")
    except Exception as e:
        print(f"Error upgrading db: {e}")

if __name__ == "__main__":
    upgrade_db()
