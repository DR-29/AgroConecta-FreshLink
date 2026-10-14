from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Finca, Usuario, Rol
from app.schemas.schemas import FincaCreate, FincaUpdate, FincaResponse
from app.api.deps import require_module_permission
from app.api.acceso import es_admin, nombre_rol

router = APIRouter()
MODULO = "MOD_FINCAS"

@router.get("/", response_model=List[FincaResponse], summary="Listar fincas activas")
def get_fincas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    """
    Si el usuario es PRODUCTOR, lista sus fincas activas.
    Si es ADMINISTRADOR u otro rol con permiso, lista todas las fincas activas.
    """
    if nombre_rol(db, current_user) == "PRODUCTOR":
        return db.query(Finca).filter(
            Finca.id_productor == current_user.id_usuario,
            Finca.estado == 1
        ).all()
    
    return db.query(Finca).filter(Finca.estado == 1).all()

@router.get("/{id_finca}", response_model=FincaResponse, summary="Obtener finca por ID")
def get_finca_by_id(
    id_finca: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    """Devuelve los datos de una finca."""
    finca = db.query(Finca).filter(Finca.id_finca == id_finca, Finca.estado == 1).first()
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada o inactiva")
    return finca

@router.post("/", response_model=FincaResponse, status_code=status.HTTP_201_CREATED, summary="Registrar una finca")
def create_finca(
    finca_in: FincaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Registra una nueva finca asignada al productor autenticado."""
    if not es_admin(db, current_user) and nombre_rol(db, current_user) != "PRODUCTOR":
        raise HTTPException(status_code=403, detail="Solo los productores o administradores pueden registrar fincas")

    id_productor = finca_in.id_productor if (es_admin(db, current_user) and finca_in.id_productor) else current_user.id_usuario

    # Validar unicidad por productor y nombre
    existente = db.query(Finca).filter(
        Finca.id_productor == id_productor,
        Finca.nombre == finca_in.nombre,
        Finca.estado == 1
    ).first()

    if existente:
        raise HTTPException(status_code=400, detail="Ya tienes una finca registrada con ese nombre")

    nueva_finca = Finca(
        id_productor=id_productor,
        nombre=finca_in.nombre,
        departamento=finca_in.departamento,
        municipio=finca_in.municipio,
        vereda=finca_in.vereda,
        area_hectareas=finca_in.area_hectareas,
        estado=1
    )
    db.add(nueva_finca)
    db.commit()
    db.refresh(nueva_finca)
    return nueva_finca

@router.put("/{id_finca}", response_model=FincaResponse, summary="Actualizar finca")
def update_finca(
    id_finca: int,
    finca_in: FincaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Actualiza la información de la finca."""
    finca = db.query(Finca).filter(Finca.id_finca == id_finca).first()
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada")

    if not es_admin(db, current_user) and finca.id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para editar esta finca")

    for field, value in finca_in.dict(exclude_unset=True).items():
        setattr(finca, field, value)

    db.commit()
    db.refresh(finca)
    return finca

@router.delete("/{id_finca}", summary="Borrado lógico de finca (estado = 0)")
def delete_finca_logico(
    id_finca: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de finca."""
    finca = db.query(Finca).filter(Finca.id_finca == id_finca).first()
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada")

    if not es_admin(db, current_user) and finca.id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para eliminar esta finca")

    finca.estado = 0
    db.commit()
    return {"mensaje": f"Finca {id_finca} desactivada lógicamente (estado = 0)"}
