import { useState, useEffect } from 'react'
import { transportistaApi, userApi } from '../../api/endpoints'
import { useAuth } from '../../contexts/AuthContext'
import { IconShield, IconTruck, IconRefresh } from '../../components/Icons'

export default function DisponibilidadPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await userApi.getMe()
      setProfile(data)
    } catch (err) {
      setError(err.message || 'Error al consultar estado del perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleToggleAvailability = async (newStatus) => {
    setUpdating(true)
    setError('')
    setSuccessMsg('')
    try {
      const updatedUser = await transportistaApi.updateAvailability(newStatus)
      setProfile(updatedUser)
      setSuccessMsg(`¡Disponibilidad actualizada a: ${newStatus ? 'DISPONIBLE' : 'PAUSADO / EN RUTA'}!`)
    } catch (err) {
      setError(err.message || 'Error al cambiar la disponibilidad')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconShield size={28} color="var(--color-primary)" />
              <span>Mi Disponibilidad y Estado de Servicio</span>
            </h1>
            <p className="subtitle">
              Controla si estás disponible para recibir nuevas solicitudes de traslado de productores.
            </p>
          </div>
          <button onClick={fetchProfile} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
            <IconRefresh size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {loading && <div className="card loading-state">Consultando estado...</div>}
      {error && <div className="error-box">{error}</div>}
      {successMsg && <div className="success-box">{successMsg}</div>}

      {!loading && (
        <div className="card" style={{ padding: '28px' }}>
          <div className="card-header">
            <h3>Estado de la Cuenta</h3>
            <span className="card-tag font-bold">Transportista</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '14px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', backgroundColor: '#f7faf7', padding: '18px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <div>
                <span className="muted-text" style={{ fontSize: '0.86rem' }}>Aprobación Administrativa:</span>
                <div style={{ fontWeight: '700', marginTop: '4px', color: profile?.approved ? '#2e7d32' : '#c62828' }}>
                  {profile?.approved ? 'Aprobado por el Administrador' : 'Pendiente de Aprobación por Admin'}
                </div>
              </div>
              <div>
                <span className="muted-text" style={{ fontSize: '0.86rem' }}>Disponibilidad Actual:</span>
                <div style={{ marginTop: '4px' }}>
                  <span className={`status-pill ${profile?.available ? 'status-aceptado' : 'status-default'}`}>
                    {profile?.available ? 'DISPONIBLE (Recibiendo solicitudes)' : 'PAUSADO / EN RUTA'}
                  </span>
                </div>
              </div>
            </div>

            {!profile?.approved && (
              <div className="error-box">
                Tu cuenta de transportista aún no ha sido aprobada por un administrador. No podrás activarte como disponible ni recibir solicitudes hasta ser aprobado.
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => handleToggleAvailability(true)}
                disabled={updating || profile?.available || !profile?.approved}
                className="btn btn-primary"
                style={{ flex: 1, height: '44px' }}
              >
                {updating ? 'Actualizando...' : 'Activar como Disponible'}
              </button>

              <button
                type="button"
                onClick={() => handleToggleAvailability(false)}
                disabled={updating || !profile?.available}
                className="btn btn-secondary"
                style={{ flex: 1, height: '44px' }}
              >
                {updating ? 'Actualizando...' : 'Pausar Disponibilidad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
