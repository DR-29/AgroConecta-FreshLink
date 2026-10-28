from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.entities import Usuario
from app.models.usuario import (
    UsuarioResponse, UsuarioCreate, UsuarioUpdate
)
from app.models.seguridad import (
    RolResponse, RolCreate
)
from app.repositories.usuario_repo import UsuarioRepository
from app.repositories.seguridad_repo import SeguridadRepository
from app.api.deps import get_current_user, require_module_permission
from app.api.acceso import es_admin

router = APIRouter()
MODULO = "MOD_SEGURIDAD"

# Instancia del repositorio siguiendo el estándar de la guía
repo = UsuarioRepository()


# Usuarios
@router.get("/", response_model=List[UsuarioResponse], summary="Listar usuarios con filtros y borrado lógico")
def get_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer")),
    solo_activos: bool = Query(True, description="Si es True, lista solo usuarios con estado=1"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
) -> Any:
    """Lista usuarios mediante el repositorio según permisos de MOD_SEGURIDAD."""
    r = UsuarioRepository(db)
    return r.obtener_todos(solo_activos=solo_activos, skip=skip, limit=limit)


@router.get("/{id_usuario}", response_model=UsuarioResponse, summary="Obtener detalle de un usuario")
def get_usuario_by_id(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """Permite ver el detalle del usuario solicitado a través del repositorio."""
    if not es_admin(db, current_user) and current_user.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="Solo puedes consultar tu propio perfil")

    r = UsuarioRepository(db)
    user = r.obtener_por_id(id_usuario)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


@router.put("/{id_usuario}", response_model=UsuarioResponse, summary="Actualizar usuario")
def update_usuario(
    id_usuario: int,
    user_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """Actualiza datos del usuario mediante el repositorio."""
    r = UsuarioRepository(db)
    user = r.obtener_por_id(id_usuario)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    admin = es_admin(db, current_user)
    if not admin and current_user.id_usuario != id_usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para modificar este usuario")

    update_data = user_in.dict(exclude_unset=True)
    if not admin:
        update_data.pop("id_rol", None)
        update_data.pop("estado", None)

    if "contrasena" in update_data and update_data["contrasena"]:
        update_data["contrasena_hash"] = get_password_hash(update_data.pop("contrasena"))

    return r.actualizar(id_usuario, update_data)


@router.delete("/{id_usuario}", summary="Borrado lógico de usuario (estado = 0)")
def delete_usuario_logico(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de usuario mediante el repositorio (estado = 0)."""
    r = UsuarioRepository(db)
    user = r.obtener_por_id(id_usuario)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    r.eliminar(id_usuario)
    return {"mensaje": f"Usuario con ID {id_usuario} desactivado lógicamente con éxito (estado = 0)"}


@router.patch("/{id_usuario}/reactivar", summary="Reactivar usuario (estado = 1)")
def reactivate_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Restaura un usuario inactivo cambiando su estado a 1 mediante el repositorio."""
    r = UsuarioRepository(db)
    user = r.obtener_por_id(id_usuario)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    r.actualizar(id_usuario, {"estado": 1})
    return {"mensaje": f"Usuario con ID {id_usuario} reactivado con éxito (estado = 1)"}


# Roles
@router.get("/roles/todos", response_model=List[RolResponse], summary="Listar todos los roles")
def get_roles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """Lista todos los roles activos del sistema a través del repositorio."""
    r = SeguridadRepository(db)
    return r.obtener_roles()


@router.post("/roles", response_model=RolResponse, status_code=status.HTTP_201_CREATED, summary="Crear nuevo rol")
def create_rol(
    rol_in: RolCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea un nuevo rol de sistema a través del repositorio."""
    r = SeguridadRepository(db)
    if r.obtener_rol_por_nombre(rol_in.nombre):
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")

    return r.crear_rol(rol_in)
