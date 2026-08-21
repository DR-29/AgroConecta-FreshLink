import { useState, useEffect } from 'react'
import { productorApi } from '../../api/endpoints'
import { IconTruck, IconRefresh, IconMail, IconPhone, IconShield } from '../../components/Icons'

export default function TransportistasPage() {
  const [transportistas, setTransportistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTransportistas = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await productorApi.getTransportistas()
      setTransportistas(data || [])
    } catch (err) {
      setError(err.message || 'Error al consultar transportistas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransportistas()
  }, [])

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconTruck size={28} color="var(--color-secondary-dark)" />
              <span>Directorio de Transportistas Disponibles</span>
            </h1>
            <p className="subtitle">
              Conductores autorizados por la administración para realizar traslados y despachos agrícolas.
            </p>
          </div>
          <button onClick={fetchTransportistas} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {loading && <div className="card loading-state">Cargando transportistas disponibles...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-grid">
          {transportistas.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No hay transportistas disponibles en este momento. Vuelve a consultar en unos minutos.</p>
            </div>
          ) : (
            transportistas.map((trans) => (
              <div key={trans.id} className="card">
                <div className="card-header">
                  <h3>{trans.name}</h3>
                  <span className="card-tag">ID #{trans.id}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <IconMail size={16} color="var(--color-muted)" />
                    <span>{trans.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <IconPhone size={16} color="var(--color-muted)" />
                    <span>{trans.phone || 'No registrado'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconShield size={16} color={trans.approved ? '#2e7d32' : '#c62828'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: trans.approved ? '#2e7d32' : '#c62828' }}>
                      {trans.approved ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </div>
                  <span className={`status-pill ${trans.available ? 'status-aceptado' : 'status-default'}`}>
                    {trans.available ? 'Disponible' : 'Ocupado'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
