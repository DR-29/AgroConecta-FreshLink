from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Modulo, ModuloXRol, Rol, Usuario
from app.schemas.schemas import (
    ModuloResponse, ModuloCreate,
    ModuloXRolResponse, ModuloXRolCreate, ModuloXRolUpdate
)
from app.api.deps import require_module_permission

router = APIRouter()
MODULO = "MOD_SEGURIDAD"

# Módulos
@router.get("/modulos", response_model=List[ModuloResponse], summary="Listar módulos del sistema")
def get_modulos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    """Lista todos los módulos activos del sistema."""
    return db.query(Modulo).filter(Modulo.estado == 1).all()

@router.post("/modulos", response_model=ModuloResponse, status_code=status.HTTP_201_CREATED, summary="Crear nuevo módulo")
def create_modulo(
    modulo_in: ModuloCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea un nuevo módulo del sistema."""
    if db.query(Modulo).filter(Modulo.codigo == modulo_in.codigo).first():
        raise HTTPException(status_code=400, detail="Ya existe un módulo con este código")

    nuevo_modulo = Modulo(
        codigo=modulo_in.codigo,
        nombre=modulo_in.nombre,
        descripcion=modulo_in.descripcion,
        ruta=modulo_in.ruta,
        estado=1
    )
    db.add(nuevo_modulo)
    db.commit()
    db.refresh(nuevo_modulo)
    return nuevo_modulo

# ModuloXRol (RBAC)
@router.get("/permisos", response_model=List[ModuloXRolResponse], summary="Listar matriz de permisos moduloxrol")
def get_permisos(
    id_rol: int = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    """Retorna los permisos asignados en la tabla moduloxrol."""
    query = db.query(ModuloXRol).filter(ModuloXRol.estado == 1)
    if id_rol:
        query = query.filter(ModuloXRol.id_rol == id_rol)
    return query.all()

@router.post("/permisos", response_model=ModuloXRolResponse, status_code=status.HTTP_201_CREATED, summary="Asignar permiso moduloxrol")
def create_permiso(
    permiso_in: ModuloXRolCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Asocia un módulo con un rol estableciendo permisos CRUD."""
    existente = db.query(ModuloXRol).filter(
        ModuloXRol.id_rol == permiso_in.id_rol,
        ModuloXRol.id_modulo == permiso_in.id_modulo
    ).first()

    if existente:
        existente.puede_crear = permiso_in.puede_crear
        existente.puede_leer = permiso_in.puede_leer
        existente.puede_actualizar = permiso_in.puede_actualizar
        existente.puede_eliminar = permiso_in.puede_eliminar
        existente.estado = 1
        db.commit()
        db.refresh(existente)
        return existente

    nuevo = ModuloXRol(
        id_rol=permiso_in.id_rol,
        id_modulo=permiso_in.id_modulo,
        puede_crear=permiso_in.puede_crear,
        puede_leer=permiso_in.puede_leer,
        puede_actualizar=permiso_in.puede_actualizar,
        puede_eliminar=permiso_in.puede_eliminar,
        estado=1
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/permisos/{id_moduloxrol}", response_model=ModuloXRolResponse, summary="Actualizar permiso moduloxrol")
def update_permiso(
    id_moduloxrol: int,
    permiso_in: ModuloXRolUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Actualiza las banderas CRUD para una relación moduloxrol."""
    permiso = db.query(ModuloXRol).filter(ModuloXRol.id_moduloxrol == id_moduloxrol).first()
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")

    update_data = permiso_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(permiso, field, value)

    db.commit()
    db.refresh(permiso)
    return permiso

@router.delete("/permisos/{id_moduloxrol}", summary="Borrado lógico de permiso moduloxrol (estado = 0)")
def delete_permiso_logico(
    id_moduloxrol: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de permisos moduloxrol."""
    permiso = db.query(ModuloXRol).filter(ModuloXRol.id_moduloxrol == id_moduloxrol).first()
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso no encontrado")

    permiso.estado = 0
    db.commit()
    return {"mensaje": f"Permiso {id_moduloxrol} desactivado lógicamente (estado = 0)"}
