import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.entities import (
    Rol, Usuario, Modulo, ModuloXRol, Finca, CategoriaProducto, Producto
)

# Base de datos de prueba en memoria SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_agroconecta.db"

engine_test = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    db = TestingSessionLocal()

    # 1. Roles
    roles = [
        Rol(id_rol=1, nombre="ADMINISTRADOR", descripcion="Admin"),
        Rol(id_rol=2, nombre="PRODUCTOR", descripcion="Productor"),
        Rol(id_rol=3, nombre="TIENDA", descripcion="Tienda"),
        Rol(id_rol=4, nombre="TRANSPORTISTA", descripcion="Transportista"),
    ]
    db.add_all(roles)

    # 2. Módulos
    modulos = [
        Modulo(id_modulo=1, codigo="MOD_SEGURIDAD", nombre="Seguridad", ruta="/seguridad"),
        Modulo(id_modulo=2, codigo="MOD_FINCAS", nombre="Fincas", ruta="/fincas"),
        Modulo(id_modulo=3, codigo="MOD_CATALOGO", nombre="Catálogo", ruta="/catalogo"),
        Modulo(id_modulo=4, codigo="MOD_PEDIDOS", nombre="Pedidos", ruta="/pedidos"),
        Modulo(id_modulo=5, codigo="MOD_LOGISTICA", nombre="Logística", ruta="/logistica"),
        Modulo(id_modulo=6, codigo="MOD_CALIDAD", nombre="Calidad", ruta="/calidad"),
    ]
    db.add_all(modulos)

    # 3. Permisos moduloxrol
    permisos = [
        # Admin
        ModuloXRol(id_rol=1, id_modulo=1, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=1, id_modulo=2, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=1, id_modulo=3, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=1, id_modulo=4, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=1, id_modulo=5, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=1, id_modulo=6, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        # Productor
        ModuloXRol(id_rol=2, id_modulo=2, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=2, id_modulo=3, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=True),
        ModuloXRol(id_rol=2, id_modulo=4, puede_crear=False, puede_leer=True, puede_actualizar=True, puede_eliminar=False),
        ModuloXRol(id_rol=2, id_modulo=5, puede_crear=True, puede_leer=True, puede_actualizar=False, puede_eliminar=False),
        ModuloXRol(id_rol=2, id_modulo=6, puede_crear=True, puede_leer=True, puede_actualizar=False, puede_eliminar=False),
        # Tienda
        ModuloXRol(id_rol=3, id_modulo=3, puede_crear=False, puede_leer=True, puede_actualizar=False, puede_eliminar=False),
        ModuloXRol(id_rol=3, id_modulo=4, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=False),
        ModuloXRol(id_rol=3, id_modulo=6, puede_crear=True, puede_leer=True, puede_actualizar=False, puede_eliminar=False),
        # Transportista
        ModuloXRol(id_rol=4, id_modulo=4, puede_crear=False, puede_leer=True, puede_actualizar=True, puede_eliminar=False),
        ModuloXRol(id_rol=4, id_modulo=5, puede_crear=True, puede_leer=True, puede_actualizar=True, puede_eliminar=False),
    ]
    db.add_all(permisos)

    # 4. Usuarios
    password_hash = get_password_hash("Password123*")
    usuarios = [
        Usuario(id_usuario=1, id_rol=1, documento="1000000001", nombres="Admin", apellidos="Plataforma", correo="admin@agroconecta.com", contrasena_hash=password_hash, estado=1),
        Usuario(id_usuario=2, id_rol=2, documento="1000000002", nombres="Carlos", apellidos="Pérez", correo="carlos.productor@agroconecta.com", contrasena_hash=password_hash, estado=1),
        Usuario(id_usuario=3, id_rol=3, documento="1000000003", nombres="María", apellidos="Restrepo", correo="maria.tienda@agroconecta.com", contrasena_hash=password_hash, estado=1),
        Usuario(id_usuario=4, id_rol=4, documento="1000000004", nombres="Jorge", apellidos="García", correo="jorge.transporte@agroconecta.com", contrasena_hash=password_hash, estado=1),
    ]
    db.add_all(usuarios)

    # 5. Categoria de prueba
    cat = CategoriaProducto(id_categoria=1, nombre="Hortalizas", descripcion="Frescas", estado=1)
    db.add(cat)

    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine_test)


def login(correo: str, contrasena: str = "Password123*") -> str:
    res = client.post("/api/v1/auth/login", data={"username": correo, "password": contrasena})
    assert res.status_code == 200, f"Fallo login para {correo}: {res.text}"
    return res.json()["access_token"]


def auth_header(token: str):
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# TESTS
# ============================================================================
def test_01_autenticacion_todos_los_roles():
    """Valida que todos los roles obtengan token JWT con Password123*."""
    for correo in [
        "admin@agroconecta.com",
        "carlos.productor@agroconecta.com",
        "maria.tienda@agroconecta.com",
        "jorge.transporte@agroconecta.com",
    ]:
        token = login(correo)
        assert token is not None and len(token) > 20

    # Credencial errónea debe dar 401
    res = client.post("/api/v1/auth/login", data={"username": "admin@agroconecta.com", "password": "WrongPassword"})
    assert res.status_code == 401


def test_02_rbac_tienda_no_puede_publicar_producto():
    """Valida que la tabla moduloxrol impida que una TIENDA publique productos."""
    token_tienda = login("maria.tienda@agroconecta.com")
    res = client.post(
        "/api/v1/catalogo/productos",
        json={
            "id_finca": 1,
            "id_categoria": 1,
            "nombre": "Tomate",
            "precio_unitario": 2000,
            "stock_disponible": 100,
            "unidad_medida": "KG"
        },
        headers=auth_header(token_tienda)
    )
    assert res.status_code == 403, f"Se esperaba 403, se obtuvo: {res.status_code}"


def test_03_flujo_productor_crea_finca_y_producto():
    """Productor registra finca y producto con éxito."""
    token_prod = login("carlos.productor@agroconecta.com")

    # Registrar Finca
    res_finca = client.post(
        "/api/v1/fincas/",
        json={"nombre": "Finca El Progreso", "departamento": "Cundinamarca", "municipio": "Fusagasugá", "area_hectareas": 10.5},
        headers=auth_header(token_prod)
    )
    assert res_finca.status_code == 201
    finca_id = res_finca.json()["id_finca"]

    # Publicar Producto
    res_prod = client.post(
        "/api/v1/catalogo/productos",
        json={
            "id_finca": finca_id,
            "id_categoria": 1,
            "nombre": "Tomate Chonto",
            "descripcion": "Rojo y maduro",
            "precio_unitario": 3500.0,
            "stock_disponible": 100.0,
            "unidad_medida": "KG"
        },
        headers=auth_header(token_prod)
    )
    assert res_prod.status_code == 201
    assert res_prod.json()["nombre"] == "Tomate Chonto"


def test_04_flujo_tienda_crea_pedido_y_descuenta_stock():
    """Tienda crea pedido, se descuenta stock y se genera historial."""
    token_tienda = login("maria.tienda@agroconecta.com")

    # Crear pedido de 30 KG de Tomate Chonto (ID 1)
    res_pedido = client.post(
        "/api/v1/pedidos/",
        json={
            "direccion_entrega": "Calle 45 # 10-20, Bogotá",
            "municipio_entrega": "Bogotá",
            "notas": "Entregar temprano",
            "items": [{"id_producto": 1, "cantidad": 30.0}]
        },
        headers=auth_header(token_tienda)
    )
    assert res_pedido.status_code == 201
    pedido = res_pedido.json()
    assert pedido["total"] == "105000.00"
    assert pedido["estado_pedido"] == "PENDIENTE"

    # Verificar que el stock bajó de 100 a 70
    res_prod = client.get("/api/v1/catalogo/productos/1")
    assert Decimal(str(res_prod.json()["stock_disponible"])) == Decimal("70.00")


def test_05_ciclo_logistico_y_entrega():
    """
    Productor acepta pedido.
    Transportista registra vehículo, admin aprueba.
    Productor solicita transporte.
    Transportista actualiza pedido a EN_RUTA y ENTREGADO.
    """
    token_admin = login("admin@agroconecta.com")
    token_prod = login("carlos.productor@agroconecta.com")
    token_trans = login("jorge.transporte@agroconecta.com")

    # 1. Productor acepta pedido
    res_acep = client.patch(
        "/api/v1/pedidos/1/estado?nuevo_estado=ACEPTADO&comentario=Confirmado por campesino",
        headers=auth_header(token_prod)
    )
    assert res_acep.status_code == 200
    assert res_acep.json()["estado_pedido"] == "ACEPTADO"

    # 2. Transportista registra vehículo
    res_veh = client.post(
        "/api/v1/logistica/vehiculos",
        json={"placa": "XYZ123", "modelo": "Hino 2023", "capacidad_toneladas": 3.5, "tipo_carroceria": "FURGON"},
        headers=auth_header(token_trans)
    )
    assert res_veh.status_code == 201
    veh_id = res_veh.json()["id_vehiculo"]

    # 3. Admin aprueba vehículo
    res_aprob = client.patch(
        f"/api/v1/logistica/vehiculos/{veh_id}/aprobar",
        headers=auth_header(token_admin)
    )
    assert res_aprob.status_code == 200
    assert res_aprob.json()["aprobado_admin"] is True

    # 4. Productor solicita transporte asignando a Jorge
    res_sol = client.post(
        "/api/v1/logistica/solicitudes",
        json={"id_pedido": 1, "id_transportista": 4, "id_vehiculo": veh_id, "costo_transporte": 45000.0, "observaciones": "Ruta Fusagasugá-Bogotá"},
        headers=auth_header(token_prod)
    )
    assert res_sol.status_code == 201

    # 5. Transportista pasa pedido a EN_RUTA y luego a ENTREGADO
    res_ruta = client.patch(
        "/api/v1/pedidos/1/estado?nuevo_estado=EN_RUTA",
        headers=auth_header(token_trans)
    )
    assert res_ruta.status_code == 200

    res_entregado = client.patch(
        "/api/v1/pedidos/1/estado?nuevo_estado=ENTREGADO",
        headers=auth_header(token_trans)
    )
    assert res_entregado.status_code == 200
    assert res_entregado.json()["estado_pedido"] == "ENTREGADO"


def test_06_calificacion_post_entrega():
    """Tienda califica al productor después de la entrega exitosa."""
    token_tienda = login("maria.tienda@agroconecta.com")

    res_cal = client.post(
        "/api/v1/calificaciones/",
        json={"id_pedido": 1, "id_calificado": 2, "puntuacion": 5, "comentario": "Excelente calidad de los tomates y muy puntuales"},
        headers=auth_header(token_tienda)
    )
    assert res_cal.status_code == 201
    assert res_cal.json()["puntuacion"] == 5


def test_07_borrado_logico_y_auditoria():
    """Borrado lógico: DELETE cambia estado a 0 sin borrar físicamente."""
    token_admin = login("admin@agroconecta.com")

    # Desactivar usuario 4
    res_del = client.delete("/api/v1/usuarios/4", headers=auth_header(token_admin))
    assert res_del.status_code == 200

    # Comprobar que en la base de datos sigue existiendo con estado = 0
    db = TestingSessionLocal()
    u = db.query(Usuario).filter(Usuario.id_usuario == 4).first()
    assert u is not None
    assert u.estado == 0
    db.close()
