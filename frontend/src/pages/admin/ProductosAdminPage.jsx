import { useState, useEffect } from 'react'
import { adminApi } from '../../api/endpoints'
import { IconSprout, IconRefresh } from '../../components/Icons'

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deactivatingId, setDeactivatingId] = useState(null)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  const fetchProductos = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getProductos()
      setProductos(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar el catálogo de productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleDeactivateProducto = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja lógica el producto "${nombre}" (#${id})?`)) return

    setDeactivatingId(id)
    setActionError('')
    setActionSuccess('')

    try {
      await adminApi.deactivateProducto(id)
      setActionSuccess(`¡Producto "${nombre}" (#${id}) desactivado correctamente (baja lógica)!`)
      fetchProductos()
    } catch (err) {
      setActionError(err.message || 'Error al desactivar el producto')
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconSprout size={28} color="var(--color-primary)" />
              <span>Catálogo Global de Productos</span>
            </h1>
            <p className="subtitle">
              Supervisión de todas las cosechas y artículos publicados por productores, con baja lógica segura.
            </p>
          </div>
          <button onClick={fetchProductos} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar Catálogo</span>
          </button>
        </div>
      </div>

      {actionError && <div className="error-box">{actionError}</div>}
      {actionSuccess && <div className="success-box">{actionSuccess}</div>}

      {loading && <div className="card loading-state">Cargando catálogo global...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Productos Registrados ({productos.length})</h3>
          </div>

          {productos.length === 0 ? (
            <div className="empty-state">
              <p>No hay productos registrados en el sistema.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Productor ID</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id}>
                      <td className="font-bold">#{prod.id}</td>
                      <td>
                        <strong>{prod.nombre}</strong>
                        {prod.descripcion && <div className="muted-text">{prod.descripcion}</div>}
                      </td>
                      <td>
                        <span className="product-category">{prod.categoria || 'General'}</span>
                      </td>
                      <td className="font-bold font-green">${Number(prod.precioUnitario).toFixed(2)} / unidad</td>
                      <td>{prod.stockDisponible} unidades</td>
                      <td>Productor #{prod.productorId}</td>
                      <td>
                        <span className={`status-pill ${prod.disponible ? 'status-aceptado' : 'status-cancelado'}`}>
                          {prod.disponible ? 'Disponible' : 'Desactivado'}
                        </span>
                      </td>
                      <td>
                        {prod.disponible ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivateProducto(prod.id, prod.nombre)}
                            disabled={deactivatingId === prod.id}
                            className="btn btn-sm btn-secondary"
                            style={{ color: '#c62828' }}
                          >
                            {deactivatingId === prod.id ? 'Desactivando...' : 'Desactivar (Baja)'}
                          </button>
                        ) : (
                          <span className="muted-text" style={{ fontSize: '0.85rem' }}>Ya desactivado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
