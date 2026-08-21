import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await authApi.forgotPassword({ email: email.trim() })
      setMessage(response.message || 'Si el email está registrado, se enviará el enlace de recuperación.')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación de contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="login-card">
        <span className="eyebrow">AgroConecta / FreshLink</span>
        <h1>Recuperar contraseña</h1>
        <p className="muted-text">Ingresa tu correo registrado para recibir instrucciones de restablecimiento.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              placeholder="tu-email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error && <div className="error-box" role="alert">{error}</div>}
          {message && <div className="success-box" role="alert">{message}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Solicitar Enlace'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/login" className="action-link" style={{ marginTop: 0 }}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  )
}
