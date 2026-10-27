from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.usuario import AuditFields


class CalificacionCreate(BaseModel):
    id_pedido: int
    id_calificado: int
    puntuacion: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None


class CalificacionResponse(CalificacionCreate, AuditFields):
    id_calificacion: int
    id_calificador: int
