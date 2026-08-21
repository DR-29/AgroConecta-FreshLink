import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return <main className="app-shell">
    <section className="welcome-card">
      <span className="eyebrow">Acceso restringido</span>
      <h1>No autorizado</h1>
      <p>No tienes permisos para acceder a esta sección.</p>
      <Link className="action-link" to="/">Volver al inicio</Link>
    </section>
  </main>
}
