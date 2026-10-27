from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class AuditFields(BaseModel):
    estado: int = 1
    creado: Optional[datetime] = None
    actualizado: Optional[datetime] = None

    class Config:
        from_attributes = True


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
