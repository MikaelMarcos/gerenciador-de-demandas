import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import models
from datetime import date

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    print("No database URL found")
    exit(1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reset():
    db = SessionLocal()
    try:
        # Apaga todos os registros de vínculos n-to-n
        db.execute(models.service_users.delete())
        
        # Apaga todos os serviços do histórico
        num_services = db.query(models.Service).delete()
        
        # Reseta todos os ativos para estado Virgem/Verde/Operacional
        assets = db.query(models.Asset).all()
        for asset in assets:
            asset.failure_reported = False
            asset.preventive_requested = False
            asset.kanban_status = "backlog" # O padrão de ativos parados sãos
            asset.priority_score = 0
            asset.last_maintenance = date.today()
            
        db.commit()
        print(f"Sucesso: {len(assets)} ativos foram resetados. {num_services} serviços expurgados das tabelas.")
    except Exception as e:
        db.rollback()
        print("Erro DB:", e)
    finally:
        db.close()

if __name__ == "__main__":
    reset()
