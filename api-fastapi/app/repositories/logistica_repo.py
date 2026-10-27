from typing import Optional, List, Dict, Any
from app.core.database import Database


class LogisticaRepository:
    """
    Repositorio de datos para Vehículos y Solicitudes de Transporte con SQL puro
    respetando borrado lógico (estado = 1) y auditoría.
    """
    def __init__(self):
        self.db = Database()

    def obtener_vehiculos(self, id_transportista: Optional[int] = None) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            if id_transportista:
                cursor.execute("""
                    SELECT * FROM vehiculo
                    WHERE id_transportista = %s AND estado = 1
                    ORDER BY id_vehiculo ASC;
                """, (id_transportista,))
            else:
                cursor.execute("SELECT * FROM vehiculo WHERE estado = 1 ORDER BY id_vehiculo ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_solicitudes(self, id_transportista: Optional[int] = None) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            if id_transportista:
                cursor.execute("""
                    SELECT * FROM solicitud_transporte
                    WHERE id_transportista = %s AND estado = 1
                    ORDER BY id_solicitud DESC;
                """, (id_transportista,))
            else:
                cursor.execute("SELECT * FROM solicitud_transporte WHERE estado = 1 ORDER BY id_solicitud DESC;")
            return cursor.fetchall()
        finally:
            conn.close()
