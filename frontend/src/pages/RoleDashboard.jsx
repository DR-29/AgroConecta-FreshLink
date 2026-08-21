/**
 * RoleDashboard.jsx
 * Vista base de bienvenida y redirección según el rol del usuario autenticado.
 * Utiliza AuthContext para consultar la sesión actual y gestionar el cierre de sesión.
 */

import { useAuth } from '../contexts/AuthContext'

export default function RoleDashboard({ role }) {
  // Extrae el usuario activo y la función de logout del estado global
  const { user, logout } = useAuth()

  return (
    <main className="app-shell">
      <section className="welcome-card">
        <span className="eyebrow">Panel {role}</span>
        <h1>Hola, {user?.name}</h1>
        <p>Este es el dashboard inicial. Las funciones de tu rol se agregaran en los siguientes pasos.</p>
        <button className="secondary-button" onClick={logout}>
          Cerrar sesion
        </button>
      </section>
    </main>
  )
}
