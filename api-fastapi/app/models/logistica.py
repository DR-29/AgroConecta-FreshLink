from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.usuario import AuditFields


class VehiculoBase(BaseModel):
    placa: str = Field(..., max_length=15)
    modelo: Optional[str] = Field(None, max_length=50)
    capacidad_toneladas: Decimal = Field(..., gt=0)
    tipo_carroceria: str = Field(..., max_length=60)


class VehiculoCreate(VehiculoBase):
    id_transportista: Optional[int] = None


class VehiculoUpdate(BaseModel):
    modelo: Optional[str] = None
    capacidad_toneladas: Optional[Decimal] = None
    tipo_carroceria: Optional[str] = None
    aprobado_admin: Optional[bool] = None
    estado: Optional[int] = None


class VehiculoResponse(VehiculoBase, AuditFields):
    id_vehiculo: int
    id_transportista: int
    aprobado_admin: bool


class SolicitudTransporteCreate(BaseModel):
    id_pedido: int
    id_transportista: Optional[int] = None
    id_vehiculo: Optional[int] = None
    costo_transporte: Decimal = Field(0, ge=0)
    observaciones: Optional[str] = None


class SolicitudTransporteUpdate(BaseModel):
    id_transportista: Optional[int] = None
    id_vehiculo: Optional[int] = None
    estado_solicitud: Optional[str] = None
    costo_transporte: Optional[Decimal] = None
    observaciones: Optional[str] = None
    estado: Optional[int] = None


class SolicitudTransporteResponse(AuditFields):
    id_solicitud: int
    codigo_seguimiento: str
    id_pedido: int
    id_transportista: Optional[int] = None
    id_vehiculo: Optional[int] = None
    estado_solicitud: str
    costo_transporte: Decimal
    observaciones: Optional[str] = None
