import { useState, useEffect } from 'react'
import { tiendaApi } from '../../api/endpoints'
import { IconBox, IconStar, IconMapPin, IconRefresh } from '../../components/Icons'

export default function PedidosTiendaPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal Seguimiento
  const [seguimientoModal, setSeguimientoModal] = useState(null)
  const [seguimientoData, setSeguimientoData] = useState(null)
  const [seguimientoLoading, setSeguimientoLoading] = useState(false)
  const [seguimientoError, setSeguimientoError] = useState('')

  // Modal Calificación
  const [calificarModal, setCalificarModal] = useState(null)
  const [targetType, setTargetType] = useState('productor') // 'productor' | 'transportista'
  const [puntuacion, setPuntuacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [calificarLoading, setCalificarLoading] = useState(false)
  const [calificarSuccess, setCalificarSuccess] = useState('')
  const [calificarError, setCalificarError] = useState('')

  const fetchPedidos = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await tiendaApi.getPedidos()
      setPedidos(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPedidos()
  }, [])

  const handleOpenSeguimiento = async (pedido) => {
    setSeguimientoModal(pedido)
    setSeguimientoLoading(true)
    setSeguimientoError('')
    try {
      const data = await tiendaApi.getSeguimiento(pedido.id)
      setSeguimientoData(data)
    } catch (err) {
      setSeguimientoError(err.message || 'Error al consultar seguimiento')
    } finally {
      setSeguimientoLoading(false)
    }
  }

  const handleCloseSeguimiento = () => {
    setSeguimientoModal(null)
    setSeguimientoData(null)
    setSeguimientoError('')
  }

  const handleOpenCalificar = (pedido) => {
    setCalificarModal(pedido)
    setTargetType('productor')
    setPuntuacion(5)
    setComentario('')
    setCalificarSuccess('')
    setCalificarError('')
  }

  const handleCloseCalificar = () => {
    setCalificarModal(null)
    setCalificarSuccess('')
    setCalificarError('')
  }

  const handleSubmitCalificacion = async (e) => {
    e.preventDefault()
    if (!calificarModal) return

    setCalificarLoading(true)
    setCalificarError('')
    setCalificarSuccess('')

    try {
      const payload = {
        puntuacion: Number(puntuacion),
        comentario: comentario.trim() || undefined,
        productorId: targetType === 'productor' ? calificarModal.productorId : undefined,
        transportistaId: targetType === 'transportista' ? calificarModal.transportistaId : undefined,
      }

      await tiendaApi.createCalificacion(calificarModal.id, payload)
      setCalificarSuccess('¡Calificación guardada exitosamente!')
      setTimeout(() => {
        handleCloseCalificar()
      }, 1200)
    } catch (err) {
      setCalificarError(err.message || 'Error al enviar calificación')
    } finally {
      setCalificarLoading(false)
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
              <span>Mis Pedidos y Seguimiento</span>
            </h1>
            <p className="subtitle">
              Supervisa el estado de tus compras, consulta el rastreo logístico y califica las entregas recibidas.
            </p>
          </div>
          <button onClick={fetchPedidos} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {loading && <div className="card loading-state">Cargando tus pedidos...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Historial de Pedidos ({pedidos.length})</h3>
          </div>

          {pedidos.length === 0 ? (
            <div className="empty-state">
              <p>Aún no has realizado ningún pedido. Ve a la sección <strong>"Catálogo y Búsqueda"</strong> para explorar productos.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th># Pedido</th>
                    <th>Productos / Items</th>
                    <th>Total</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id}>
                      <td className="font-bold">#{pedido.id}</td>
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
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenSeguimiento(pedido)}
                            className="btn btn-sm btn-accent"
                          >
                            Seguimiento GPS
                          </button>

                          {pedido.estado === 'ENTREGADO' && (
                            <button
                              type="button"
                              onClick={() => handleOpenCalificar(pedido)}
                              className="btn btn-sm btn-primary"
                            >
                              Calificar Servicio
                            </button>
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

      {/* Modal de Seguimiento */}
      {seguimientoModal && (
        <div className="modal-overlay" onClick={handleCloseSeguimiento}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 540px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconMapPin size={22} color="var(--color-primary)" />
                <span>Seguimiento de Pedido #{seguimientoModal.id}</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseSeguimiento}>&times;</button>
            </div>

            {seguimientoLoading && <div className="loading-state">Consultando rastreo...</div>}
            {seguimientoError && <div className="error-box">{seguimientoError}</div>}

            {seguimientoData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div style={{ padding: '14px 18px', backgroundColor: '#f7faf7', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <p style={{ margin: '0 0 6px' }}><strong>Estado Actual:</strong> <span className={`status-pill ${getStatusBadgeClass(seguimientoData.estadoActual)}`}>{seguimientoData.estadoActual}</span></p>
                  <p style={{ margin: 0 }}><strong>Transportista Asignado:</strong> {seguimientoData.transportistaId ? `ID #${seguimientoData.transportistaId}` : 'Pendiente de asignación'}</p>
                </div>

                {seguimientoData.ultimaUbicacion ? (
                  <div style={{ padding: '14px 18px', backgroundColor: '#e8f5e9', borderRadius: '10px', border: '1px solid #c8e6c9' }}>
                    <h4 style={{ margin: '0 0 6px', color: '#1b5e20', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconMapPin size={16} color="#1b5e20" />
                      <span>Última Ubicación Reportada:</span>
                    </h4>
                    <p style={{ margin: '0 0 4px' }}>Latitud: <strong>{seguimientoData.ultimaUbicacion.latitud}</strong>, Longitud: <strong>{seguimientoData.ultimaUbicacion.longitud}</strong></p>
                    <p className="muted-text" style={{ margin: 0, fontSize: '0.84rem' }}>Hora de reporte: {new Date(seguimientoData.ultimaUbicacion.timestamp).toLocaleString()}</p>
                  </div>
                ) : (
                  <div style={{ padding: '14px 18px', backgroundColor: '#eceff1', borderRadius: '10px', color: 'var(--color-muted)' }}>
                    <p style={{ margin: 0 }}>No hay coordenadas GPS transmitidas recientemente.</p>
                  </div>
                )}

                <div>
                  <h4 style={{ marginBottom: '10px' }}>Historial de Estados del Pedido:</h4>
                  {seguimientoData.historial && seguimientoData.historial.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                      {seguimientoData.historial.map((h, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #edf2ed' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{h.estado}</strong>
                          <span className="muted-text" style={{ fontSize: '0.84rem' }}>{new Date(h.fecha).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-text">No hay cambios de estado registrados.</p>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" onClick={handleCloseSeguimiento} className="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {calificarModal && (
        <div className="modal-overlay" onClick={handleCloseCalificar}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 500px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconStar size={22} color="var(--color-secondary)" />
                <span>Calificar Pedido #{calificarModal.id}</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseCalificar}>&times;</button>
            </div>

            <form onSubmit={handleSubmitCalificacion} className="standard-form">
              <div className="form-group">
                <label style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px' }}>¿A quién deseas calificar?</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetType"
                      value="productor"
                      checked={targetType === 'productor'}
                      onChange={() => setTargetType('productor')}
                    />
                    <span>Productor (#{calificarModal.productorId})</span>
                  </label>
                  {calificarModal.transportistaId && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="targetType"
                        value="transportista"
                        checked={targetType === 'transportista'}
                        onChange={() => setTargetType('transportista')}
                      />
                      <span>Transportista (#{calificarModal.transportistaId})</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="puntuacion-select">Puntuación (1 a 5 estrellas): *</label>
                <select
                  id="puntuacion-select"
                  value={puntuacion}
                  onChange={(e) => setPuntuacion(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Muy bueno)</option>
                  <option value={3}>⭐⭐⭐ (3 - Regular)</option>
                  <option value={2}>⭐⭐ (2 - Deficiente)</option>
                  <option value={1}>⭐ (1 - Muy malo)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="comentario-input">Comentarios sobre el servicio:</label>
                <textarea
                  id="comentario-input"
                  rows="3"
                  placeholder="Escribe tu opinión sobre la calidad del producto o puntualidad del transporte..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="input-field"
                />
              </div>

              {calificarError && <div className="error-box">{calificarError}</div>}
              {calificarSuccess && <div className="success-box">{calificarSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseCalificar} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={calificarLoading} className="btn btn-primary">
                  {calificarLoading ? 'Guardando...' : 'Enviar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
