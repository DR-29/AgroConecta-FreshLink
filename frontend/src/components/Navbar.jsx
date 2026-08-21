import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { IconSprout, IconUsers } from './Icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const roleLabels = {
    ADMIN: 'Administrador',
    PRODUCTOR: 'Productor',
    TIENDA: 'Tienda',
    TRANSPORTISTA: 'Transportista',
  }

  const handleBrandClick = () => {
    if (user?.role) {
      navigate(`/${user.role.toLowerCase()}`)
    } else {
      navigate('/')
    }
  }

  return (
    <header className="navbar-header">
      <div className="navbar-brand" onClick={handleBrandClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="brand-logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <IconSprout size={26} color="var(--color-primary)" />
        </span>
        <span className="brand-name">AgroConecta</span>
        <span className="brand-badge">FreshLink</span>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name || 'Usuario'}</span>
          <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
            {roleLabels[user?.role] || user?.role}
          </span>
        </div>

        <Link
          to="/perfil"
          className="btn btn-secondary btn-sm"
          title="Mi Perfil de usuario"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <IconUsers size={16} color="var(--color-primary-dark)" />
          <span>Mi Perfil</span>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="btn-logout"
          title="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
