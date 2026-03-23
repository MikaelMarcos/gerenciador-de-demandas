import sqlite3
import os

def migrate():
    # Detect the correct db path
    db_path = '../nuiam.db' if os.path.exists('../nuiam.db') else ('nuiam.db' if os.path.exists('nuiam.db') else None)
    
    if not db_path:
        print("Database not found")
        return

    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("ALTER TABLE users ADD COLUMN icon VARCHAR DEFAULT 'User'")
        conn.commit()
        print(f"Migração concluída em {db_path}.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Coluna já existe.")
        else:
            print("Erro SQL:", e)
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
