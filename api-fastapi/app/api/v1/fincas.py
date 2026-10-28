from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Usuario
from app.models.finca import FincaCreate, FincaUpdate, FincaResponse
from app.repositories.finca_repo import FincaRepository
from app.api.deps import require_module_permission
from app.api.acceso import es_admin, nombre_rol

router = APIRouter()
MODULO = "MOD_FINCAS"

# Instancia del repositorio siguiendo el estándar de la guía
repo = FincaRepository()


@router.get("/", response_model=List[FincaResponse], summary="Listar fincas activas")
def get_fincas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    """
    Si el usuario es PRODUCTOR, lista sus fincas activas.
    Si es ADMINISTRADOR u otro rol con permiso, lista todas las fincas activas.
    """
    r = FincaRepository(db)
    if nombre_rol(db, current_user) == "PRODUCTOR":
        return r.obtener_todos(id_productor=current_user.id_usuario)
    return r.obtener_todos()


@router.get("/{id_finca}", response_model=FincaResponse, summary="Obtener finca por ID")
def get_finca_by_id(
    id_finca: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    """Devuelve los datos de una finca a través del repositorio."""
    r = FincaRepository(db)
    finca = r.obtener_por_id(id_finca)
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada o inactiva")
    return finca


@router.post("/", response_model=FincaResponse, status_code=status.HTTP_201_CREATED, summary="Registrar una finca")
def create_finca(
    finca_in: FincaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Registra una nueva finca asignada al productor autenticado mediante el repositorio."""
    if not es_admin(db, current_user) and nombre_rol(db, current_user) != "PRODUCTOR":
        raise HTTPException(status_code=403, detail="Solo los productores o administradores pueden registrar fincas")

    id_productor = finca_in.id_productor if (es_admin(db, current_user) and finca_in.id_productor) else current_user.id_usuario

    r = FincaRepository(db)
    existente = r.obtener_por_productor_y_nombre(id_productor, finca_in.nombre)
    if existente:
        raise HTTPException(status_code=400, detail="Ya tienes una finca registrada con ese nombre")

    return r.crear(finca_in, id_productor)


@router.put("/{id_finca}", response_model=FincaResponse, summary="Actualizar finca")
def update_finca(
    id_finca: int,
    finca_in: FincaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Actualiza la información de la finca a través del repositorio."""
    r = FincaRepository(db)
    finca = r.obtener_por_id(id_finca)
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada")

    id_prod = getattr(finca, "id_productor", None) or (finca.get("id_productor") if isinstance(finca, dict) else None)
    if not es_admin(db, current_user) and id_prod != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para editar esta finca")

    actualizada = r.actualizar(id_finca, finca_in.dict(exclude_unset=True))
    return actualizada


@router.delete("/{id_finca}", summary="Borrado lógico de finca (estado = 0)")
def delete_finca_logico(
    id_finca: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de finca mediante el repositorio (estado = 0)."""
    r = FincaRepository(db)
    finca = r.obtener_por_id(id_finca)
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada")

    id_prod = getattr(finca, "id_productor", None) or (finca.get("id_productor") if isinstance(finca, dict) else None)
    if not es_admin(db, current_user) and id_prod != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para eliminar esta finca")

    exito = r.eliminar(id_finca)
    if not exito:
        raise HTTPException(status_code=404, detail="No se pudo desactivar la finca")
    return {"mensaje": f"Finca {id_finca} desactivada lógicamente (estado = 0)"}
