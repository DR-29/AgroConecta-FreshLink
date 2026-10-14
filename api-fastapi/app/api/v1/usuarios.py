from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.entities import Usuario, Rol
from app.schemas.schemas import (
    UsuarioResponse, UsuarioCreate, UsuarioUpdate,
    RolResponse, RolCreate, RolUpdate
)
from app.api.deps import get_current_user, require_module_permission
from app.api.acceso import es_admin, nombre_rol

router = APIRouter()
MODULO = "MOD_SEGURIDAD"

# Usuarios
@router.get("/", response_model=List[UsuarioResponse], summary="Listar usuarios con filtros y borrado lógico")
def get_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer")),
    solo_activos: bool = Query(True, description="Si es True, lista solo usuarios con estado=1"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
) -> Any:
    """Lista usuarios según permisos de MOD_SEGURIDAD."""
    query = db.query(Usuario)
    if solo_activos:
        query = query.filter(Usuario.estado == 1)
    usuarios = query.offset(skip).limit(limit).all()

    roles_dict = {r.id_rol: r.nombre for r in db.query(Rol).all()}
    response = []
    for u in usuarios:
        item = UsuarioResponse.from_orm(u)
        item.rol_nombre = roles_dict.get(u.id_rol)
        response.append(item)
    return response

@router.get("/{id_usuario}", response_model=UsuarioResponse, summary="Obtener detalle de un usuario")
def get_usuario_by_id(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """Permite ver el detalle del usuario solicitado."""
    if not es_admin(db, current_user) and current_user.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="Solo puedes consultar tu propio perfil")

    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    
    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    res = UsuarioResponse.from_orm(user)
    res.rol_nombre = rol.nombre if rol else None
    return res

@router.put("/{id_usuario}", response_model=UsuarioResponse, summary="Actualizar usuario")
def update_usuario(
    id_usuario: int,
    user_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """Actualiza datos del usuario. Si no es admin, solo puede actualizar su propio perfil."""
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
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

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    res = UsuarioResponse.from_orm(user)
    res.rol_nombre = rol.nombre if rol else None
    return res

@router.delete("/{id_usuario}", summary="Borrado lógico de usuario (estado = 0)")
def delete_usuario_logico(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de usuario (requiere permiso 'eliminar' en MOD_SEGURIDAD)."""
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    user.estado = 0
    db.commit()
    return {"mensaje": f"Usuario con ID {id_usuario} desactivado lógicamente con éxito (estado = 0)"}

@router.patch("/{id_usuario}/reactivar", summary="Reactivar usuario (estado = 1)")
def reactivate_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Restaura un usuario inactivo cambiando su estado a 1."""
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    user.estado = 1
    db.commit()
    return {"mensaje": f"Usuario con ID {id_usuario} reactivado con éxito (estado = 1)"}

# Roles
@router.get("/roles/todos", response_model=List[RolResponse], summary="Listar todos los roles")
def get_roles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
) -> Any:
    """Lista todos los roles activos del sistema."""
    return db.query(Rol).filter(Rol.estado == 1).all()

@router.post("/roles", response_model=RolResponse, status_code=status.HTTP_201_CREATED, summary="Crear nuevo rol")
def create_rol(
    rol_in: RolCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea un nuevo rol de sistema."""
    if db.query(Rol).filter(Rol.nombre == rol_in.nombre.upper()).first():
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")
    
    nuevo_rol = Rol(
        nombre=rol_in.nombre.upper(),
        descripcion=rol_in.descripcion,
        estado=1
    )
    db.add(nuevo_rol)
    db.commit()
    db.refresh(nuevo_rol)
    return nuevo_rol
