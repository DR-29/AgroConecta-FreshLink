from typing import Optional, List, Dict, Any
from app.core.database import Database
from app.models.catalogo import ProductoCreate, ProductoUpdate, CategoriaCreate


class CatalogoRepository:
    """
    Repositorio de datos para Categorías y Productos con SQL puro
    respetando borrado lógico (estado = 1) y auditoría.
    """
    def __init__(self):
        self.db = Database()

    def obtener_categorias(self) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categoria_producto WHERE estado = 1 ORDER BY id_categoria ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_productos(
        self,
        id_categoria: Optional[int] = None,
        id_finca: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM producto WHERE estado = 1"
            params = []
            if id_categoria:
                query += " AND id_categoria = %s"
                params.append(id_categoria)
            if id_finca:
                query += " AND id_finca = %s"
                params.append(id_finca)
            query += " ORDER BY id_producto ASC;"
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_producto_por_id(self, id_producto: int) -> Optional[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM producto WHERE id_producto = %s AND estado = 1;", (id_producto,))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear_producto(self, producto: ProductoCreate) -> Optional[int]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO producto (id_finca, id_categoria, nombre, descripcion,
                                     unidad_medida, precio_unitario, stock_disponible, imagen_url, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
                RETURNING id_producto;
            """
            cursor.execute(query, (
                producto.id_finca,
                producto.id_categoria,
                producto.nombre,
                producto.descripcion,
                producto.unidad_medida,
                producto.precio_unitario,
                producto.stock_disponible,
                producto.imagen_url
            ))
            nuevo_id = cursor.fetchone()["id_producto"]
            conn.commit()
            return nuevo_id
        finally:
            conn.close()

    def eliminar_producto(self, id_producto: int) -> bool:
        conn = self.db.get_connection()
        if not conn:
            return False
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE producto
                SET estado = 0, actualizado = NOW()
                WHERE id_producto = %s AND estado = 1
                RETURNING id_producto;
            """, (id_producto,))
            eliminado = cursor.fetchone()
            conn.commit()
            return eliminado is not None
        finally:
            conn.close()
