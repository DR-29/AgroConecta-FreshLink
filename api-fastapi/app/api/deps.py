from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.entities import Usuario, Rol, Modulo, ModuloXRol

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Usuario:
    """Extrae, verifica el token JWT y retorna el usuario autenticado activo."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales de autenticación no válidas o expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(Usuario).filter(Usuario.id_usuario == user_id, Usuario.estado == 1).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o dado de baja (estado inactivo)"
        )
    return user

def require_roles(allowed_roles: List[str]):
    """Dependencia para restringir el acceso a uno o varios roles específicos."""
    def role_checker(
        current_user: Usuario = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> Usuario:
        user_role = db.query(Rol).filter(Rol.id_rol == current_user.id_rol).first()
        if not user_role or user_role.nombre.upper() not in [r.upper() for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso denegado. Este recurso requiere uno de los siguientes roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def require_module_permission(modulo_codigo: str, accion: str = "leer"):
    """
    Dependencia de control granular RBAC usando la tabla moduloxrol.
    accion puede ser: 'crear', 'leer', 'actualizar', 'eliminar'.
    """
    def permission_checker(
        current_user: Usuario = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> Usuario:
        user_role = db.query(Rol).filter(Rol.id_rol == current_user.id_rol).first()
        if user_role and user_role.nombre.upper() == "ADMINISTRADOR":
            return current_user

        modulo = db.query(Modulo).filter(Modulo.codigo == modulo_codigo, Modulo.estado == 1).first()
        if not modulo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Módulo '{modulo_codigo}' no registrado o inactivo"
            )

        permiso = db.query(ModuloXRol).filter(
            ModuloXRol.id_rol == current_user.id_rol,
            ModuloXRol.id_modulo == modulo.id_modulo,
            ModuloXRol.estado == 1
        ).first()

        if not permiso:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tu rol no tiene acceso asignado al módulo '{modulo.nombre}'"
            )

        acciones_map = {
            "crear": permiso.puede_crear,
            "leer": permiso.puede_leer,
            "actualizar": permiso.puede_actualizar,
            "eliminar": permiso.puede_eliminar,
        }

        if not acciones_map.get(accion.lower(), False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso insuficiente. No tienes autorización para '{accion}' en el módulo '{modulo.nombre}'"
            )

        return current_user
    return permission_checker
