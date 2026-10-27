from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.usuario import AuditFields


class PedidoItemCreate(BaseModel):
    id_producto: int
    cantidad: Decimal = Field(..., gt=0)


class PedidoItemResponse(AuditFields):
    id_pedido_item: int
    id_pedido: int
    id_producto: int
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal


class PedidoCreate(BaseModel):
    direccion_entrega: str = Field(..., max_length=200)
    municipio_entrega: str = Field(..., max_length=80)
    notas: Optional[str] = None
    items: List[PedidoItemCreate]


class PedidoUpdate(BaseModel):
    estado_pedido: Optional[str] = None
    direccion_entrega: Optional[str] = None
    municipio_entrega: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[int] = None


class PedidoResponse(AuditFields):
    id_pedido: int
    codigo_pedido: str
    id_tienda: int
    direccion_entrega: str
    municipio_entrega: str
    estado_pedido: str
    total: Decimal
    notas: Optional[str] = None
    items: List[PedidoItemResponse] = []


class HistorialEstadoResponse(AuditFields):
    id_historial: int
    id_pedido: int
    estado_anterior: Optional[str] = None
    estado_nuevo: str
    observaciones: Optional[str] = None
