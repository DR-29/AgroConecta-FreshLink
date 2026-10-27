from typing import Optional, List, Dict, Any
from app.core.database import Database
from app.models.usuario import UsuarioCreate, UsuarioUpdate


class UsuarioRepository:
    """
    Repositorio de datos para la entidad Usuario con consultas SQL nativas
    respetando el borrado lógico (estado = 1) y auditoría.
    """
    def __init__(self):
        self.db = Database()

    def obtener_todos(self) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.id_usuario, u.id_rol, u.documento, u.nombres, u.apellidos,
                       u.correo, u.telefono, u.direccion, u.estado, u.creado, u.actualizado,
                       r.nombre as rol_nombre
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                WHERE u.estado = 1
                ORDER BY u.id_usuario ASC;
            """)
            usuarios = cursor.fetchall()
            return usuarios
        finally:
            conn.close()

    def obtener_por_id(self, id_usuario: int) -> Optional[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.id_usuario, u.id_rol, u.documento, u.nombres, u.apellidos,
                       u.correo, u.telefono, u.direccion, u.estado, u.creado, u.actualizado,
                       r.nombre as rol_nombre
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = %s AND u.estado = 1;
            """, (id_usuario,))
            return cursor.fetchone()
        finally:
            conn.close()

    def obtener_por_correo(self, correo: str) -> Optional[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.nombre as rol_nombre
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                WHERE u.correo = %s AND u.estado = 1;
            """, (correo,))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear(self, usuario: UsuarioCreate, contrasena_hash: str) -> Optional[int]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO usuario (id_rol, documento, nombres, apellidos, correo,
                                     telefono, direccion, contrasena_hash, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
                RETURNING id_usuario;
            """
            cursor.execute(query, (
                usuario.id_rol,
                usuario.documento,
                usuario.nombres,
                usuario.apellidos,
                usuario.correo,
                usuario.telefono,
                usuario.direccion,
                contrasena_hash
            ))
            nuevo_id = cursor.fetchone()["id_usuario"]
            conn.commit()
            return nuevo_id
        finally:
            conn.close()

    def eliminar(self, id_usuario: int) -> bool:
        """Borrado lógico según requerimiento de clase: estado = 0"""
        conn = self.db.get_connection()
        if not conn:
            return False
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE usuario
                SET estado = 0, actualizado = NOW()
                WHERE id_usuario = %s AND estado = 1
                RETURNING id_usuario;
            """, (id_usuario,))
            eliminado = cursor.fetchone()
            conn.commit()
            return eliminado is not None
        finally:
            conn.close()
