import uuid
from typing import List, Optional, Any
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import (
    Pedido, PedidoItem, Producto, Usuario, HistorialPedidoEstado, SolicitudTransporte, Finca
)
from app.schemas.schemas import (
    PedidoCreate, PedidoResponse, PedidoItemResponse
)
from app.repositories.pedido_repo import PedidoRepository
from app.api.deps import require_module_permission
from app.api.acceso import (
    ESTADOS_PEDIDO, nombre_rol, es_admin, productores_del_pedido,
    transportista_asignado, puede_ver_pedido
)

router = APIRouter()
MODULO = "MOD_PEDIDOS"

# Instancia del repositorio siguiendo el estándar de la guía
repo = PedidoRepository()

# Transiciones permitidas por rol (el ADMINISTRADOR puede cualquiera)
TRANSICIONES_POR_ROL = {
    "TIENDA": {"CANCELADO"},
    "PRODUCTOR": {"ACEPTADO", "PREPARANDO", "CANCELADO"},
    "TRANSPORTISTA": {"EN_RUTA", "ENTREGADO"},
}


def _respuesta(p: Pedido) -> PedidoResponse:
    resp = PedidoResponse.from_orm(p)
    resp.items = [PedidoItemResponse.from_orm(i) for i in p.items if i.estado == 1]
    return resp


@router.get("/", response_model=List[PedidoResponse], summary="Listar pedidos (según rol)")
def get_pedidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer")),
    estado_pedido: Optional[str] = Query(None, description="Filtrar por estado del pedido"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
) -> Any:
    """
    - ADMINISTRADOR: todos los pedidos.
    - TIENDA: solo sus pedidos.
    - PRODUCTOR: pedidos que contienen productos de sus fincas.
    - TRANSPORTISTA: pedidos que tiene asignados.
    """
    r = PedidoRepository(db)
    rol = nombre_rol(db, current_user)
    pedidos = r.obtener_pedidos(
        rol=rol,
        id_usuario=current_user.id_usuario,
        estado_pedido=estado_pedido,
        skip=skip,
        limit=limit
    )
    return [_respuesta(p) for p in pedidos]


@router.get("/{id_pedido}", response_model=PedidoResponse, summary="Obtener pedido por ID")
def get_pedido_by_id(
    id_pedido: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    r = PedidoRepository(db)
    p = r.obtener_por_id(id_pedido)
    if not p:
        raise HTTPException(status_code=404, detail="Pedido no encontrado o inactivo")
    if not puede_ver_pedido(db, current_user, p):
        raise HTTPException(status_code=403, detail="No participas en este pedido")
    return _respuesta(p)



@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED, summary="Crear orden de compra (Tiendas)")
def create_pedido(
    pedido_in: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea un pedido, valida y descuenta stock, y registra el historial inicial."""
    if not pedido_in.items:
        raise HTTPException(status_code=400, detail="El pedido debe contener al menos un producto")

    ids = [i.id_producto for i in pedido_in.items]
    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=400, detail="No repitas el mismo producto en el pedido; usa la cantidad")

    total_calculado = Decimal("0.00")
    items_a_crear = []

    for item in pedido_in.items:
        prod = db.query(Producto).filter(Producto.id_producto == item.id_producto, Producto.estado == 1).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto con ID {item.id_producto} no disponible")
        if prod.stock_disponible < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{prod.nombre}'. Disponible: {prod.stock_disponible}, Solicitado: {item.cantidad}"
            )
        prod.stock_disponible -= item.cantidad
        subtotal = prod.precio_unitario * item.cantidad
        total_calculado += subtotal
        items_a_crear.append((prod, item.cantidad, prod.precio_unitario, subtotal))

    nuevo_pedido = Pedido(
        codigo_pedido=f"PED-{uuid.uuid4().hex[:8].upper()}",
        id_tienda=current_user.id_usuario,
        direccion_entrega=pedido_in.direccion_entrega,
        municipio_entrega=pedido_in.municipio_entrega,
        estado_pedido="PENDIENTE",
        total=total_calculado,
        notas=pedido_in.notas,
        estado=1
    )
    db.add(nuevo_pedido)
    db.flush()

    for prod, cantidad, precio, subtotal in items_a_crear:
        db.add(PedidoItem(
            id_pedido=nuevo_pedido.id_pedido,
            id_producto=prod.id_producto,
            cantidad=cantidad,
            precio_unitario=precio,
            subtotal=subtotal,
            estado=1
        ))

    db.add(HistorialPedidoEstado(
        id_pedido=nuevo_pedido.id_pedido,
        id_usuario_cambio=current_user.id_usuario,
        estado_anterior=None,
        estado_nuevo="PENDIENTE",
        comentario="Creación inicial del pedido",
        estado=1
    ))

    db.commit()
    db.refresh(nuevo_pedido)
    return _respuesta(nuevo_pedido)


@router.patch("/{id_pedido}/estado", response_model=PedidoResponse, summary="Cambiar estado del pedido con trazabilidad")
def update_estado_pedido(
    id_pedido: int,
    nuevo_estado: str = Query(..., description="PENDIENTE, ACEPTADO, PREPARANDO, EN_RUTA, ENTREGADO, CANCELADO"),
    comentario: Optional[str] = Query(None, description="Observación sobre el cambio"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Actualiza el estado del pedido según el rol y repone stock si se cancela."""
    nuevo_estado = nuevo_estado.upper()
    if nuevo_estado not in ESTADOS_PEDIDO:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Valores permitidos: {', '.join(sorted(ESTADOS_PEDIDO))}")

    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido, Pedido.estado == 1).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    estado_anterior = pedido.estado_pedido
    if estado_anterior in {"ENTREGADO", "CANCELADO"}:
        raise HTTPException(status_code=400, detail=f"El pedido ya está {estado_anterior} y no admite más cambios")
    if estado_anterior == nuevo_estado:
        raise HTTPException(status_code=400, detail=f"El pedido ya se encuentra en estado {nuevo_estado}")

    if not es_admin(db, current_user):
        rol = nombre_rol(db, current_user)
        if rol == "TIENDA" and pedido.id_tienda != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="Este pedido no pertenece a tu tienda")
        if rol == "TIENDA" and estado_anterior != "PENDIENTE":
            raise HTTPException(status_code=400, detail="La tienda solo puede cancelar pedidos en estado PENDIENTE")
        if rol == "PRODUCTOR" and current_user.id_usuario not in productores_del_pedido(db, pedido):
            raise HTTPException(status_code=403, detail="El pedido no contiene productos de tus fincas")
        if rol == "TRANSPORTISTA" and transportista_asignado(db, pedido) != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No eres el transportista asignado a este pedido")
        if nuevo_estado not in TRANSICIONES_POR_ROL.get(rol, set()):
            raise HTTPException(status_code=403, detail=f"El rol {rol} no puede cambiar el pedido a {nuevo_estado}")

    if nuevo_estado == "CANCELADO":
        for item in pedido.items:
            if item.estado == 1:
                item.producto.stock_disponible += item.cantidad

    pedido.estado_pedido = nuevo_estado
    db.add(HistorialPedidoEstado(
        id_pedido=pedido.id_pedido,
        id_usuario_cambio=current_user.id_usuario,
        estado_anterior=estado_anterior,
        estado_nuevo=nuevo_estado,
        comentario=comentario or f"Transición de estado por {current_user.nombres}",
        estado=1
    ))
    db.commit()
    db.refresh(pedido)
    return _respuesta(pedido)


@router.get("/{id_pedido}/historial", summary="Historial de estados del pedido (trazabilidad)")
def get_historial_pedido(
    id_pedido: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "leer"))
) -> Any:
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if not puede_ver_pedido(db, current_user, pedido):
        raise HTTPException(status_code=403, detail="No participas en este pedido")
    return [
        {
            "id_historial": h.id_historial,
            "estado_anterior": h.estado_anterior,
            "estado_nuevo": h.estado_nuevo,
            "id_usuario_cambio": h.id_usuario_cambio,
            "comentario": h.comentario,
            "creado": h.creado,
        }
        for h in sorted(pedido.historial, key=lambda x: x.id_historial)
        if h.estado == 1
    ]


@router.delete("/{id_pedido}", summary="Borrado lógico de pedido (estado = 0)")
def delete_pedido_logico(
    id_pedido: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Solo roles con permiso 'eliminar' en MOD_PEDIDOS (por defecto, ADMINISTRADOR)."""
    pedido = db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.estado = 0
    db.commit()
    return {"mensaje": f"Pedido {id_pedido} desactivado lógicamente (estado = 0)"}
