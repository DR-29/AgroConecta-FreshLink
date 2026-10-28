from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from app.core.database import Database
from app.models.entities import Finca
from app.models.finca import FincaCreate, FincaUpdate


class FincaRepository:
    """
    Repositorio de datos para la entidad Finca según el Patrón Repository.
    Aisla el acceso a datos (soporta SQL nativo con Database() y sesión activa).
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = Database()
        self.session = db

    def obtener_todos(self, id_productor: Optional[int] = None) -> List[Any]:
        if self.session:
            query = self.session.query(Finca).filter(Finca.estado == 1)
            if id_productor:
                query = query.filter(Finca.id_productor == id_productor)
            return query.all()

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

    def obtener_por_id(self, id_finca: int) -> Optional[Any]:
        if self.session:
            return self.session.query(Finca).filter(Finca.id_finca == id_finca, Finca.estado == 1).first()

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

    def obtener_por_productor_y_nombre(self, id_productor: int, nombre: str) -> Optional[Any]:
        if self.session:
            return self.session.query(Finca).filter(
                Finca.id_productor == id_productor,
                Finca.nombre == nombre,
                Finca.estado == 1
            ).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM finca
                WHERE id_productor = %s AND nombre = %s AND estado = 1;
            """, (id_productor, nombre))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear(self, finca: Union[FincaCreate, dict], id_productor: int) -> Any:
        finca_dict = finca if isinstance(finca, dict) else finca.dict()
        if self.session:
            nueva_finca = Finca(
                id_productor=id_productor,
                nombre=finca_dict.get("nombre"),
                departamento=finca_dict.get("departamento"),
                municipio=finca_dict.get("municipio"),
                vereda=finca_dict.get("vereda"),
                area_hectareas=finca_dict.get("area_hectareas"),
                estado=1
            )
            self.session.add(nueva_finca)
            self.session.commit()
            self.session.refresh(nueva_finca)
            return nueva_finca

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO finca (id_productor, nombre, departamento, municipio, vereda, area_hectareas, estado)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
                RETURNING *;
            """
            cursor.execute(query, (
                id_productor,
                finca_dict.get("nombre"),
                finca_dict.get("departamento"),
                finca_dict.get("municipio"),
                finca_dict.get("vereda"),
                finca_dict.get("area_hectareas")
            ))
            nueva = cursor.fetchone()
            conn.commit()
            return nueva
        finally:
            conn.close()

    def actualizar(self, id_finca: int, update_data: dict) -> Any:
        if self.session:
            finca = self.session.query(Finca).filter(Finca.id_finca == id_finca).first()
            if not finca:
                return None
            for field, value in update_data.items():
                setattr(finca, field, value)
            self.session.commit()
            self.session.refresh(finca)
            return finca

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            fields = []
            values = []
            for k, v in update_data.items():
                fields.append(f"{k} = %s")
                values.append(v)
            if not fields:
                return self.obtener_por_id(id_finca)
            fields.append("actualizado = NOW()")
            values.append(id_finca)
            query = f"UPDATE finca SET {', '.join(fields)} WHERE id_finca = %s AND estado = 1 RETURNING *;"
            cursor.execute(query, tuple(values))
            actualizada = cursor.fetchone()
            conn.commit()
            return actualizada
        finally:
            conn.close()

    def eliminar(self, id_finca: int) -> bool:
        """Borrado lógico según requerimiento del parcial: estado = 0"""
        if self.session:
            finca = self.session.query(Finca).filter(Finca.id_finca == id_finca).first()
            if not finca:
                return False
            finca.estado = 0
            self.session.commit()
            return True

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
