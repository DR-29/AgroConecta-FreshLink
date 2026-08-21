import { useState, useEffect } from 'react'
import { adminApi } from '../../api/endpoints'
import { IconAlertTriangle, IconRefresh, IconShield } from '../../components/Icons'

export default function ReclamacionesAdminPage() {
  const [reclamaciones, setReclamaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Modal para resolver reclamación con mensaje de respuesta
  const [selectedReclamacion, setSelectedReclamacion] = useState(null)
  const [respuestaAdmin, setRespuestaAdmin] = useState('')
  const [resolvingLoading, setResolvingLoading] = useState(false)

  const fetchReclamaciones = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getReclamaciones()
      setReclamaciones(data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar las reclamaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReclamaciones()
  }, [])

  const handleOpenResolveModal = (rec) => {
    setSelectedReclamacion(rec)
    setRespuestaAdmin('')
  }

  const handleCloseResolveModal = () => {
    setSelectedReclamacion(null)
    setRespuestaAdmin('')
  }

  const handleConfirmResolve = async (e) => {
    e.preventDefault()
    if (!selectedReclamacion) return

    setResolvingLoading(true)
    setActionError('')
    setActionSuccess('')

    try {
      await adminApi.resolveReclamacion(selectedReclamacion.id, {
        respuestaAdmin: respuestaAdmin.trim() || undefined,
      })
      setActionSuccess(`¡Reclamación #${selectedReclamacion.id} marcada como RESUELTA exitosamente!`)
      fetchReclamaciones()
      handleCloseResolveModal()
    } catch (err) {
      setActionError(err.message || 'Error al resolver la reclamación')
    } finally {
      setResolvingLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconAlertTriangle size={28} color="var(--color-secondary-dark)" />
              <span>Gestión de Reclamaciones</span>
            </h1>
            <p className="subtitle">
              Revisa las incidencias reportadas por tiendas sobre pedidos o productos y emite la resolución administrativa.
            </p>
          </div>
          <button onClick={fetchReclamaciones} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {actionError && <div className="error-box">{actionError}</div>}
      {actionSuccess && <div className="success-box">{actionSuccess}</div>}

      {loading && <div className="card loading-state">Cargando reclamaciones...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="card table-card">
          <div className="table-header">
            <h3>Reclamaciones Registradas ({reclamaciones.length})</h3>
          </div>

          {reclamaciones.length === 0 ? (
            <div className="empty-state">
              <p>No hay reclamaciones reportadas en el sistema.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>Asunto / Detalle</th>
                    <th>Tienda Compradora</th>
                    <th>Pedido ID</th>
                    <th>Estado</th>
                    <th>Respuesta Admin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reclamaciones.map((rec) => (
                    <tr key={rec.id}>
                      <td className="font-bold">#{rec.id}</td>
                      <td>
                        <strong>{rec.asunto}</strong>
                        <div style={{ maxWidth: '280px', fontSize: '0.86rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                          {rec.descripcion || 'Sin descripción adicional.'}
                        </div>
                      </td>
                      <td>
                        <strong>{rec.usuarioNombre || `Tienda #${rec.usuarioId}`}</strong>
                        {rec.usuarioEmail && <div className="muted-text">{rec.usuarioEmail}</div>}
                      </td>
                      <td>{rec.pedidoId ? `Pedido #${rec.pedidoId}` : <span className="muted-text">General</span>}</td>
                      <td>
                        <span className={`status-pill ${rec.estado === 'RESUELTA' ? 'status-aceptado' : 'status-pendiente'}`}>
                          {rec.estado}
                        </span>
                      </td>
                      <td>
                        {rec.respuestaAdmin ? (
                          <span style={{ fontSize: '0.86rem', color: '#1b5e20', fontWeight: '600' }}>
                            {rec.respuestaAdmin}
                          </span>
                        ) : (
                          <span className="muted-text" style={{ fontSize: '0.84rem' }}>Sin respuesta aún</span>
                        )}
                      </td>
                      <td>
                        {rec.estado !== 'RESUELTA' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenResolveModal(rec)}
                            className="btn btn-sm btn-primary"
                          >
                            Resolver Reclamación
                          </button>
                        ) : (
                          <span className="muted-text" style={{ fontSize: '0.85rem' }}>✓ Caso cerrado</span>
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

      {/* Modal Resolver Reclamación con Respuesta */}
      {selectedReclamacion && (
        <div className="modal-overlay" onClick={handleCloseResolveModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 520px)' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconShield size={22} color="var(--color-primary)" />
                <span>Resolver Reclamación #{selectedReclamacion.id}</span>
              </h2>
              <button type="button" className="btn-close" onClick={handleCloseResolveModal}>&times;</button>
            </div>

            <form onSubmit={handleConfirmResolve} className="standard-form">
              <div style={{ padding: '14px 18px', backgroundColor: '#f7faf7', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.86rem', color: 'var(--color-primary-dark)', fontWeight: '700', marginBottom: '4px' }}>
                  Tienda Reclamante: {selectedReclamacion.usuarioNombre || `Tienda #${selectedReclamacion.usuarioId}`}
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: '700' }}>{selectedReclamacion.asunto}</p>
                <p className="muted-text" style={{ margin: 0, fontSize: '0.86rem' }}>{selectedReclamacion.descripcion || 'Sin descripción adicional.'}</p>
              </div>

              <div className="form-group">
                <label htmlFor="respuesta-admin-input">Escribe la Respuesta o Solución Oficial para la Tienda: *</label>
                <textarea
                  id="respuesta-admin-input"
                  rows="3"
                  placeholder="Ej: Se verficó el caso y se ha coordinado la devolución / reembolso correspondiente."
                  value={respuestaAdmin}
                  onChange={(e) => setRespuestaAdmin(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseResolveModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={resolvingLoading} className="btn btn-primary">
                  {resolvingLoading ? 'Guardando...' : 'Confirmar Resolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
