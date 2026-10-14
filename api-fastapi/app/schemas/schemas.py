from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field

# Base
class AuditFields(BaseModel):
    estado: int = 1
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id_usuario: int
    correo: str
    nombres: str
    apellidos: str
    rol: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str

# Rol
class RolBase(BaseModel):
    nombre: str = Field(..., max_length=50)
    descripcion: Optional[str] = Field(None, max_length=255)

class RolCreate(RolBase):
    pass

class RolUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[int] = None

class RolResponse(RolBase, AuditFields):
    id_rol: int

# Usuario
class UsuarioBase(BaseModel):
    documento: str = Field(..., max_length=30)
    nombres: str = Field(..., max_length=100)
    apellidos: str = Field(..., max_length=100)
    correo: EmailStr
    telefono: Optional[str] = Field(None, max_length=30)
    direccion: Optional[str] = Field(None, max_length=200)
    id_rol: int

class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(..., min_length=6)

class UsuarioUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    id_rol: Optional[int] = None
    contrasena: Optional[str] = None
    estado: Optional[int] = None

class UsuarioResponse(UsuarioBase, AuditFields):
    id_usuario: int
    rol_nombre: Optional[str] = None

# Modulo y ModuloXRol
class ModuloBase(BaseModel):
    codigo: str = Field(..., max_length=50)
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    ruta: str = Field(..., max_length=100)

class ModuloCreate(ModuloBase):
    pass

class ModuloResponse(ModuloBase, AuditFields):
    id_modulo: int

class ModuloXRolCreate(BaseModel):
    id_rol: int
    id_modulo: int
    puede_crear: bool = True
    puede_leer: bool = True
    puede_actualizar: bool = True
    puede_eliminar: bool = False

class ModuloXRolUpdate(BaseModel):
    puede_crear: Optional[bool] = None
    puede_leer: Optional[bool] = None
    puede_actualizar: Optional[bool] = None
    puede_eliminar: Optional[bool] = None
    estado: Optional[int] = None

class ModuloXRolResponse(AuditFields):
    id_moduloxrol: int
    id_rol: int
    id_modulo: int
    puede_crear: bool
    puede_leer: bool
    puede_actualizar: bool
    puede_eliminar: bool

# Finca
class FincaBase(BaseModel):
    nombre: str = Field(..., max_length=120)
    departamento: str = Field(..., max_length=80)
    municipio: str = Field(..., max_length=80)
    vereda: Optional[str] = Field(None, max_length=120)
    area_hectareas: Optional[Decimal] = None

class FincaCreate(FincaBase):
    id_productor: Optional[int] = None

class FincaUpdate(BaseModel):
    nombre: Optional[str] = None
    departamento: Optional[str] = None
    municipio: Optional[str] = None
    vereda: Optional[str] = None
    area_hectareas: Optional[Decimal] = None
    estado: Optional[int] = None

class FincaResponse(FincaBase, AuditFields):
    id_finca: int
    id_productor: int

# CategoriaProducto
class CategoriaCreate(BaseModel):
    nombre: str = Field(..., max_length=80)
    descripcion: Optional[str] = Field(None, max_length=255)

class CategoriaResponse(CategoriaCreate, AuditFields):
    id_categoria: int

# Producto
class ProductoBase(BaseModel):
    id_finca: int
    id_categoria: int
    nombre: str = Field(..., max_length=120)
    descripcion: Optional[str] = None
    unidad_medida: str = Field("KG", max_length=30)
    precio_unitario: Decimal = Field(..., ge=0)
    stock_disponible: Decimal = Field(0, ge=0)
    imagen_url: Optional[str] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    unidad_medida: Optional[str] = None
    precio_unitario: Optional[Decimal] = Field(None, ge=0)
    stock_disponible: Optional[Decimal] = Field(None, ge=0)
    imagen_url: Optional[str] = None
    estado: Optional[int] = None

class ProductoResponse(ProductoBase, AuditFields):
    id_producto: int

# PedidoItem
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

# Pedido
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

# Vehiculo
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

# SolicitudTransporte
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

# Calificacion
class CalificacionCreate(BaseModel):
    id_pedido: int
    id_calificado: int
    puntuacion: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None

class CalificacionResponse(CalificacionCreate, AuditFields):
    id_calificacion: int
    id_calificador: int
