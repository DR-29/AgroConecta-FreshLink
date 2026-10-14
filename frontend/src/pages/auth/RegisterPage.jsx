import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'PRODUCTOR',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (form.password.length < 8 || form.password.length > 16) {
      setError('La contraseña debe tener entre 8 y 16 caracteres.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
      }

      await authApi.register(payload)
      setSuccess('¡Registro exitoso! Iniciando sesión automáticamente...')

      setTimeout(async () => {
        try {
          await login({ email: form.email.trim(), password: form.password })
          navigate(`/${form.role.toLowerCase()}`, { replace: true })
        } catch {
          navigate('/login', { replace: true })
        }
      }, 1200)
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="login-card" style={{ width: 'min(100%, 480px)' }}>
        <span className="eyebrow">AgroConecta / FreshLink</span>
        <h1>Crear nueva cuenta</h1>
        <p className="muted-text">Únete como productor, tienda o transportista.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Nombre completo *
            <input
              name="name"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Correo electrónico *
            <input
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Contraseña (De 8 a 16 caracteres) *
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              maxLength={16}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <label>
            Teléfono (Opcional)
            <input
              name="phone"
              type="tel"
              placeholder="Ej: 555-0199"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          <label>
            Selecciona tu Rol *
            <select
              name="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-field"
              required
            >
              <option value="PRODUCTOR">Productor Agrícola</option>
              <option value="TIENDA">Tienda Compradora</option>
              <option value="TRANSPORTISTA">Transportista Logístico</option>
            </select>
          </label>

          {error && <div className="error-box" role="alert">{error}</div>}
          {success && <div className="success-box" role="alert">{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span className="muted-text">¿Ya tienes una cuenta? </span>
          <Link to="/login" className="action-link" style={{ marginTop: 0 }}>
            Iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  )
}
