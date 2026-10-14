from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.entities import Usuario, Rol
from app.schemas.schemas import Token, LoginRequest, UsuarioCreate, UsuarioResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token, summary="Inicio de sesión y generación de JWT")
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """Autentica al usuario y genera el token JWT."""
    user = db.query(Usuario).filter(
        Usuario.correo == form_data.username,
        Usuario.estado == 1
    ).first()

    if not user or not verify_password(form_data.password, user.contrasena_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    rol_nombre = rol.nombre if rol else "DESCONOCIDO"

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id_usuario,
        expires_delta=access_token_expires
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "id_usuario": user.id_usuario,
        "correo": user.correo,
        "nombres": user.nombres,
        "apellidos": user.apellidos,
        "rol": rol_nombre
    }

@router.post("/login-json", response_model=Token, summary="Inicio de sesión con JSON")
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """Inicio de sesión con JSON."""
    user = db.query(Usuario).filter(
        Usuario.correo == login_data.correo,
        Usuario.estado == 1
    ).first()

    if not user or not verify_password(login_data.contrasena, user.contrasena_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    rol = db.query(Rol).filter(Rol.id_rol == user.id_rol).first()
    rol_nombre = rol.nombre if rol else "DESCONOCIDO"

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id_usuario,
        expires_delta=access_token_expires
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "id_usuario": user.id_usuario,
        "correo": user.correo,
        "nombres": user.nombres,
        "apellidos": user.apellidos,
        "rol": rol_nombre
    }

@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, summary="Registro público de nuevos usuarios")
def register_user(
    user_in: UsuarioCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Registro de nuevos usuarios."""
    if db.query(Usuario).filter(Usuario.correo == user_in.correo).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )
    
    if db.query(Usuario).filter(Usuario.documento == user_in.documento).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de documento ya se encuentra registrado"
        )

    rol = db.query(Rol).filter(Rol.id_rol == user_in.id_rol, Rol.estado == 1).first()
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El rol especificado no existe o está inactivo"
        )

    nuevo_usuario = Usuario(
        id_rol=user_in.id_rol,
        documento=user_in.documento,
        nombres=user_in.nombres,
        apellidos=user_in.apellidos,
        correo=user_in.correo,
        telefono=user_in.telefono,
        direccion=user_in.direccion,
        contrasena_hash=get_password_hash(user_in.contrasena),
        estado=1
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    res = UsuarioResponse.from_orm(nuevo_usuario)
    res.rol_nombre = rol.nombre
    return res

@router.get("/me", response_model=UsuarioResponse, summary="Obtener perfil del usuario autenticado")
def get_user_me(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Devuelve los datos del usuario correspondiente al token JWT provisto."""
    rol = db.query(Rol).filter(Rol.id_rol == current_user.id_rol).first()
    res = UsuarioResponse.from_orm(current_user)
    res.rol_nombre = rol.nombre if rol else None
    return res
