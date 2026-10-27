from typing import Optional, List, Dict, Any
from app.core.database import Database
from app.models.finca import FincaCreate, FincaUpdate


class FincaRepository:
    """
    Repositorio de datos para la entidad Finca con consultas SQL nativas
    respetando el borrado lógico (estado = 1) y auditoría.
    """
    def __init__(self):
        self.db = Database()

    def obtener_todos(self, id_productor: Optional[int] = None) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            if id_productor:
                cursor.execute("""
                    SELECT * FROM finca
                    WHERE id_productor = %s AND estado = 1
                    ORDER BY id_finca ASC;
                """, (id_productor,))
            else:
                cursor.execute("""
                    SELECT * FROM finca
                    WHERE estado = 1
                    ORDER BY id_finca ASC;
                """)
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_por_id(self, id_finca: int) -> Optional[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM finca
                WHERE id_finca = %s AND estado = 1;
            """, (id_finca,))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear(self, finca: FincaCreate, id_productor: int) -> Optional[int]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO finca (id_productor, nombre, departamento, municipio, vereda, area_hectareas, estado)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
                RETURNING id_finca;
            """
            cursor.execute(query, (
                id_productor,
                finca.nombre,
                finca.departamento,
                finca.municipio,
                finca.vereda,
                finca.area_hectareas
            ))
            nuevo_id = cursor.fetchone()["id_finca"]
            conn.commit()
            return nuevo_id
        finally:
            conn.close()

    def actualizar(self, id_finca: int, finca: FincaUpdate) -> bool:
        conn = self.db.get_connection()
        if not conn:
            return False
        try:
            cursor = conn.cursor()
            fields = []
            values = []
            if finca.nombre is not None:
                fields.append("nombre = %s")
                values.append(finca.nombre)
            if finca.departamento is not None:
                fields.append("departamento = %s")
                values.append(finca.departamento)
            if finca.municipio is not None:
                fields.append("municipio = %s")
                values.append(finca.municipio)
            if finca.vereda is not None:
                fields.append("vereda = %s")
                values.append(finca.vereda)
            if finca.area_hectareas is not None:
                fields.append("area_hectareas = %s")
                values.append(finca.area_hectareas)

            if not fields:
                return True

            fields.append("actualizado = NOW()")
            values.append(id_finca)
            query = f"UPDATE finca SET {', '.join(fields)} WHERE id_finca = %s AND estado = 1 RETURNING id_finca;"
            cursor.execute(query, tuple(values))
            actualizado = cursor.fetchone()
            conn.commit()
            return actualizado is not None
        finally:
            conn.close()

    def eliminar(self, id_finca: int) -> bool:
        """Borrado lógico según requerimiento de clase: estado = 0"""
        conn = self.db.get_connection()
        if not conn:
            return False
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE finca
                SET estado = 0, actualizado = NOW()
                WHERE id_finca = %s AND estado = 1
                RETURNING id_finca;
            """, (id_finca,))
            eliminado = cursor.fetchone()
            conn.commit()
            return eliminado is not None
        finally:
            conn.close()
