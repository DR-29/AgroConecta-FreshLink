import uuid
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Vehiculo, SolicitudTransporte, Pedido, Usuario
from app.schemas.schemas import (
    VehiculoCreate, VehiculoUpdate, VehiculoResponse,
    SolicitudTransporteCreate, SolicitudTransporteUpdate, SolicitudTransporteResponse
)
from app.repositories.logistica_repo import LogisticaRepository
from app.api.deps import require_module_permission, require_roles
from app.api.acceso import (
    ESTADOS_SOLICITUD, nombre_rol, es_admin, productores_del_pedido
)

router = APIRouter()
MODULO = "MOD_LOGISTICA"

# Instancia del repositorio siguiendo el estándar de la guía
repo = LogisticaRepository()


def _validar_transportista_y_vehiculo(db: Session, id_transportista: Optional[int], id_vehiculo: Optional[int]) -> None:
    """Regla de negocio: solo transportistas activos con vehículos aprobados pueden recibir solicitudes."""
    if id_transportista is None:
        if id_vehiculo is not None:
            raise HTTPException(status_code=400, detail="No se puede asignar un vehículo sin transportista")
        return
    transportista = db.query(Usuario).filter(Usuario.id_usuario == id_transportista, Usuario.estado == 1).first()
    if not transportista or nombre_rol(db, transportista) != "TRANSPORTISTA":
        raise HTTPException(status_code=400, detail="El usuario asignado no es un transportista activo")
    if id_vehiculo is None:
        raise HTTPException(status_code=400, detail="Debes indicar el vehículo del transportista")
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo, Vehiculo.estado == 1).first()
    if not vehiculo or vehiculo.id_transportista != id_transportista:
        raise HTTPException(status_code=400, detail="El vehículo no existe o no pertenece a ese transportista")
    if not vehiculo.aprobado_admin:
        raise HTTPException(status_code=400, detail="El vehículo aún no ha sido aprobado por un administrador")


# Vehículos
@router.get("/vehiculos", response_model=List[VehiculoResponse], summary="Listar vehículos de carga")
def get_vehiculos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer")),
    solo_aprobados: bool = Query(False, description="Filtrar solo vehículos aprobados por el admin")
) -> Any:
    """El TRANSPORTISTA ve sus vehículos; ADMIN y PRODUCTOR ven todos (para elegir transporte)."""
    r = LogisticaRepository(db)
    id_trans = current_user.id_usuario if nombre_rol(db, current_user) == "TRANSPORTISTA" else None
    return r.obtener_vehiculos(id_transportista=id_trans, solo_aprobados=solo_aprobados)


@router.post("/vehiculos", response_model=VehiculoResponse, status_code=status.HTTP_201_CREATED, summary="Registrar vehículo")
def create_vehiculo(
    vehiculo_in: VehiculoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Registra un nuevo vehículo de carga mediante el repositorio."""
    if not es_admin(db, current_user) and nombre_rol(db, current_user) != "TRANSPORTISTA":
        raise HTTPException(status_code=403, detail="Solo los transportistas o administradores pueden registrar vehículos")

    id_transportista = vehiculo_in.id_transportista if (es_admin(db, current_user) and vehiculo_in.id_transportista) else current_user.id_usuario

    r = LogisticaRepository(db)
    if r.obtener_vehiculo_por_placa(vehiculo_in.placa):
        raise HTTPException(status_code=400, detail=f"Ya existe un vehículo con la placa '{vehiculo_in.placa}'")

    aprobado = es_admin(db, current_user)
    return r.crear_vehiculo(vehiculo_in, id_transportista=id_transportista, aprobado=aprobado)


@router.put("/vehiculos/{id_vehiculo}", response_model=VehiculoResponse, summary="Actualizar vehículo")
def update_vehiculo(
    id_vehiculo: int,
    vehiculo_in: VehiculoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    v = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    data = vehiculo_in.dict(exclude_unset=True)
    if not es_admin(db, current_user):
        if v.id_transportista != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="Este vehículo no te pertenece")
        data.pop("aprobado_admin", None)
        data.pop("estado", None)

    for field, value in data.items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v


@router.patch("/vehiculos/{id_vehiculo}/aprobar", response_model=VehiculoResponse, summary="Aprobar vehículo (Solo Administradores)")
def approve_vehiculo(
    id_vehiculo: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(["ADMINISTRADOR"]))
) -> Any:
    v = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo, Vehiculo.estado == 1).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    v.aprobado_admin = True
    db.commit()
    db.refresh(v)
    return v


@router.delete("/vehiculos/{id_vehiculo}", summary="Borrado lógico de vehículo (estado = 0)")
def delete_vehiculo_logico(
    id_vehiculo: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    v = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    v.estado = 0
    db.commit()
    return {"mensaje": f"Vehículo {id_vehiculo} desactivado lógicamente (estado = 0)"}


# Solicitudes de transporte
@router.get("/solicitudes", response_model=List[SolicitudTransporteResponse], summary="Listar solicitudes de transporte")
def get_solicitudes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer")),
    estado_solicitud: Optional[str] = Query(None)
) -> Any:
    """ADMIN: todas. TRANSPORTISTA: las asignadas a él. PRODUCTOR: las de pedidos con sus productos."""
    query = db.query(SolicitudTransporte).filter(SolicitudTransporte.estado == 1)
    if estado_solicitud:
        query = query.filter(SolicitudTransporte.estado_solicitud == estado_solicitud.upper())

    rol = nombre_rol(db, current_user)
    solicitudes = query.all()
    if rol == "TRANSPORTISTA":
        return [s for s in solicitudes if s.id_transportista == current_user.id_usuario]
    if rol == "PRODUCTOR":
        return [s for s in solicitudes if current_user.id_usuario in productores_del_pedido(db, s.pedido)]
    return solicitudes


@router.post("/solicitudes", response_model=SolicitudTransporteResponse, status_code=status.HTTP_201_CREATED, summary="Crear solicitud logística (Productor)")
def create_solicitud(
    sol_in: SolicitudTransporteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea una solicitud logística asignando transportista y vehículo aprobado."""
    pedido = db.query(Pedido).filter(Pedido.id_pedido == sol_in.id_pedido, Pedido.estado == 1).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if not es_admin(db, current_user) and current_user.id_usuario not in productores_del_pedido(db, pedido):
        raise HTTPException(status_code=403, detail="Solo el productor del pedido puede solicitar transporte")

    if pedido.estado_pedido not in {"ACEPTADO", "PREPARANDO"}:
        raise HTTPException(status_code=400, detail="El pedido debe estar ACEPTADO o PREPARANDO para solicitar transporte")

    activa = db.query(SolicitudTransporte).filter(
        SolicitudTransporte.id_pedido == pedido.id_pedido,
        SolicitudTransporte.estado == 1,
        SolicitudTransporte.estado_solicitud.notin_(["RECHAZADO"]),
    ).first()
    if activa:
        raise HTTPException(status_code=400, detail=f"El pedido ya tiene una solicitud activa ({activa.codigo_seguimiento})")

    _validar_transportista_y_vehiculo(db, sol_in.id_transportista, sol_in.id_vehiculo)

    nueva_solicitud = SolicitudTransporte(
        codigo_seguimiento=f"TRK-{uuid.uuid4().hex[:8].upper()}",
        id_pedido=sol_in.id_pedido,
        id_transportista=sol_in.id_transportista,
        id_vehiculo=sol_in.id_vehiculo,
        estado_solicitud="SOLICITADO",
        costo_transporte=sol_in.costo_transporte,
        observaciones=sol_in.observaciones,
        estado=1
    )
    db.add(nueva_solicitud)
    db.commit()
    db.refresh(nueva_solicitud)
    return nueva_solicitud


@router.put("/solicitudes/{id_solicitud}", response_model=SolicitudTransporteResponse, summary="Actualizar / responder solicitud logística")
def update_solicitud(
    id_solicitud: int,
    sol_in: SolicitudTransporteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """
    - TRANSPORTISTA asignado: puede aceptar/rechazar (estado_solicitud) y editar observaciones.
    - ADMINISTRADOR: puede modificar cualquier campo.
    """
    sol = db.query(SolicitudTransporte).filter(SolicitudTransporte.id_solicitud == id_solicitud, SolicitudTransporte.estado == 1).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    data = sol_in.dict(exclude_unset=True)
    if "estado_solicitud" in data and data["estado_solicitud"] is not None:
        data["estado_solicitud"] = data["estado_solicitud"].upper()
        if data["estado_solicitud"] not in ESTADOS_SOLICITUD:
            raise HTTPException(status_code=400, detail=f"Estado inválido. Valores permitidos: {', '.join(sorted(ESTADOS_SOLICITUD))}")

    if not es_admin(db, current_user):
        if sol.id_transportista != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="Esta solicitud no está asignada a ti")
        permitidos = {"estado_solicitud", "observaciones"}
        no_permitidos = set(data) - permitidos
        if no_permitidos:
            raise HTTPException(status_code=403, detail=f"No puedes modificar: {', '.join(sorted(no_permitidos))}")
    else:
        _validar_transportista_y_vehiculo(
            db,
            data.get("id_transportista", sol.id_transportista),
            data.get("id_vehiculo", sol.id_vehiculo),
        )

    for field, value in data.items():
        setattr(sol, field, value)
    db.commit()
    db.refresh(sol)
    return sol


@router.delete("/solicitudes/{id_solicitud}", summary="Borrado lógico de solicitud (estado = 0)")
def delete_solicitud_logico(
    id_solicitud: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    sol = db.query(SolicitudTransporte).filter(SolicitudTransporte.id_solicitud == id_solicitud).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    sol.estado = 0
    db.commit()
    return {"mensaje": f"Solicitud {id_solicitud} desactivada lógicamente (estado = 0)"}
