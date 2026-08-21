import { useState, useEffect } from 'react'
import { productorApi } from '../../api/endpoints'
import { IconSprout, IconRefresh, IconBox } from '../../components/Icons'

export default function MisProductosPage() {
  const [productos, setProductos] = useState([])
  const [fincas, setFincas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal Publicar Producto
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('Verduras')
  const [precioUnitario, setPrecioUnitario] = useState('')
  const [stockDisponible, setStockDisponible] = useState('')
  const [selectedFincaId, setSelectedFincaId] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // Modal Editar Producto
  const [editingProduct, setEditingProduct] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editCategoria, setEditCategoria] = useState('Verduras')
  const [editPrecioUnitario, setEditPrecioUnitario] = useState('')
  const [editStockDisponible, setEditStockDisponible] = useState('')
  const [editFincaId, setEditFincaId] = useState('')
  const [editDisponible, setEditDisponible] = useState(true)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  // Modal Ajustar Stock Rápido
  const [stockModalProduct, setStockModalProduct] = useState(null)
  const [newStock, setNewStock] = useState('')
  const [stockLoading, setStockLoading] = useState(false)
  const [stockError, setStockError] = useState('')
  const [stockSuccess, setStockSuccess] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [prodsData, fincasData] = await Promise.all([
        productorApi.getProductos(),
        productorApi.getFincas(),
      ])
      setProductos(prodsData || [])
      setFincas(fincasData || [])
    } catch (err) {
      setError(err.message || 'Error al cargar productos y fincas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenCreateModal = () => {
    setNombre('')
    setDescripcion('')
    setCategoria('Verduras')
    setPrecioUnitario('')
    setStockDisponible('')
    setSelectedFincaId(fincas.length > 0 ? fincas[0].id : '')
    setCreateError('')
    setCreateSuccess('')
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCreateProducto = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        categoria: categoria || undefined,
        precioUnitario: parseFloat(precioUnitario),
        unidad: 'unidades',
        stockDisponible: parseFloat(stockDisponible) || 0.0,
        fincaId: selectedFincaId ? Number(selectedFincaId) : undefined,
        disponible: true,
      }

      await productorApi.createProducto(payload)
      setCreateSuccess('¡Producto publicado exitosamente!')
      fetchData()
      setTimeout(() => {
        handleCloseCreateModal()
      }, 1200)
    } catch (err) {
      setCreateError(err.message || 'Error al publicar producto')
    } finally {
      setCreateLoading(false)
    }
  }

  // Editar Producto Completo (incluyendo cambiar de finca)
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod)
    setEditNombre(prod.nombre)
    setEditDescripcion(prod.descripcion || '')
    setEditCategoria(prod.categoria || 'Verduras')
    setEditPrecioUnitario(prod.precioUnitario)
    setEditStockDisponible(prod.stockDisponible)
    setEditFincaId(prod.fincaId ? String(prod.fincaId) : '')
    setEditDisponible(Boolean(prod.disponible))
    setEditError('')
    setEditSuccess('')
  }

  const handleCloseEditModal = () => {
    setEditingProduct(null)
  }

  const handleUpdateProducto = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    setEditLoading(true)
    setEditError('')
    setEditSuccess('')

    try {
      const payload = {
        nombre: editNombre.trim(),
        descripcion: editDescripcion.trim() || undefined,
        categoria: editCategoria || undefined,
        precioUnitario: parseFloat(editPrecioUnitario),
        unidad: 'unidades',
        stockDisponible: parseFloat(editStockDisponible) || 0.0,
        fincaId: editFincaId ? Number(editFincaId) : undefined,
        disponible: editDisponible,
      }

      await productorApi.updateProducto(editingProduct.id, payload)
      setEditSuccess('¡Producto actualizado correctamente!')
      fetchData()
      setTimeout(() => {
        handleCloseEditModal()
      }, 1200)
    } catch (err) {
      setEditError(err.message || 'Error al actualizar producto')
    } finally {
      setEditLoading(false)
    }
  }

  // Ajustar Stock Rápido
  const handleOpenStockModal = (producto) => {
    setStockModalProduct(producto)
    setNewStock(producto.stockDisponible)
    setStockError('')
    setStockSuccess('')
  }

  const handleCloseStockModal = () => {
    setStockModalProduct(null)
  }

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    if (!stockModalProduct) return

    setStockLoading(true)
    setStockError('')
    setStockSuccess('')

    try {
      await productorApi.updateStock(stockModalProduct.id, {
        stock: parseFloat(newStock),
      })
      setStockSuccess('¡Stock actualizado correctamente!')
      fetchData()
      setTimeout(() => {
        handleCloseStockModal()
      }, 1200)
    } catch (err) {
      setStockError(err.message || 'Error al actualizar el stock')
    } finally {
      setStockLoading(false)
    }
  }

  const categorias = ['Verduras', 'Frutas', 'Granos', 'Tubérculos', 'Hierbas', 'Lácteos']

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconSprout size={28} color="var(--color-primary)" />
              <span>Mis Productos e Inventario</span>
            </h1>
            <p className="subtitle">Publica cosechas agrícolas, actualiza precios, cambia de finca o gestiona el stock.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
              <IconRefresh size={15} />
              <span>Actualizar</span>
            </button>
            <button onClick={handleOpenCreateModal} className="btn btn-primary">
              + Publicar Producto
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="card loading-state">Cargando inventario...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Catálogo de Productos ({productos.length})</h3>
          </div>

          {productos.length === 0 ? (
            <div className="empty-state">
              <p>No tienes productos publicados. Haz clic en <strong>"+ Publicar Producto"</strong> para empezar a vender.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio Unitario</th>
                    <th>Stock Actual</th>
                    <th>Finca de Origen</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => {
                    const isAvailable = prod.disponible && prod.stockDisponible > 0
                    const isAgotado = prod.disponible && prod.stockDisponible <= 0
                    const statusText = isAvailable ? 'Disponible' : (isAgotado ? 'Agotado' : 'Inactivo')
                    const statusBadgeClass = isAvailable ? 'status-aceptado' : 'status-cancelado'

                    return (
                      <tr key={prod.id}>
                        <td>
                          <strong>{prod.nombre}</strong>
                          {prod.descripcion && <div className="muted-text">{prod.descripcion}</div>}
                        </td>
                        <td>
                          <span className="product-category">{prod.categoria || 'General'}</span>
                        </td>
                        <td className="font-bold font-green">${Number(prod.precioUnitario).toFixed(2)} / unidad</td>
                        <td>
                          <span style={{ fontWeight: '700', color: prod.stockDisponible > 0 ? '#1b5e20' : '#c62828' }}>
                            {prod.stockDisponible} unidades
                          </span>
                        </td>
                        <td>
                          {prod.fincaId ? (
                            <span>Finca #{prod.fincaId}</span>
                          ) : (
                            <span className="muted-text">Sin finca</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${statusBadgeClass}`}>
                            {statusText}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(prod)}
                              className="btn btn-sm btn-primary"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenStockModal(prod)}
                              className="btn btn-sm btn-secondary"
                            >
                              Stock
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Publicar Producto */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 580px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconSprout size={22} color="var(--color-primary)" />
                <span>Publicar Nuevo Producto</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseCreateModal}>&times;</button>
            </div>

            <form onSubmit={handleCreateProducto} className="standard-form">
              <div className="form-group">
                <label htmlFor="prod-nombre">Nombre del Producto: *</label>
                <input
                  id="prod-nombre"
                  type="text"
                  placeholder="Ej: Tomate Chonto, Papa Criolla"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Descripción (Opcional):</label>
                <textarea
                  id="prod-desc"
                  rows="2"
                  placeholder="Ej: Cosecha fresca, orgánico, recién recolectado..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="prod-cat">Categoría:</label>
                  <select
                    id="prod-cat"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  >
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prod-finca">Finca de Origen:</label>
                  <select
                    id="prod-finca"
                    value={selectedFincaId}
                    onChange={(e) => setSelectedFincaId(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  >
                    <option value="">-- Sin finca asociada --</option>
                    {fincas.map((f) => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="prod-precio">Precio Unitario ($): *</label>
                  <input
                    id="prod-precio"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="2.50"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-unidad">Unidad de Medida:</label>
                  <input
                    id="prod-unidad"
                    type="text"
                    value="unidades"
                    readOnly
                    className="input-field"
                    style={{ height: '44px', backgroundColor: '#f5f5f5', color: 'var(--color-text)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-stock">Stock Inicial: *</label>
                  <input
                    id="prod-stock"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="100"
                    value={stockDisponible}
                    onChange={(e) => setStockDisponible(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  />
                </div>
              </div>

              {createError && <div className="error-box">{createError}</div>}
              {createSuccess && <div className="success-box">{createSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseCreateModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading} className="btn btn-primary">
                  {createLoading ? 'Publicando...' : 'Publicar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Producto (Incluye cambiar de Finca y Estado) */}
      {editingProduct && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 580px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconSprout size={22} color="var(--color-primary)" />
                <span>Editar Producto: {editingProduct.nombre}</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseEditModal}>&times;</button>
            </div>

            <form onSubmit={handleUpdateProducto} className="standard-form">
              <div className="form-group">
                <label htmlFor="edit-prod-nombre">Nombre del Producto: *</label>
                <input
                  id="edit-prod-nombre"
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-prod-desc">Descripción (Opcional):</label>
                <textarea
                  id="edit-prod-desc"
                  rows="2"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="edit-prod-cat">Categoría:</label>
                  <select
                    id="edit-prod-cat"
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  >
                    {categorias.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-prod-finca">Finca de Origen: *</label>
                  <select
                    id="edit-prod-finca"
                    value={editFincaId}
                    onChange={(e) => setEditFincaId(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                  >
                    <option value="">-- Sin finca asociada --</option>
                    {fincas.map((f) => (
                      <option key={f.id} value={f.id}>{f.nombre} (ID #{f.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="edit-prod-precio">Precio Unitario ($): *</label>
                  <input
                    id="edit-prod-precio"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editPrecioUnitario}
                    onChange={(e) => setEditPrecioUnitario(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-prod-unidad">Unidad de Medida:</label>
                  <input
                    id="edit-prod-unidad"
                    type="text"
                    value="unidades"
                    readOnly
                    className="input-field"
                    style={{ height: '44px', backgroundColor: '#f5f5f5', color: 'var(--color-text)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-prod-stock">Stock Disponible: *</label>
                  <input
                    id="edit-prod-stock"
                    type="number"
                    step="any"
                    min="0"
                    value={editStockDisponible}
                    onChange={(e) => setEditStockDisponible(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={editDisponible}
                    onChange={(e) => setEditDisponible(e.target.checked)}
                  />
                  <span>Producto Habilitado para Venta (Disponible)</span>
                </label>
              </div>

              {editError && <div className="error-box">{editError}</div>}
              {editSuccess && <div className="success-box">{editSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseEditModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={editLoading} className="btn btn-primary">
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustar Stock Rápido */}
      {stockModalProduct && (
        <div className="modal-overlay" onClick={handleCloseStockModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 480px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBox size={22} color="var(--color-primary)" />
                <span>Ajustar Stock: {stockModalProduct.nombre}</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseStockModal}>&times;</button>
            </div>

            <form onSubmit={handleUpdateStock} className="standard-form">
              <p className="muted-text">Actualiza la cantidad disponible para venta de este producto.</p>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label htmlFor="stock-input">Nuevo Stock Disponible ({stockModalProduct.unidad}): *</label>
                <input
                  id="stock-input"
                  type="number"
                  step="any"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              {stockError && <div className="error-box">{stockError}</div>}
              {stockSuccess && <div className="success-box">{stockSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseStockModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={stockLoading} className="btn btn-primary">
                  {stockLoading ? 'Guardando...' : 'Actualizar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
