import { useState, useEffect } from 'react'
import { transportistaApi } from '../../api/endpoints'
import { IconTruck, IconMapPin, IconRefresh } from '../../components/Icons'

export default function MisServiciosPage() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal Compartir Ubicación
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [locSuccess, setLocSuccess] = useState('')
  const [locError, setLocError] = useState('')

  // Finalizar Entrega
  const [finishingId, setFinishingId] = useState(null)
  const [deliverySuccess, setDeliverySuccess] = useState('')
  const [deliveryError, setDeliveryError] = useState('')

  const fetchServicios = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await transportistaApi.getServicios()
      setServicios(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los servicios activos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServicios()
  }, [])

  const handleOpenLocationModal = () => {
    setLatitud('')
    setLongitud('')
    setLocSuccess('')
    setLocError('')
    setShowLocationModal(true)
  }

  const handleCloseLocationModal = () => {
    setShowLocationModal(false)
  }

  const handleGetBrowserGPS = () => {
    if (!navigator.geolocation) {
      setLocError('Tu navegador no soporta geolocalización.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude.toFixed(6))
        setLongitud(position.coords.longitude.toFixed(6))
      },
      () => {
        setLocError('No se pudo obtener la ubicación automáticamente. Ingrésala manualmente.')
      }
    )
  }

  const handleShareLocation = async (e) => {
    e.preventDefault()
    setLocLoading(true)
    setLocError('')
    setLocSuccess('')

    try {
      const payload = {
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
      }
      await transportistaApi.shareLocation(payload)
      setLocSuccess('¡Ubicación GPS transmitida con éxito a las tiendas!')
      setTimeout(() => {
        handleCloseLocationModal()
      }, 1200)
    } catch (err) {
      setLocError(err.message || 'Error al transmitir la ubicación')
    } finally {
      setLocLoading(false)
    }
  }

  const handleFinalizarEntrega = async (pedidoId) => {
    if (!window.confirm(`¿Confirmas que el pedido #${pedidoId} ha sido entregado en destino?`)) return

    setFinishingId(pedidoId)
    setDeliveryError('')
    setDeliverySuccess('')

    try {
      await transportistaApi.updateDeliveryStatus(pedidoId, { estado: 'ENTREGADO' })
      setDeliverySuccess(`¡Pedido #${pedidoId} marcado como ENTREGADO! La tienda ahora puede calificar el servicio.`)
      fetchServicios()
    } catch (err) {
      setDeliveryError(err.message || 'Error al actualizar el estado de entrega')
    } finally {
      setFinishingId(null)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconTruck size={28} color="var(--color-primary)" />
              <span>Mis Servicios y Fletes Activos</span>
            </h1>
            <p className="subtitle">
              Gestiona los fletes en tránsito, transmite coordenadas GPS en tiempo real y confirma entregas.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleOpenLocationModal} className="btn btn-accent">
              <IconMapPin size={16} />
              <span>Transmitir GPS</span>
            </button>
            <button onClick={fetchServicios} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
              <IconRefresh size={15} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {deliveryError && <div className="error-box">{deliveryError}</div>}
      {deliverySuccess && <div className="success-box">{deliverySuccess}</div>}

      {loading && <div className="card loading-state">Cargando servicios en curso...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Servicios Asignados ({servicios.length})</h3>
          </div>

          {servicios.length === 0 ? (
            <div className="empty-state">
              <p>No tienes servicios activos en curso en este momento.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th># Servicio</th>
                    <th>Pedido ID</th>
                    <th>Productor ID</th>
                    <th>Estado Solicitud</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((srv) => (
                    <tr key={srv.id}>
                      <td className="font-bold">Servicio #{srv.id}</td>
                      <td>
                        <strong>Pedido #{srv.pedidoId}</strong>
                      </td>
                      <td>Productor #{srv.productorId}</td>
                      <td>
                        <span className="status-pill status-transporte">
                          {srv.estado}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            onClick={() => handleFinalizarEntrega(srv.pedidoId)}
                            disabled={finishingId === srv.pedidoId}
                            className="btn btn-sm btn-primary"
                          >
                            {finishingId === srv.pedidoId ? 'Confirmando...' : 'Marcar Entregado'}
                          </button>
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

      {/* Modal Compartir Ubicación */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={handleCloseLocationModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 520px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconMapPin size={22} color="var(--color-primary)" />
                <span>Transmitir Ubicación GPS</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseLocationModal}>&times;</button>
            </div>

            <form onSubmit={handleShareLocation} className="standard-form">
              <p className="muted-text">Comparte tus coordenadas actuales para que las tiendas monitoreen el progreso del despacho:</p>

              <button
                type="button"
                onClick={handleGetBrowserGPS}
                className="btn btn-secondary btn-block"
                style={{ marginBottom: '14px', height: '42px' }}
              >
                Obtener GPS del Navegador
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="lat-input">Latitud: *</label>
                  <input
                    id="lat-input"
                    type="number"
                    step="any"
                    placeholder="Ej: 10.7899"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lng-input">Longitud: *</label>
                  <input
                    id="lng-input"
                    type="number"
                    step="any"
                    placeholder="Ej: -74.7500"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    className="input-field"
                    style={{ height: '44px' }}
                    required
                  />
                </div>
              </div>

              {locError && <div className="error-box">{locError}</div>}
              {locSuccess && <div className="success-box">{locSuccess}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseLocationModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={locLoading} className="btn btn-accent">
                  {locLoading ? 'Transmitiendo...' : 'Transmitir Coordenadas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
