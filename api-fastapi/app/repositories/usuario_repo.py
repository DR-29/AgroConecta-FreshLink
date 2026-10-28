from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from app.core.database import Database
from app.models.entities import Usuario, Rol
from app.models.usuario import UsuarioCreate, UsuarioUpdate


class UsuarioRepository:
    """
    Repositorio de datos para Usuario y Roles según el Patrón Repository.
    Aisla la lógica de acceso a datos con soporte para SQL nativo y sesión activa.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = Database()
        self.session = db

    def obtener_todos(self, solo_activos: bool = True, skip: int = 0, limit: int = 100) -> List[Any]:
        if self.session:
            query = self.session.query(Usuario)
            if solo_activos:
                query = query.filter(Usuario.estado == 1)
            usuarios = query.offset(skip).limit(limit).all()
            roles_dict = {r.id_rol: r.nombre for r in self.session.query(Rol).all()}
            for u in usuarios:
                setattr(u, "rol_nombre", roles_dict.get(u.id_rol))
            return usuarios

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            where = "WHERE u.estado = 1" if solo_activos else ""
            cursor.execute(f"""
                SELECT u.id_usuario, u.id_rol, u.documento, u.nombres, u.apellidos,
                       u.correo, u.telefono, u.direccion, u.estado, u.creado, u.actualizado,
                       r.nombre as rol_nombre
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                {where}
                ORDER BY u.id_usuario ASC
                LIMIT %s OFFSET %s;
            """, (limit, skip))
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_por_id(self, id_usuario: int) -> Optional[Any]:
        if self.session:
            user = self.session.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
            if user:
                rol = self.session.query(Rol).filter(Rol.id_rol == user.id_rol).first()
                setattr(user, "rol_nombre", rol.nombre if rol else None)
            return user

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
                WHERE u.id_usuario = %s;
            """, (id_usuario,))
            return cursor.fetchone()
        finally:
            conn.close()

    def obtener_por_correo(self, correo: str) -> Optional[Any]:
        if self.session:
            user = self.session.query(Usuario).filter(Usuario.correo == correo, Usuario.estado == 1).first()
            if user:
                rol = self.session.query(Rol).filter(Rol.id_rol == user.id_rol).first()
                setattr(user, "rol_nombre", rol.nombre if rol else None)
            return user

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

    def obtener_por_documento(self, documento: str) -> Optional[Any]:
        if self.session:
            return self.session.query(Usuario).filter(Usuario.documento == documento).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM usuario WHERE documento = %s;", (documento,))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear(self, usuario: Union[UsuarioCreate, dict], contrasena_hash: str) -> Any:
        u_dict = usuario if isinstance(usuario, dict) else usuario.dict()
        if self.session:
            nuevo = Usuario(
                id_rol=u_dict.get("id_rol"),
                documento=u_dict.get("documento"),
                nombres=u_dict.get("nombres"),
                apellidos=u_dict.get("apellidos"),
                correo=u_dict.get("correo"),
                telefono=u_dict.get("telefono"),
                direccion=u_dict.get("direccion"),
                contrasena_hash=contrasena_hash,
                estado=1
            )
            self.session.add(nuevo)
            self.session.commit()
            self.session.refresh(nuevo)
            rol = self.session.query(Rol).filter(Rol.id_rol == nuevo.id_rol).first()
            setattr(nuevo, "rol_nombre", rol.nombre if rol else None)
            return nuevo

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO usuario (id_rol, documento, nombres, apellidos, correo,
                                     telefono, direccion, contrasena_hash, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
                RETURNING *;
            """
            cursor.execute(query, (
                u_dict.get("id_rol"),
                u_dict.get("documento"),
                u_dict.get("nombres"),
                u_dict.get("apellidos"),
                u_dict.get("correo"),
                u_dict.get("telefono"),
                u_dict.get("direccion"),
                contrasena_hash
            ))
            nuevo = cursor.fetchone()
            conn.commit()
            return nuevo
        finally:
            conn.close()

    def actualizar(self, id_usuario: int, update_data: dict) -> Any:
        if self.session:
            user = self.session.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
            if not user:
                return None
            for field, value in update_data.items():
                setattr(user, field, value)
            self.session.commit()
            self.session.refresh(user)
            rol = self.session.query(Rol).filter(Rol.id_rol == user.id_rol).first()
            setattr(user, "rol_nombre", rol.nombre if rol else None)
            return user

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
                return self.obtener_por_id(id_usuario)
            fields.append("actualizado = NOW()")
            values.append(id_usuario)
            query = f"UPDATE usuario SET {', '.join(fields)} WHERE id_usuario = %s RETURNING *;"
            cursor.execute(query, tuple(values))
            actualizado = cursor.fetchone()
            conn.commit()
            return actualizado
        finally:
            conn.close()

    def eliminar(self, id_usuario: int) -> bool:
        """Borrado lógico según requerimiento: estado = 0"""
        if self.session:
            user = self.session.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
            if not user:
                return False
            user.estado = 0
            self.session.commit()
            return True

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
