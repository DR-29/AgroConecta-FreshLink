from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.usuario import AuditFields


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
