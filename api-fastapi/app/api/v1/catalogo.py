from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Usuario
from app.models.catalogo import (
    CategoriaResponse, CategoriaCreate,
    ProductoResponse, ProductoCreate, ProductoUpdate
)
from app.repositories.catalogo_repo import CatalogoRepository
from app.repositories.finca_repo import FincaRepository
from app.api.deps import require_module_permission
from app.api.acceso import es_admin

router = APIRouter()
MODULO = "MOD_CATALOGO"

# Instancia del repositorio siguiendo el estándar de la guía
repo = CatalogoRepository()


# Categorías
@router.get("/categorias", response_model=List[CategoriaResponse], summary="Listar categorías de productos (Público)")
def get_categorias(
    db: Session = Depends(get_db)
) -> Any:
    """Lista todas las categorías activas a través del repositorio."""
    r = CatalogoRepository(db)
    return r.obtener_categorias()


@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED, summary="Crear categoría")
def create_categoria(
    cat_in: CategoriaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "crear"))
) -> Any:
    """Crea una nueva categoría de productos agrícolas."""
    if not es_admin(db, current_user):
        raise HTTPException(status_code=403, detail="Solo los administradores pueden crear categorías globales")

    r = CatalogoRepository(db)
    if r.obtener_categoria_por_nombre(cat_in.nombre):
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    return r.crear_categoria(cat_in)


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
    """Consulta pública del catálogo de cosechas mediante el repositorio."""
    r = CatalogoRepository(db)
    return r.obtener_productos(
        id_categoria=id_categoria,
        busqueda=busqueda,
        solo_con_stock=solo_con_stock,
        skip=skip,
        limit=limit
    )


@router.get("/productos/{id_producto}", response_model=ProductoResponse, summary="Obtener producto por ID (Público)")
def get_producto_by_id(
    id_producto: int,
    db: Session = Depends(get_db)
) -> Any:
    """Detalle de un producto agrícola a través del repositorio."""
    r = CatalogoRepository(db)
    prod = r.obtener_producto_por_id(id_producto)
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
    r_finca = FincaRepository(db)
    finca = r_finca.obtener_por_id(prod_in.id_finca)
    if not finca:
        raise HTTPException(status_code=404, detail="Finca no encontrada o inactiva")

    id_productor = getattr(finca, "id_productor", None) or (finca.get("id_productor") if isinstance(finca, dict) else None)
    if not es_admin(db, current_user) and id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No puedes publicar productos en una finca que no te pertenece")

    r_cat = CatalogoRepository(db)
    cat = r_cat.obtener_categoria_por_id(prod_in.id_categoria)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada o inactiva")

    return r_cat.crear_producto(prod_in)


@router.put("/productos/{id_producto}", response_model=ProductoResponse, summary="Actualizar producto")
def update_producto(
    id_producto: int,
    prod_in: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "actualizar"))
) -> Any:
    """Actualiza stock, precio o detalles del producto mediante el repositorio."""
    r_cat = CatalogoRepository(db)
    prod = r_cat.obtener_producto_por_id(id_producto)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    id_finca = getattr(prod, "id_finca", None) or (prod.get("id_finca") if isinstance(prod, dict) else None)
    r_finca = FincaRepository(db)
    finca = r_finca.obtener_por_id(id_finca)
    id_productor = getattr(finca, "id_productor", None) or (finca.get("id_productor") if isinstance(finca, dict) else None)

    if not es_admin(db, current_user) and id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para editar este producto")

    return r_cat.actualizar_producto(id_producto, prod_in.dict(exclude_unset=True))


@router.delete("/productos/{id_producto}", summary="Borrado lógico de producto (estado = 0)")
def delete_producto_logico(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_module_permission(MODULO, "eliminar"))
) -> Any:
    """Borrado lógico de producto del catálogo mediante el repositorio."""
    r_cat = CatalogoRepository(db)
    prod = r_cat.obtener_producto_por_id(id_producto)
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    id_finca = getattr(prod, "id_finca", None) or (prod.get("id_finca") if isinstance(prod, dict) else None)
    r_finca = FincaRepository(db)
    finca = r_finca.obtener_por_id(id_finca)
    id_productor = getattr(finca, "id_productor", None) or (finca.get("id_productor") if isinstance(finca, dict) else None)

    if not es_admin(db, current_user) and id_productor != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes autorización para eliminar este producto")

    r_cat.eliminar_producto(id_producto)
    return {"mensaje": f"Producto {id_producto} retirado lógicamente del catálogo (estado = 0)"}
