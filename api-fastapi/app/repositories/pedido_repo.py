from typing import Optional, List, Dict, Any
from app.core.database import Database


class PedidoRepository:
    """
    Repositorio de datos para Pedidos e Items con SQL puro
    respetando borrado lógico (estado = 1) y auditoría.
    """
    def __init__(self):
        self.db = Database()

    def obtener_todos(self, id_tienda: Optional[int] = None) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            if id_tienda:
                cursor.execute("""
                    SELECT * FROM pedido
                    WHERE id_tienda = %s AND estado = 1
                    ORDER BY id_pedido DESC;
                """, (id_tienda,))
            else:
                cursor.execute("""
                    SELECT * FROM pedido
                    WHERE estado = 1
                    ORDER BY id_pedido DESC;
                """)
            pedidos = cursor.fetchall()
            return pedidos
        finally:
            conn.close()

    def obtener_por_id(self, id_pedido: int) -> Optional[Dict[str, Any]]:
        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM pedido WHERE id_pedido = %s AND estado = 1;", (id_pedido,))
            pedido = cursor.fetchone()
            if pedido:
                cursor.execute("""
                    SELECT * FROM pedido_item
                    WHERE id_pedido = %s AND estado = 1;
                """, (id_pedido,))
                pedido["items"] = cursor.fetchall()
            return pedido
        finally:
            conn.close()

    def actualizar_estado(self, id_pedido: int, nuevo_estado: str) -> bool:
        conn = self.db.get_connection()
        if not conn:
            return False
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE pedido
                SET estado_pedido = %s, actualizado = NOW()
                WHERE id_pedido = %s AND estado = 1
                RETURNING id_pedido;
            """, (nuevo_estado, id_pedido))
            actualizado = cursor.fetchone()
            conn.commit()
            return actualizado is not None
        finally:
            conn.close()
