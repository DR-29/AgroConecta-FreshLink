from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Calificacion, Pedido, Usuario
from app.schemas.schemas import CalificacionCreate, CalificacionResponse
from app.api.deps import require_module_permission
from app.api.acceso import es_admin, es_participante_pedido

router = APIRouter()
MODULO = "MOD_CALIDAD"


@router.get("/", response_model=List[CalificacionResponse], summary="Listar calificaciones activas (público)")
def get_calificaciones(
    id_calificado: Optional[int] = Query(None, description="Filtrar por usuario calificado"),
    db: Session = Depends(get_db)
) -> Any:
    """La reputación es pública para generar confianza entre actores."""
    query = db.query(Calificacion).filter(Calificacion.estado == 1)
    if id_calificado:
        query = query.filter(Calificacion.id_calificado == id_calificado)
    return query.all()


@router.post("/", response_model=CalificacionResponse, status_code=status.HTTP_201_CREATED, summary="Registrar calificación de servicio")
def create_calificacion(
    cal_in: CalificacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Registra la calificación entre participantes de un pedido entregado."""
    pedido = db.query(Pedido).filter(Pedido.id_pedido == cal_in.id_pedido, Pedido.estado == 1).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if pedido.estado_pedido != "ENTREGADO":
        raise HTTPException(status_code=400, detail="Solo puedes calificar cuando el pedido haya sido ENTREGADO")

    if cal_in.id_calificado == current_user.id_usuario:
        raise HTTPException(status_code=400, detail="No puedes calificarte a ti mismo")

    if not es_admin(db, current_user) and not es_participante_pedido(db, current_user, pedido):
        raise HTTPException(status_code=403, detail="No participaste en este pedido")

    calificado = db.query(Usuario).filter(Usuario.id_usuario == cal_in.id_calificado, Usuario.estado == 1).first()
    if not calificado:
        raise HTTPException(status_code=404, detail="Usuario calificado no encontrado")
    if not es_participante_pedido(db, calificado, pedido):
        raise HTTPException(status_code=400, detail="El usuario calificado no participó en este pedido")

    existente = db.query(Calificacion).filter(
        Calificacion.id_pedido == cal_in.id_pedido,
        Calificacion.id_calificador == current_user.id_usuario,
        Calificacion.id_calificado == cal_in.id_calificado,
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya has calificado a este usuario en esta orden")

    nueva_cal = Calificacion(
        id_pedido=cal_in.id_pedido,
        id_calificador=current_user.id_usuario,
        id_calificado=cal_in.id_calificado,
        puntuacion=cal_in.puntuacion,
        comentario=cal_in.comentario,
        estado=1
    )
    db.add(nueva_cal)
    db.commit()
    db.refresh(nueva_cal)
    return nueva_cal


@router.delete("/{id_calificacion}", summary="Borrado lógico de calificación (estado = 0)")
def delete_calificacion_logico(
    id_calificacion: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Moderación: solo roles con permiso 'eliminar' en MOD_CALIDAD (por defecto, ADMINISTRADOR)."""
    cal = db.query(Calificacion).filter(Calificacion.id_calificacion == id_calificacion).first()
    if not cal:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    cal.estado = 0
    db.commit()
    return {"mensaje": f"Calificación {id_calificacion} desactivada lógicamente (estado = 0)"}
