import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Carga las variables del archivo .env al entorno de Python
load_dotenv()


class Database:
    """
    Clase de conexión a PostgreSQL con psycopg2 y RealDictCursor
    según el estándar del Patrón Repository de la clase.
    """
    def __init__(self):
        self.host = os.getenv("DB_HOST")
        self.database = os.getenv("DB_NAME")
        self.user = os.getenv("DB_USER")
        self.password = os.getenv("DB_PASSWORD")
        self.port = os.getenv("DB_PORT", 5432)

        # Si no se definieron las variables individuales, extraer de DATABASE_URL
        if not self.host and os.getenv("DATABASE_URL"):
            from urllib.parse import urlparse
            url = urlparse(os.getenv("DATABASE_URL"))
            self.host = url.hostname
            self.database = url.path.lstrip("/") if url.path else "neondb"
            self.user = url.username
            self.password = url.password
            self.port = url.port or 5432

    def get_connection(self):
        try:
            return psycopg2.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password,
                port=self.port,
                cursor_factory=RealDictCursor,
                sslmode="require" if self.host and "neon.tech" in self.host else "prefer"
            )
        except Exception as e:
            print(f"Error de conexión a la BD: {e}")
            return None


# --- Configuración complementaria para compatibilidad y tests (SQLAlchemy) ---
from app.core.config import settings

db_url = settings.sync_database_url
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Generador de sesión de base de datos para inyección de dependencias."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
