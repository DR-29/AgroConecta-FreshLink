import { useState, useEffect } from 'react'
import { transportistaApi } from '../../api/endpoints'
import { IconBox, IconRefresh } from '../../components/Icons'

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  const fetchSolicitudes = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await transportistaApi.getSolicitudes()
      setSolicitudes(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes()
  }, [])

  const handleAccept = async (id) => {
    setActionLoadingId(id)
    setActionError('')
    setActionSuccess('')
    try {
      await transportistaApi.acceptSolicitud(id)
      setActionSuccess(`¡Solicitud #${id} aceptada con éxito! El pedido ahora está en transporte.`)
      fetchSolicitudes()
    } catch (err) {
      setActionError(err.message || 'Error al aceptar la solicitud')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoadingId(id)
    setActionError('')
    setActionSuccess('')
    try {
      await transportistaApi.rejectSolicitud(id)
      setActionSuccess(`Solicitud #${id} rechazada.`)
      fetchSolicitudes()
    } catch (err) {
      setActionError(err.message || 'Error al rechazar la solicitud')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconBox size={28} color="var(--color-accent)" />
              <span>Solicitudes de Flete Entrantes</span>
            </h1>
            <p className="subtitle">
              Revisa los pedidos que los productores agrícolas desean asignarte para su traslado y entrega.
            </p>
          </div>
          <button onClick={fetchSolicitudes} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {actionError && <div className="error-box">{actionError}</div>}
      {actionSuccess && <div className="success-box">{actionSuccess}</div>}

      {loading && <div className="card loading-state">Consultando solicitudes pendientes...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-grid">
          {solicitudes.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No tienes solicitudes de flete pendientes en este momento. Asegúrate de tener tu disponibilidad activa.</p>
            </div>
          ) : (
            solicitudes.map((sol) => (
              <div key={sol.id} className="card">
                <div className="card-header">
                  <h3>Flete #{sol.id}</h3>
                  <span className="status-pill status-pendiente">
                    {sol.estado}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span className="muted-text">Pedido Asociado:</span>
                    <strong>Pedido #{sol.pedidoId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span className="muted-text">Productor ID:</span>
                    <strong>Productor #{sol.productorId}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleAccept(sol.id)}
                    disabled={actionLoadingId === sol.id}
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                  >
                    {actionLoadingId === sol.id ? 'Procesando...' : 'Aceptar Flete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(sol.id)}
                    disabled={actionLoadingId === sol.id}
                    className="btn btn-sm btn-outline-danger"
                    style={{ flex: 1 }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
