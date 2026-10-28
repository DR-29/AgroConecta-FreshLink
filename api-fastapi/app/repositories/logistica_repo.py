import uuid
from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from app.core.database import Database
from app.models.entities import Vehiculo, SolicitudTransporte
from app.models.logistica import VehiculoCreate, SolicitudTransporteCreate


class LogisticaRepository:
    """
    Repositorio de datos para Vehículos y Solicitudes de Transporte según el Patrón Repository.
    Aisla la lógica de acceso a datos con soporte para SQL nativo y sesión activa.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = Database()
        self.session = db

    # --- VEHÍCULOS ---
    def obtener_vehiculos(self, id_transportista: Optional[int] = None, solo_aprobados: bool = False) -> List[Any]:
        if self.session:
            query = self.session.query(Vehiculo).filter(Vehiculo.estado == 1)
            if id_transportista:
                query = query.filter(Vehiculo.id_transportista == id_transportista)
            if solo_aprobados:
                query = query.filter(Vehiculo.aprobado_admin == True)
            return query.all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM vehiculo WHERE estado = 1"
            params = []
            if id_transportista:
                query += " AND id_transportista = %s"
                params.append(id_transportista)
            if solo_aprobados:
                query += " AND aprobado_admin = TRUE"
            query += " ORDER BY id_vehiculo ASC;"
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_vehiculo_por_id(self, id_vehiculo: int) -> Optional[Any]:
        if self.session:
            return self.session.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo, Vehiculo.estado == 1).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vehiculo WHERE id_vehiculo = %s AND estado = 1;", (id_vehiculo,))
            return cursor.fetchone()
        finally:
            conn.close()

    def obtener_vehiculo_por_placa(self, placa: str) -> Optional[Any]:
        if self.session:
            return self.session.query(Vehiculo).filter(Vehiculo.placa == placa.upper()).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vehiculo WHERE UPPER(placa) = %s;", (placa.upper(),))
            return cursor.fetchone()
        finally:
            conn.close()

    def crear_vehiculo(self, vehiculo: Union[VehiculoCreate, dict], id_transportista: int, aprobado: bool = False) -> Any:
        v_dict = vehiculo if isinstance(vehiculo, dict) else vehiculo.dict()
        if self.session:
            nuevo = Vehiculo(
                id_transportista=id_transportista,
                placa=v_dict.get("placa").upper(),
                modelo=v_dict.get("modelo"),
                capacidad_toneladas=v_dict.get("capacidad_toneladas"),
                tipo_carroceria=v_dict.get("tipo_carroceria"),
                aprobado_admin=aprobado,
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
                INSERT INTO vehiculo (id_transportista, placa, modelo, capacidad_toneladas, tipo_carroceria, aprobado_admin, estado)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
                RETURNING *;
            """
            cursor.execute(query, (
                id_transportista,
                v_dict.get("placa").upper(),
                v_dict.get("modelo"),
                v_dict.get("capacidad_toneladas"),
                v_dict.get("tipo_carroceria"),
                aprobado
            ))
            nuevo = cursor.fetchone()
            conn.commit()
            return nuevo
        finally:
            conn.close()

    # --- SOLICITUDES DE TRANSPORTE ---
    def obtener_solicitudes(
        self,
        id_transportista: Optional[int] = None,
        estado_solicitud: Optional[str] = None
    ) -> List[Any]:
        if self.session:
            query = self.session.query(SolicitudTransporte).filter(SolicitudTransporte.estado == 1)
            if id_transportista:
                query = query.filter(SolicitudTransporte.id_transportista == id_transportista)
            if estado_solicitud:
                query = query.filter(SolicitudTransporte.estado_solicitud == estado_solicitud.upper())
            return query.order_by(SolicitudTransporte.id_solicitud.desc()).all()

        conn = self.db.get_connection()
        if not conn:
            return []
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM solicitud_transporte WHERE estado = 1"
            params = []
            if id_transportista:
                query += " AND id_transportista = %s"
                params.append(id_transportista)
            if estado_solicitud:
                query += " AND estado_solicitud = %s"
                params.append(estado_solicitud.upper())
            query += " ORDER BY id_solicitud DESC;"
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            conn.close()

    def obtener_solicitud_por_id(self, id_solicitud: int) -> Optional[Any]:
        if self.session:
            return self.session.query(SolicitudTransporte).filter(
                SolicitudTransporte.id_solicitud == id_solicitud,
                SolicitudTransporte.estado == 1
            ).first()

        conn = self.db.get_connection()
        if not conn:
            return None
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM solicitud_transporte WHERE id_solicitud = %s AND estado = 1;", (id_solicitud,))
            return cursor.fetchone()
        finally:
            conn.close()
