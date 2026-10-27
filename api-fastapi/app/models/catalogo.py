from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.usuario import AuditFields


class CategoriaCreate(BaseModel):
    nombre: str = Field(..., max_length=80)
    descripcion: Optional[str] = Field(None, max_length=255)


class CategoriaResponse(CategoriaCreate, AuditFields):
    id_categoria: int


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
