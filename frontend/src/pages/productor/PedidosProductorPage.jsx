import { useState, useEffect } from 'react'
import { productorApi } from '../../api/endpoints'
import { IconBox, IconRefresh, IconTruck } from '../../components/Icons'

export default function PedidosProductorPage() {
  const [pedidos, setPedidos] = useState([])
  const [transportistas, setTransportistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Acción Aceptar Pedido
  const [acceptingId, setAcceptingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Modal Selección de Transportista
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [selectedTransportistaId, setSelectedTransportistaId] = useState('')
  const [transLoading, setTransLoading] = useState(false)
  const [transError, setTransError] = useState('')
  const [transSuccess, setTransSuccess] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [pedidosData, transData] = await Promise.all([
        productorApi.getPedidos(),
        productorApi.getTransportistas(),
      ])
      setPedidos(pedidosData || [])
      setTransportistas(transData || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los pedidos del productor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAceptarPedido = async (pedidoId) => {
    setAcceptingId(pedidoId)
    setActionError('')
    setActionSuccess('')

    try {
      await productorApi.acceptPedido(pedidoId)
      setActionSuccess(`¡Pedido #${pedidoId} aceptado exitosamente! Ahora puedes asignarle un transportista.`)
      fetchData()
    } catch (err) {
      setActionError(err.message || 'Error al aceptar el pedido')
    } finally {
      setAcceptingId(null)
    }
  }

  const handleOpenTransModal = (pedido) => {
    setSelectedPedido(pedido)
    setSelectedTransportistaId(transportistas.length > 0 ? transportistas[0].id : '')
    setTransError('')
    setTransSuccess('')
  }

  const handleCloseTransModal = () => {
    setSelectedPedido(null)
    setTransError('')
    setTransSuccess('')
  }

  const handleSelectTransportista = async (e) => {
    e.preventDefault()
    if (!selectedPedido || !selectedTransportistaId) return

    setTransLoading(true)
    setTransError('')
    setTransSuccess('')

    try {
      await productorApi.selectTransportista(selectedPedido.id, Number(selectedTransportistaId))
      setTransSuccess('¡Solicitud de transporte enviada exitosamente al transportista!')
      fetchData()
      setTimeout(() => {
        handleCloseTransModal()
      }, 1200)
    } catch (err) {
      setTransError(err.message || 'Error al enviar la solicitud de transporte')
    } finally {
      setTransLoading(false)
    }
  }

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'status-pendiente'
      case 'ACEPTADO': return 'status-aceptado'
      case 'EN_TRANSPORTE': return 'status-transporte'
      case 'ENTREGADO': return 'status-entregado'
      case 'CANCELADO': return 'status-cancelado'
      default: return 'status-default'
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconBox size={28} color="var(--color-primary)" />
              <span>Pedidos Recibidos de Tiendas</span>
            </h1>
            <p className="subtitle">
              Supervisa las órdenes entrantes, acéptalas y coordina el despacho con transportistas autorizados.
            </p>
          </div>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {actionError && <div className="error-box">{actionError}</div>}
      {actionSuccess && <div className="success-box">{actionSuccess}</div>}

      {loading && <div className="card loading-state">Cargando pedidos recibidos...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Pedidos Entrantes ({pedidos.length})</h3>
          </div>

          {pedidos.length === 0 ? (
            <div className="empty-state">
              <p>No tienes pedidos recibidos de tiendas por el momento.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th># Pedido</th>
                    <th>Tienda ID</th>
                    <th>Productos / Cantidad</th>
                    <th>Total</th>
                    <th>Dirección Entrega</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td className="font-bold">#{pedido.id}</td>
                      <td>Tienda #{pedido.tiendaId}</td>
                      <td>
                        {pedido.items && pedido.items.length > 0 ? (
                          <ul className="items-list" style={{ paddingLeft: '16px', margin: 0 }}>
                            {pedido.items.map((it) => (
                              <li key={it.id}>
                                {it.nombreProducto} x {it.cantidad} (${Number(it.subtotal).toFixed(2)})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="muted-text">Sin items</span>
                        )}
                      </td>
                      <td className="font-bold font-green">${Number(pedido.total).toFixed(2)}</td>
                      <td>{pedido.direccionEntrega || <span className="muted-text">No especificada</span>}</td>
                      <td>
                        <span className={`status-pill ${getStatusBadgeClass(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {pedido.estado === 'PENDIENTE' && (
                            <button
                              type="button"
                              onClick={() => handleAceptarPedido(pedido.id)}
                              disabled={acceptingId === pedido.id}
                              className="btn btn-sm btn-primary"
                            >
                              {acceptingId === pedido.id ? 'Aceptando...' : 'Aceptar Pedido'}
                            </button>
                          )}

                          {pedido.estado === 'ACEPTADO' && !pedido.transportistaId && (
                            <button
                              type="button"
                              onClick={() => handleOpenTransModal(pedido)}
                              className="btn btn-sm btn-accent"
                            >
                              Solicitar Transporte
                            </button>
                          )}

                          {pedido.transportistaId && (
                            <span className="muted-text" style={{ fontSize: '0.85rem' }}>
                              Transportista #{pedido.transportistaId} asignado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Asignar Transportista */}
      {selectedPedido && (
        <div className="modal-overlay" onClick={handleCloseTransModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 540px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTruck size={22} color="var(--color-accent)" />
                <span>Solicitar Transporte (Pedido #{selectedPedido.id})</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseTransModal}>&times;</button>
            </div>

            <form onSubmit={handleSelectTransportista} className="standard-form">
              <p className="muted-text">Selecciona uno de los transportistas registrados, aprobados y disponibles en la plataforma:</p>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label htmlFor="trans-select">Transportista Disponible: *</label>
                {transportistas.length === 0 ? (
                  <p className="error-box">No hay transportistas disponibles en este momento. Intenta más tarde.</p>
                ) : (
                  <select
                    id="trans-select"
                    value={selectedTransportistaId}
                    onChange={(e) => setSelectedTransportistaId(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  >
                    {transportistas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email}) {t.phone ? `- Tel: ${t.phone}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {transError && <div className="error-box">{transError}</div>}
              {transSuccess && <div className="success-box">{transSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseTransModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={transLoading || transportistas.length === 0}
                  className="btn btn-primary"
                >
                  {transLoading ? 'Enviando solicitud...' : 'Enviar Solicitud de Despacho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
