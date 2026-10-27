from typing import Optional, List, Dict, Any
from app.core.database import Database


class SeguridadRepository:
    """
    Repositorio de datos para Roles, Módulos y Permisos (RBAC) con SQL puro
    respetando borrado lógico (estado = 1) y auditoría.
    """
    def __init__(self):
        self.db = Database()

    def obtener_roles(self) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rol WHERE estado = 1 ORDER BY id_rol ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_modulos(self) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM modulo WHERE estado = 1 ORDER BY id_modulo ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_permisos_por_rol(self, id_rol: int) -> List[Dict[str, Any]]:
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
