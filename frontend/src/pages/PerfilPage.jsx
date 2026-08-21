import { useState, useEffect } from 'react'
import { userApi } from '../api/endpoints'
import { useAuth } from '../contexts/AuthContext'
import { IconUsers, IconMail, IconPhone, IconShield } from '../components/Icons'

export default function PerfilPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await userApi.getMe()
      setProfile(data)
      setName(data.name || '')
      setPhone(data.phone || '')
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setError('')
    setSuccessMsg('')

    if (newPassword && (newPassword.length < 8 || newPassword.length > 16)) {
      setError('La nueva contraseña debe tener entre 8 y 16 caracteres.')
      setUpdating(false)
      return
    }

    try {
      const payload = {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        password: newPassword ? newPassword : undefined,
      }

      const updated = await userApi.updateMe(payload)
      setProfile(updated)
      setNewPassword('')
      setSuccessMsg('¡Perfil actualizado exitosamente!')

      const storedUser = JSON.parse(localStorage.getItem('freshlink_user') || '{}')
      localStorage.setItem(
        'freshlink_user',
        JSON.stringify({ ...storedUser, name: updated.name })
      )
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconUsers size={28} color="var(--color-primary)" />
          <span>Mi Perfil</span>
        </h1>
        <p className="subtitle">Consulta tus datos personales y actualiza tu información de contacto o contraseña.</p>
      </div>

      {loading && <div className="card loading-state">Cargando datos del perfil...</div>}
      {error && <div className="error-box">{error}</div>}

      {!loading && profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Tarjeta Informativa del Usuario */}
          <div className="card" style={{ padding: '28px' }}>
            <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>{profile.name}</h3>
                <span className={`role-badge role-${profile.role.toLowerCase()}`} style={{ marginTop: '6px', display: 'inline-block' }}>
                  {profile.role}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>
                  <IconMail size={18} />
                </span>
                <div>
                  <span className="muted-text" style={{ fontSize: '0.8rem', display: 'block' }}>Correo electrónico</span>
                  <strong>{profile.email}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>
                  <IconPhone size={18} />
                </span>
                <div>
                  <span className="muted-text" style={{ fontSize: '0.8rem', display: 'block' }}>Teléfono de contacto</span>
                  <strong>{profile.phone || <span className="muted-text">No registrado</span>}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>
                  <IconShield size={18} />
                </span>
                <div>
                  <span className="muted-text" style={{ fontSize: '0.8rem', display: 'block' }}>Estado de la Cuenta</span>
                  <span className={`status-pill ${profile.enabled ? 'status-aceptado' : 'status-cancelado'}`}>
                    {profile.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </div>

              {profile.role === 'TRANSPORTISTA' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}>
                    <IconShield size={18} />
                  </span>
                  <div>
                    <span className="muted-text" style={{ fontSize: '0.8rem', display: 'block' }}>Aprobación Admin</span>
                    <span style={{ fontWeight: '700', color: profile.approved ? '#2e7d32' : '#f57f17' }}>
                      {profile.approved ? 'Aprobado' : 'Pendiente por autorización'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Edición */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '18px' }}>Editar Información Personal</h3>
            <form onSubmit={handleSubmit} className="standard-form">
              <div className="form-group">
                <label htmlFor="edit-name">Nombre completo: *</label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-phone">Teléfono de contacto:</label>
                <input
                  id="edit-phone"
                  type="tel"
                  placeholder="Ej: 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-pass">Cambiar Contraseña (De 8 a 16 caracteres):</label>
                <input
                  id="edit-pass"
                  type="password"
                  placeholder="Dejar en blanco para mantener la contraseña actual"
                  maxLength={16}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  style={{ height: '44px' }}
                />
              </div>

              {error && <div className="error-box">{error}</div>}
              {successMsg && <div className="success-box">{successMsg}</div>}

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" disabled={updating} className="btn btn-primary btn-block" style={{ height: '44px' }}>
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
