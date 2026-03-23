import datetime
from sqlalchemy.orm import Session
import database, models

# Conectar ao DB
models.Base.metadata.drop_all(bind=database.engine)
models.Base.metadata.create_all(bind=database.engine)
db = Session(database.engine)

def seed():
    # Clear existing
    db.query(models.Service).delete()
    db.query(models.Asset).delete()
    db.query(models.System).delete()
    db.query(models.City).delete()
    db.query(models.User).delete()
    db.commit()

    # Users
    u1 = models.User(full_name="Mikael", username="mikael", password_hash="mudar@123", role="desenvolvedor", is_approved=True)
    u2 = models.User(full_name="Augusto", username="augusto", password_hash="mudar@123", role="chefe", is_approved=True)
    u3 = models.User(full_name="Arthur", username="arthur", password_hash="mudar@123", role="técnico", is_approved=True)
    u4 = models.User(full_name="Jordan", username="jordan", password_hash="mudar@123", role="estagiário", is_approved=True)
    db.add_all([u1, u2, u3, u4])
    db.commit()

    # Cities
    macaiba = models.City(name="Macaíba")
    pureza = models.City(name="Pureza/João Câmara")
    db.add_all([macaiba, pureza])
    db.commit()

    # Systems
    sys_central = models.System(name="Sistema Central", city_id=macaiba.id)
    spi_pureza = models.System(name="SPI Pureza", city_id=pureza.id)
    db.add_all([sys_central, spi_pureza])
    db.commit()

    # Dates for mock
    today = datetime.date.today()
    green_date = today - datetime.timedelta(days=30)
    yellow_date = today - datetime.timedelta(days=190)

    assets_to_add = []

    # Macaiba Assets
    for i in range(1, 11):
        assets_to_add.append(models.Asset(tag=f"PT-{i:02d}", category="Poço", system_id=sys_central.id, last_maintenance=green_date if i % 2 == 0 else yellow_date))
    assets_to_add.append(models.Asset(tag="EEAT-01", category="Elevatória", system_id=sys_central.id, failure_reported=True))
    assets_to_add.append(models.Asset(tag="REL-01", category="Outros", system_id=sys_central.id, last_maintenance=green_date))
    assets_to_add.append(models.Asset(tag="VRP", category="Válvula", system_id=sys_central.id, last_maintenance=yellow_date))

    # Pureza Assets
    assets_to_add.append(models.Asset(tag="CAPTAÇÃO", category="Captação", system_id=spi_pureza.id, last_maintenance=green_date))
    assets_to_add.append(models.Asset(tag="EEAB", category="Elevatória", system_id=spi_pureza.id, last_maintenance=green_date))
    for i in range(1, 6):
        assets_to_add.append(models.Asset(tag=f"EEAT-{i:02d}", category="Elevatória", system_id=spi_pureza.id, last_maintenance=yellow_date if i > 3 else green_date))
    for i in range(1, 6):
        assets_to_add.append(models.Asset(tag=f"RAP-{i:02d}", category="Outros", system_id=spi_pureza.id, failure_reported=True if i == 2 else False))

    db.add_all(assets_to_add)
    db.commit()
    print("Banco de dados NUIAM populado com suceso!")

if __name__ == "__main__":
    seed()
