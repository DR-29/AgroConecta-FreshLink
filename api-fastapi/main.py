from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="API núcleo de AgroConecta: arquitectura modular con FastAPI, Patrón Repository y PostgreSQL",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión de las rutas de la API
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Estado y Bienvenida"])
def root():
    return {
        "sistema": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "estado": "La API de monitoreo y gestión se encuentra en línea y funcional",
        "documentacion_swagger": "/docs",
        "documentacion_redoc": "/redoc",
        "endpoints_v1": settings.API_V1_STR
    }


@app.get("/health", tags=["Estado y Bienvenida"])
def health_check():
    return {"status": "ok", "database": "connected"}


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Aviso startup db: {e}")
