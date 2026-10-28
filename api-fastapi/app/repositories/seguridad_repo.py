from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from app.core.database import Database
from app.models.entities import Rol, Modulo, ModuloXRol
from app.models.seguridad import RolCreate, ModuloCreate, ModuloXRolCreate


class SeguridadRepository:
    """
    Repositorio de datos para Roles, Módulos y Permisos (RBAC) según el Patrón Repository.
    Aisla la lógica de acceso a datos con soporte para SQL nativo y sesión activa.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = Database()
        self.session = db

    # --- ROLES ---
    def obtener_roles(self) -> List[Any]:
        if self.session:
            return self.session.query(Rol).filter(Rol.estado == 1).all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rol WHERE estado = 1 ORDER BY id_rol ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_rol_por_id(self, id_rol: int) -> Optional[Any]:
        if self.session:
            return self.session.query(Rol).filter(Rol.id_rol == id_rol, Rol.estado == 1).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rol WHERE id_rol = %s AND estado = 1;", (id_rol,))
            return cursor.fetchone()
        finally:
            conn.close()

    def obtener_rol_por_nombre(self, nombre: str) -> Optional[Any]:
        if self.session:
            return self.session.query(Rol).filter(Rol.nombre == nombre.upper(), Rol.estado == 1).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rol WHERE UPPER(nombre) = %s AND estado = 1;", (nombre.upper(),))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear_rol(self, rol: Union[RolCreate, dict]) -> Any:
        r_dict = rol if isinstance(rol, dict) else rol.dict()
        if self.session:
            nuevo = Rol(
                nombre=r_dict.get("nombre").upper(),
                descripcion=r_dict.get("descripcion"),
                estado=1
            )
            self.session.add(nuevo)
            self.session.commit()
            self.session.refresh(nuevo)
            return nuevo

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO rol (nombre, descripcion, estado)
                VALUES (%s, %s, 1)
                RETURNING *;
            """
            cursor.execute(query, (r_dict.get("nombre").upper(), r_dict.get("descripcion")))
            nuevo = cursor.fetchone()
            conn.commit()
            return nuevo
        finally:
            conn.close()

    # --- MÓDULOS ---
    def obtener_modulos(self) -> List[Any]:
        if self.session:
            return self.session.query(Modulo).filter(Modulo.estado == 1).all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM modulo WHERE estado = 1 ORDER BY id_modulo ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_modulo_por_codigo(self, codigo: str) -> Optional[Any]:
        if self.session:
            return self.session.query(Modulo).filter(Modulo.codigo == codigo, Modulo.estado == 1).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM modulo WHERE codigo = %s AND estado = 1;", (codigo,))
            return cursor.fetchone()
        finally:
            conn.close()

    # --- PERMISOS (MODULO X ROL) ---
    def obtener_permisos_por_rol(self, id_rol: int) -> List[Any]:
        if self.session:
            return self.session.query(ModuloXRol).filter(ModuloXRol.id_rol == id_rol, ModuloXRol.estado == 1).all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT mxr.*, m.codigo as modulo_codigo, m.nombre as modulo_nombre
                FROM moduloxrol mxr
                JOIN modulo m ON mxr.id_modulo = m.id_modulo
                WHERE mxr.id_rol = %s AND mxr.estado = 1;
            """, (id_rol,))
            return cursor.fetchall()
        finally:
            conn.close()
