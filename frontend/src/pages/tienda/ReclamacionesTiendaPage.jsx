import { useState, useEffect } from 'react'
import { tiendaApi } from '../../api/endpoints'
import { IconAlertTriangle, IconRefresh, IconShield } from '../../components/Icons'

export default function ReclamacionesTiendaPage() {
  const [pedidos, setPedidos] = useState([])
  const [reclamaciones, setReclamaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [selectedPedidoId, setSelectedPedidoId] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [pedidosData, reclamasData] = await Promise.all([
        tiendaApi.getPedidos().catch(() => []),
        tiendaApi.getReclamaciones().catch(() => []),
      ])
      setPedidos(pedidosData || [])
      setReclamaciones(reclamasData || [])
    } catch {
      // Ignorar errores generales de carga vacía
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const payload = {
        asunto: asunto.trim(),
        descripcion: descripcion.trim() || undefined,
        pedidoId: selectedPedidoId ? Number(selectedPedidoId) : undefined,
      }

      await tiendaApi.createReclamacion(payload)
      setSuccessMsg('¡Reclamación registrada exitosamente! El equipo de administración revisará el caso.')
      setAsunto('')
      setDescripcion('')
      setSelectedPedidoId('')
      loadData()
    } catch (err) {
      setErrorMsg(err.message || 'Error al enviar la reclamación')
    } finally {
      setSubmitLoading(false)
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
              Envía reportes sobre pedidos en mal estado o retrasos, y consulta las respuestas del Administrador.
            </p>
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Formulario de registro */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '6px' }}>Registrar Nueva Reclamación</h3>
          <p className="muted-text" style={{ marginBottom: '20px' }}>
            Diligencia el formulario para notificar a los administradores de la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="standard-form">
            <div className="form-group">
              <label htmlFor="asunto-input">Asunto de la reclamación: *</label>
              <input
                id="asunto-input"
                type="text"
                placeholder="Ej: Producto llegó en mal estado / Retraso excesivo"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="input-field"
                style={{ height: '44px' }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pedido-select">Asociar a un Pedido (Opcional):</label>
              <select
                id="pedido-select"
                value={selectedPedidoId}
                onChange={(e) => setSelectedPedidoId(e.target.value)}
                className="input-field"
                style={{ height: '44px' }}
                disabled={loading}
              >
                <option value="">-- Sin pedido asociado / Reclamación general --</option>
                {pedidos.map((p) => (
                  <option key={p.id} value={p.id}>
                    Pedido #{p.id} - Total: ${Number(p.total).toFixed(2)} ({p.estado})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion-input">Descripción detallada del incidente: *</label>
              <textarea
                id="descripcion-input"
                rows="4"
                placeholder="Describe lo ocurrido con la mayor cantidad de detalles posible..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {errorMsg && <div className="error-box">{errorMsg}</div>}
            {successMsg && <div className="success-box">{successMsg}</div>}

            <div style={{ marginTop: '20px' }}>
              <button type="submit" disabled={submitLoading} className="btn btn-primary btn-block" style={{ height: '44px' }}>
                {submitLoading ? 'Enviando...' : 'Enviar Reclamación'}
              </button>
            </div>
          </form>
        </div>

        {/* Listado de Reclamaciones de la Tienda y Respuestas Admin */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '6px' }}>Mis Reclamaciones Enviadas ({reclamaciones.length})</h3>
          <p className="muted-text" style={{ marginBottom: '20px' }}>
            Estado e historial de respuestas emitidas por la Administración.
          </p>

          {loading && <div className="loading-state">Cargando reclamaciones...</div>}

          {!loading && reclamaciones.length === 0 ? (
            <div className="empty-state">
              <p>Aún no has registrado ninguna reclamación.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {reclamaciones.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-bold" style={{ fontSize: '1rem', color: 'var(--color-text)' }}>
                      #{rec.id} - {rec.asunto}
                    </span>
                    <span className={`status-pill ${rec.estado === 'RESUELTA' ? 'status-aceptado' : 'status-pendiente'}`}>
                      {rec.estado}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-muted)' }}>
                    {rec.descripcion || 'Sin descripción adicional.'}
                  </p>

                  {rec.pedidoId && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-primary-dark)', fontWeight: '700' }}>
                      Asociado a Pedido #{rec.pedidoId}
                    </div>
                  )}

                  {/* Respuesta del Administrador */}
                  {rec.respuestaAdmin ? (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '12px 14px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px',
                        border: '1px solid #c8e6c9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1b5e20', fontWeight: '800', fontSize: '0.86rem' }}>
                        <IconShield size={16} color="#1b5e20" />
                        <span>Respuesta del Administrador:</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#2e7d32' }}>
                        {rec.respuestaAdmin}
                      </p>
                      {rec.fechaResolucion && (
                        <span className="muted-text" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                          Fecha de resolución: {new Date(rec.fechaResolucion).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#b71c1c', fontStyle: 'italic', marginTop: '4px' }}>
                      ⏳ En espera de revisión y respuesta administrativa...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
