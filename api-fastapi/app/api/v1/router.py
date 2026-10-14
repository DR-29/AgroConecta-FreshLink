from fastapi import APIRouter
from app.api.v1 import (
    auth,
    usuarios,
    seguridad,
    fincas,
    catalogo,
    pedidos,
    logistica,
    calificaciones
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["1. Autenticación y JWT"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["2. Usuarios y Roles"])
api_router.include_router(seguridad.router, prefix="/seguridad", tags=["3. Seguridad y RBAC (Modulo / ModuloXRol)"])
api_router.include_router(fincas.router, prefix="/fincas", tags=["4. Fincas y Parcelas"])
api_router.include_router(catalogo.router, prefix="/catalogo", tags=["5. Catálogo y Cosechas"])
api_router.include_router(pedidos.router, prefix="/pedidos", tags=["6. Pedidos y Trazabilidad"])
api_router.include_router(logistica.router, prefix="/logistica", tags=["7. Logística y Vehículos"])
api_router.include_router(calificaciones.router, prefix="/calificaciones", tags=["8. Calificaciones de Servicio"])
