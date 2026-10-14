from typing import List, Optional, Any
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import CategoriaProducto, Producto, Finca, Usuario
from app.schemas.schemas import (
    CategoriaResponse, CategoriaCreate,
    ProductoResponse, ProductoCreate, ProductoUpdate
)
from app.api.deps import require_module_permission
from app.api.acceso import es_admin, nombre_rol

router = APIRouter()
MODULO = "MOD_CATALOGO"

# Categorías
@router.get("/categorias", response_model=List[CategoriaResponse], summary="Listar categorías de productos (Público)")
def get_categorias(
    db: Session = Depends(get_db)
) -> Any:
    """Lista todas las categorías activas (consulta abierta para catálogo)."""
    return db.query(CategoriaProducto).filter(CategoriaProducto.estado == 1).all()

@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED, summary="Crear categoría")
def create_categoria(
    cat_in: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea una nueva categoría de productos agrícolas."""
    if not es_admin(db, current_user):
        raise HTTPException(status_code=403, detail="Solo los administradores pueden crear categorías globales")

    if db.query(CategoriaProducto).filter(CategoriaProducto.nombre == cat_in.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    nueva_cat = CategoriaProducto(
        nombre=cat_in.nombre,
        descripcion=cat_in.descripcion,
        estado=1
    )
    db.add(nueva_cat)
    db.commit()
    db.refresh(nueva_cat)
    return nueva_cat

# Catálogo de productos
@router.get("/productos", response_model=List[ProductoResponse], summary="Listar catálogo de productos con filtros (Público)")
def get_productos(
    id_categoria: Optional[int] = Query(None, description="Filtrar por categoría"),
    busqueda: Optional[str] = Query(None, description="Búsqueda por nombre de producto"),
    solo_con_stock: bool = Query(False, description="Filtrar solo con stock disponible"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
) -> Any:
    """Consulta pública del catálogo de cosechas disponibles."""
    query = db.query(Producto).filter(Producto.estado == 1)

    if id_categoria:
        query = query.filter(Producto.id_categoria == id_categoria)
    if busqueda:
        query = query.filter(Producto.nombre.ilike(f"%{busqueda}%"))
    if solo_con_stock:
        query = query.filter(Producto.stock_disponible > 0)

    return query.offset(skip).limit(limit).all()

@router.get("/productos/{id_producto}", response_model=ProductoResponse, summary="Obtener producto por ID (Público)")
def get_producto_by_id(
    id_producto: int,
    db: Session = Depends(get_db)
) -> Any:
    """Detalle de un producto agrícola."""
    prod = db.query(Producto).filter(Producto.id_producto == id_producto, Producto.estado == 1).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado o inactivo")
    return prod

@router.post("/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED, summary="Publicar producto en finca")
def create_producto(
    prod_in: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Permite al productor publicar cosechas asociadas a su finca."""
    finca = db.query(Finca).filter(Finca.id_finca == prod_in.id_finca, Finca.estado == 1).first()
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada o inactiva")

    if not es_admin(db, current_user) and finca.id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No puedes publicar productos en una finca que no te pertenece")

    cat = db.query(CategoriaProducto).filter(CategoriaProducto.id_categoria == prod_in.id_categoria, CategoriaProducto.estado == 1).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada o inactiva")

    nuevo_producto = Producto(
        id_finca=prod_in.id_finca,
        id_categoria=prod_in.id_categoria,
        nombre=prod_in.nombre,
        descripcion=prod_in.descripcion,
        unidad_medida=prod_in.unidad_medida,
        precio_unitario=prod_in.precio_unitario,
        stock_disponible=prod_in.stock_disponible,
        imagen_url=prod_in.imagen_url,
        estado=1
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@router.put("/productos/{id_producto}", response_model=ProductoResponse, summary="Actualizar producto")
def update_producto(
    id_producto: int,
    prod_in: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Actualiza stock, precio o detalles del producto."""
    prod = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    finca = db.query(Finca).filter(Finca.id_finca == prod.id_finca).first()
    if not es_admin(db, current_user) and finca.id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para editar este producto")

    for field, value in prod_in.dict(exclude_unset=True).items():
        setattr(prod, field, value)

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/productos/{id_producto}", summary="Borrado lógico de producto (estado = 0)")
def delete_producto_logico(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de producto del catálogo."""
    prod = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    finca = db.query(Finca).filter(Finca.id_finca == prod.id_finca).first()
    if not es_admin(db, current_user) and finca.id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para eliminar este producto")

    prod.estado = 0
    db.commit()
    return {"mensaje": f"Producto {id_producto} retirado lógicamente del catálogo (estado = 0)"}
