import { useState, useEffect } from 'react'
import { tiendaApi } from '../../api/endpoints'
import { IconSearch, IconSprout, IconBox, IconRefresh } from '../../components/Icons'

export default function BuscarProductosPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')

  // Modal para realizar pedido
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [direccionEntrega, setDireccionEntrega] = useState('')
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState('')
  const [orderError, setOrderError] = useState('')

  const fetchProductos = async (termino = '', categoria = '') => {
    setLoading(true)
    setError('')
    try {
      let queryParams = ''
      const params = new URLSearchParams()
      if (termino.trim()) params.append('termino', termino.trim())
      if (categoria) params.append('categoria', categoria)
      if (params.toString()) queryParams = `?${params.toString()}`

      const data = await tiendaApi.searchProductos(queryParams)
      setProductos(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProductos(searchTerm, selectedCategoria)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategoria('')
    fetchProductos('', '')
  }

  const openOrderModal = (producto) => {
    setSelectedProducto(producto)
    setCantidad(1)
    setDireccionEntrega('')
    setOrderSuccess('')
    setOrderError('')
  }

  const closeOrderModal = () => {
    setSelectedProducto(null)
    setOrderSuccess('')
    setOrderError('')
  }

  const handleCreatePedido = async (e) => {
    e.preventDefault()
    if (!selectedProducto) return

    setOrderLoading(true)
    setOrderError('')
    setOrderSuccess('')

    try {
      const payload = {
        productorId: selectedProducto.productorId,
        direccionEntrega: direccionEntrega.trim() || undefined,
        items: [
          {
            productoId: selectedProducto.id,
            cantidad: Number(cantidad),
          },
        ],
      }

      await tiendaApi.createPedido(payload)
      setOrderSuccess('¡Pedido realizado con éxito! Puedes revisarlo en la sección "Mis Pedidos".')
      fetchProductos(searchTerm, selectedCategoria)
      setTimeout(() => {
        closeOrderModal()
      }, 1400)
    } catch (err) {
      setOrderError(err.message || 'Error al procesar el pedido')
    } finally {
      setOrderLoading(false)
    }
  }

  const categorias = ['Verduras', 'Frutas', 'Granos', 'Tubérculos', 'Hierbas', 'Lácteos']

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconSearch size={28} color="var(--color-primary)" />
              <span>Catálogo y Búsqueda de Productos</span>
            </h1>
            <p className="subtitle">
              Explora las cosechas agrícolas disponibles directamente de productores locales.
            </p>
          </div>
          <button onClick={() => fetchProductos(searchTerm, selectedCategoria)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Card de Filtros Rediseñada */}
      <div className="card" style={{ padding: '22px 28px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: '2', minWidth: '280px' }}>
            <label htmlFor="search-term" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '8px' }}>
              Buscar por Nombre:
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '14px', color: 'var(--color-muted)', pointerEvents: 'none' }}>
                <IconSearch size={18} />
              </span>
              <input
                id="search-term"
                type="text"
                placeholder="Nombre o cosecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px', height: '44px', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0, flex: '1', minWidth: '220px' }}>
            <label htmlFor="categoria-select" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '8px' }}>
              Categoría:
            </label>
            <select
              id="categoria-select"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="input-field"
              style={{ height: '44px', width: '100%' }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
              Buscar
            </button>
            <button type="button" onClick={handleClearFilters} className="btn btn-secondary" style={{ height: '44px' }}>
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Estados de Carga y Error */}
      {loading && <div className="card loading-state">Cargando catálogo de productos...</div>}
      {error && <div className="error-box">{error}</div>}

      {/* Grilla de Productos */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {productos.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron productos disponibles con los criterios seleccionados.</p>
            </div>
          ) : (
            productos.map((producto) => (
              <div key={producto.id} className="card product-card">
                <div className="card-header">
                  <span className="product-category" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800' }}>
                    {producto.categoria || 'Agrícola'}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    ${Number(producto.precioUnitario).toFixed(2)} / unidad
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginTop: '6px' }}>{producto.nombre}</h3>
                <p className="muted-text">{producto.descripcion || 'Producto fresco de origen agrícola.'}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', fontSize: '0.86rem' }}>
                  <span>
                    Stock: <strong style={{ color: producto.stockDisponible > 0 ? '#1b5e20' : '#c62828' }}>{producto.stockDisponible} unidades</strong>
                  </span>
                  <span className="muted-text">Productor #{producto.productorId}</span>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => openOrderModal(producto)}
                    disabled={producto.stockDisponible <= 0 || !producto.disponible}
                    className="btn btn-primary btn-block"
                  >
                    {producto.stockDisponible > 0 ? 'Realizar Pedido' : 'Agotado'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Creación de Pedido */}
      {selectedProducto && (
        <div className="modal-overlay" onClick={closeOrderModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 520px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBox size={22} color="var(--color-primary)" />
                <span>Comprar {selectedProducto.nombre}</span>
              </h2>
              <button type="button" className="btn-close" onClick={closeOrderModal}>&times;</button>
            </div>

            <form onSubmit={handleCreatePedido} className="standard-form">
              <div style={{ padding: '14px 18px', backgroundColor: '#f7faf7', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px' }}><strong>Precio unitario:</strong> ${Number(selectedProducto.precioUnitario).toFixed(2)} / unidad</p>
                <p style={{ margin: 0 }}><strong>Stock disponible:</strong> {selectedProducto.stockDisponible} unidades</p>
              </div>

              <div className="form-group">
                <label htmlFor="cantidad-input">Cantidad a Comprar (unidades): *</label>
                <input
                  id="cantidad-input"
                  type="number"
                  min="0.1"
                  max={selectedProducto.stockDisponible}
                  step="any"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion-input">Dirección de Entrega: *</label>
                <input
                  id="direccion-input"
                  type="text"
                  placeholder="Ej: Carrera 15 #34-21, Local 2, Ciudad"
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border)', marginTop: '12px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>Total Estimado:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>
                  ${(Number(selectedProducto.precioUnitario) * (Number(cantidad) || 0)).toFixed(2)}
                </span>
              </div>

              {orderError && <div className="error-box">{orderError}</div>}
              {orderSuccess && <div className="success-box">{orderSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={closeOrderModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={orderLoading || selectedProducto.stockDisponible <= 0} className="btn btn-primary">
                  {orderLoading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
