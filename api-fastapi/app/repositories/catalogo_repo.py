from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from app.core.database import Database
from app.models.entities import CategoriaProducto, Producto
from app.models.catalogo import ProductoCreate, ProductoUpdate, CategoriaCreate


class CatalogoRepository:
    """
    Repositorio de datos para Categorías y Productos según el Patrón Repository.
    Aisla la lógica de acceso a datos con soporte para SQL nativo y sesión activa.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = Database()
        self.session = db

    # --- CATEGORÍAS ---
    def obtener_categorias(self) -> List[Any]:
        if self.session:
            return self.session.query(CategoriaProducto).filter(CategoriaProducto.estado == 1).all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categoria_producto WHERE estado = 1 ORDER BY id_categoria ASC;")
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_categoria_por_id(self, id_categoria: int) -> Optional[Any]:
        if self.session:
            return self.session.query(CategoriaProducto).filter(
                CategoriaProducto.id_categoria == id_categoria,
                CategoriaProducto.estado == 1
            ).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categoria_producto WHERE id_categoria = %s AND estado = 1;", (id_categoria,))
            return cursor.fetchone()
        finally:
            conn.close()

    def obtener_categoria_por_nombre(self, nombre: str) -> Optional[Any]:
        if self.session:
            return self.session.query(CategoriaProducto).filter(
                CategoriaProducto.nombre == nombre,
                CategoriaProducto.estado == 1
            ).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categoria_producto WHERE nombre = %s AND estado = 1;", (nombre,))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear_categoria(self, cat: Union[CategoriaCreate, dict]) -> Any:
        cat_dict = cat if isinstance(cat, dict) else cat.dict()
        if self.session:
            nueva_cat = CategoriaProducto(
                nombre=cat_dict.get("nombre"),
                descripcion=cat_dict.get("descripcion"),
                estado=1
            )
            self.session.add(nueva_cat)
            self.session.commit()
            self.session.refresh(nueva_cat)
            return nueva_cat

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO categoria_producto (nombre, descripcion, estado)
                VALUES (%s, %s, 1)
                RETURNING *;
            """
            cursor.execute(query, (cat_dict.get("nombre"), cat_dict.get("descripcion")))
            nueva = cursor.fetchone()
            conn.commit()
            return nueva
        finally:
            conn.close()

    # --- PRODUCTOS ---
    def obtener_productos(
        self,
        id_categoria: Optional[int] = None,
        busqueda: Optional[str] = None,
        solo_con_stock: bool = False,
        skip: int = 0,
        limit: int = 50
    ) -> List[Any]:
        if self.session:
            query = self.session.query(Producto).filter(Producto.estado == 1)
            if id_categoria:
                query = query.filter(Producto.id_categoria == id_categoria)
            if busqueda:
                query = query.filter(Producto.nombre.ilike(f"%{busqueda}%"))
            if solo_con_stock:
                query = query.filter(Producto.stock_disponible > 0)
            return query.offset(skip).limit(limit).all()

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
            if busqueda:
                query += " AND nombre ILIKE %s"
                params.append(f"%{busqueda}%")
            if solo_con_stock:
                query += " AND stock_disponible > 0"
            query += " ORDER BY id_producto ASC LIMIT %s OFFSET %s;"
            params.extend([limit, skip])
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_producto_por_id(self, id_producto: int) -> Optional[Any]:
        if self.session:
            return self.session.query(Producto).filter(
                Producto.id_producto == id_producto,
                Producto.estado == 1
            ).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM producto WHERE id_producto = %s AND estado = 1;", (id_producto,))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear_producto(self, prod: Union[ProductoCreate, dict]) -> Any:
        p_dict = prod if isinstance(prod, dict) else prod.dict()
        if self.session:
            nuevo = Producto(
                id_finca=p_dict.get("id_finca"),
                id_categoria=p_dict.get("id_categoria"),
                nombre=p_dict.get("nombre"),
                descripcion=p_dict.get("descripcion"),
                unidad_medida=p_dict.get("unidad_medida", "KG"),
                precio_unitario=p_dict.get("precio_unitario"),
                stock_disponible=p_dict.get("stock_disponible", 0),
                imagen_url=p_dict.get("imagen_url"),
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
                INSERT INTO producto (id_finca, id_categoria, nombre, descripcion,
                                     unidad_medida, precio_unitario, stock_disponible, imagen_url, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
                RETURNING *;
            """
            cursor.execute(query, (
                p_dict.get("id_finca"),
                p_dict.get("id_categoria"),
                p_dict.get("nombre"),
                p_dict.get("descripcion"),
                p_dict.get("unidad_medida", "KG"),
                p_dict.get("precio_unitario"),
                p_dict.get("stock_disponible", 0),
                p_dict.get("imagen_url")
            ))
            nuevo = cursor.fetchone()
            conn.commit()
            return nuevo
        finally:
            conn.close()

    def actualizar_producto(self, id_producto: int, update_data: dict) -> Any:
        if self.session:
            prod = self.session.query(Producto).filter(Producto.id_producto == id_producto).first()
            if not prod:
                return None
            for field, value in update_data.items():
                setattr(prod, field, value)
            self.session.commit()
            self.session.refresh(prod)
            return prod

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
                return self.obtener_producto_por_id(id_producto)
            fields.append("actualizado = NOW()")
            values.append(id_producto)
            query = f"UPDATE producto SET {', '.join(fields)} WHERE id_producto = %s AND estado = 1 RETURNING *;"
            cursor.execute(query, tuple(values))
            actualizado = cursor.fetchone()
            conn.commit()
            return actualizado
        finally:
            conn.close()

    def eliminar_producto(self, id_producto: int) -> bool:
        """Borrado lógico según requerimiento: estado = 0"""
        if self.session:
            prod = self.session.query(Producto).filter(Producto.id_producto == id_producto).first()
            if not prod:
                return False
            prod.estado = 0
            self.session.commit()
            return True

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
