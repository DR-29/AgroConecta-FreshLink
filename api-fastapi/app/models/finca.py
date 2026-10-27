from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.usuario import AuditFields


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
