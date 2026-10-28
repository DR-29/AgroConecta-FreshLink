import uuid
from typing import Optional, List, Dict, Any, Union
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.database import Database
from app.models.entities import Pedido, PedidoItem, Producto, Finca, SolicitudTransporte, HistorialPedidoEstado


class PedidoRepository:
    """
    Repositorio de datos para la entidad Pedido según el Patrón Repository.
    Aisla el acceso a datos con soporte para SQL nativo y sesión activa.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = Database()
        self.session = db

    def obtener_pedidos(
        self,
        rol: str,
        id_usuario: int,
        estado_pedido: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Any]:
        if self.session:
            query = self.session.query(Pedido).filter(Pedido.estado == 1)
            if rol == "TIENDA":
                query = query.filter(Pedido.id_tienda == id_usuario)
            elif rol == "PRODUCTOR":
                query = (
                    query.join(PedidoItem, PedidoItem.id_pedido == Pedido.id_pedido)
                    .join(Producto, Producto.id_producto == PedidoItem.id_producto)
                    .join(Finca, Finca.id_finca == Producto.id_finca)
                    .filter(Finca.id_productor == id_usuario)
                    .distinct()
                )
            elif rol == "TRANSPORTISTA":
                query = (
                    query.join(SolicitudTransporte, SolicitudTransporte.id_pedido == Pedido.id_pedido)
                    .filter(
                        SolicitudTransporte.id_transportista == id_usuario,
                        SolicitudTransporte.estado == 1,
                        SolicitudTransporte.estado_solicitud != "RECHAZADO"
                    )
                )

            if estado_pedido:
                query = query.filter(Pedido.estado_pedido == estado_pedido.upper())

            return query.offset(skip).limit(limit).all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM pedido WHERE estado = 1"
            params = []
            if rol == "TIENDA":
                query += " AND id_tienda = %s"
                params.append(id_usuario)
            if estado_pedido:
                query += " AND estado_pedido = %s"
                params.append(estado_pedido.upper())
            query += " ORDER BY id_pedido DESC LIMIT %s OFFSET %s;"
            params.extend([limit, skip])
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_por_id(self, id_pedido: int) -> Optional[Any]:
        if self.session:
            return self.session.query(Pedido).filter(Pedido.id_pedido == id_pedido, Pedido.estado == 1).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM pedido WHERE id_pedido = %s AND estado = 1;", (id_pedido,))
            pedido = cursor.fetchone()
            if pedido:
                cursor.execute("SELECT * FROM pedido_item WHERE id_pedido = %s AND estado = 1;", (id_pedido,))
                pedido["items"] = cursor.fetchall()
            return pedido
        finally:
            conn.close()

    def actualizar_estado(
        self,
        id_pedido: int,
        nuevo_estado: str,
        id_usuario: int,
        observaciones: Optional[str] = None
    ) -> Optional[Any]:
        if self.session:
            p = self.session.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
            if not p:
                return None
            antiguo = p.estado_pedido
            p.estado_pedido = nuevo_estado
            hist = HistorialPedidoEstado(
                id_pedido=p.id_pedido,
                id_usuario_cambio=id_usuario,
                estado_anterior=antiguo,
                estado_nuevo=nuevo_estado,
                observaciones=observaciones
            )
            self.session.add(hist)
            self.session.commit()
            self.session.refresh(p)
            return p

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE pedido
                SET estado_pedido = %s, actualizado = NOW()
                WHERE id_pedido = %s AND estado = 1
                RETURNING *;
            """, (nuevo_estado, id_pedido))
            actualizado = cursor.fetchone()
            conn.commit()
            return actualizado
        finally:
            conn.close()
