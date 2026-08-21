import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await login(form)
      if (response && response.role) {
        navigate(`/${response.role.toLowerCase()}`, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (requestError) {
      setError(requestError.message || 'No fue posible iniciar sesión')
    }
  }

  return (
    <main className="auth-shell">
      <section className="login-card">
        <span className="eyebrow">AgroConecta / FreshLink</span>
        <h1>Iniciar sesión</h1>
        <p className="muted-text">Ingresa con tus credenciales de acceso.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              placeholder="tu-email@ejemplo.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error && <div className="error-box" role="alert">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
          <div>
            <span className="muted-text">¿No tienes cuenta? </span>
            <Link to="/register" className="action-link" style={{ marginTop: 0 }}>
              Regístrate aquí
            </Link>
          </div>
          <div>
            <Link to="/forgot-password" className="action-link" style={{ marginTop: 0, color: '#546e7a' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
