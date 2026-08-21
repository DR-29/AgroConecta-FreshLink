import { useAuth } from '../contexts/AuthContext'

export default function RoleDashboard({ role }) {
  const { user, logout } = useAuth()

  return <main className="app-shell">
    <section className="welcome-card">
      <span className="eyebrow">Panel {role}</span>
      <h1>Hola, {user?.name}</h1>
      <p>Este es el dashboard inicial. Las funciones de tu rol se agregaran en los siguientes pasos.</p>
      <button className="secondary-button" onClick={logout}>Cerrar sesion</button>
    </section>
  </main>
}
