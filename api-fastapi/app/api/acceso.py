"""Reglas de acceso a nivel de registro (ownership)."""
from typing import Optional, Set
from sqlalchemy.orm import Session

from app.models.entities import (
    Usuario, Rol, Pedido, PedidoItem, Producto, Finca, SolicitudTransporte
)

ESTADOS_PEDIDO = {"PENDIENTE", "ACEPTADO", "PREPARANDO", "EN_RUTA", "ENTREGADO", "CANCELADO"}
ESTADOS_SOLICITUD = {"SOLICITADO", "ACEPTADO", "RECHAZADO", "EN_CURSO", "COMPLETADO"}


def nombre_rol(db: Session, user: Usuario) -> str:
    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    return rol.nombre.upper() if rol else ""


def es_admin(db: Session, user: Usuario) -> bool:
    return nombre_rol(db, user) == "ADMINISTRADOR"


def productores_del_pedido(db: Session, pedido: Pedido) -> Set[int]:
    """IDs de los productores dueños de los productos incluidos en el pedido."""
    filas = (
        db.query(Finca.id_productor)
        .join(Producto, Producto.id_finca == Finca.id_finca)
        .join(PedidoItem, PedidoItem.id_producto == Producto.id_producto)
        .filter(PedidoItem.id_pedido == pedido.id_pedido, PedidoItem.estado == 1)
        .distinct()
        .all()
    )
    return {f[0] for f in filas}


def transportista_asignado(db: Session, pedido: Pedido) -> Optional[int]:
    """Transportista de la solicitud activa (no rechazada) del pedido."""
    sol = (
        db.query(SolicitudTransporte)
        .filter(
            SolicitudTransporte.id_pedido == pedido.id_pedido,
            SolicitudTransporte.estado == 1,
            SolicitudTransporte.estado_solicitud != "RECHAZADO",
        )
        .first()
    )
    return sol.id_transportista if sol else None


def es_participante_pedido(db: Session, user: Usuario, pedido: Pedido) -> bool:
    """True si el usuario es la tienda, un productor o el transportista del pedido."""
    if pedido.id_tienda == user.id_usuario:
        return True
    if user.id_usuario in productores_del_pedido(db, pedido):
        return True
    return transportista_asignado(db, pedido) == user.id_usuario


def puede_ver_pedido(db: Session, user: Usuario, pedido: Pedido) -> bool:
    return es_admin(db, user) or es_participante_pedido(db, user, pedido)
