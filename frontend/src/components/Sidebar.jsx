import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  IconDashboard,
  IconUsers,
  IconSprout,
  IconStore,
  IconTruck,
  IconShield,
  IconAlertTriangle,
  IconChart,
  IconBox,
  IconHome,
} from './Icons'

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role

  const getRoleHeader = () => {
    switch (role) {
      case 'PRODUCTOR': return { title: 'Módulo Productor', icon: <IconSprout size={16} /> }
      case 'TIENDA': return { title: 'Módulo Tienda', icon: <IconStore size={16} /> }
      case 'TRANSPORTISTA': return { title: 'Módulo Logística', icon: <IconTruck size={16} /> }
      case 'ADMIN': return { title: 'Administración', icon: <IconShield size={16} /> }
      default: return { title: 'Navegación', icon: <IconDashboard size={16} /> }
    }
  }

  const getNavLinks = () => {
    switch (role) {
      case 'PRODUCTOR':
        return [
          { to: '/productor', label: 'Resumen General', icon: <IconDashboard size={17} />, end: true },
          { to: '/productor/fincas', label: 'Mis Fincas', icon: <IconHome size={17} /> },
          { to: '/productor/productos', label: 'Mis Productos e Inventario', icon: <IconSprout size={17} /> },
          { to: '/productor/pedidos', label: 'Pedidos Recibidos', icon: <IconBox size={17} /> },
          { to: '/productor/transportistas', label: 'Directorio de Transportistas', icon: <IconTruck size={17} /> },
        ]
      case 'TIENDA':
        return [
          { to: '/tienda', label: 'Resumen General', icon: <IconDashboard size={17} />, end: true },
          { to: '/tienda/productos', label: 'Catálogo y Búsqueda', icon: <IconSprout size={17} /> },
          { to: '/tienda/pedidos', label: 'Mis Pedidos y Seguimiento', icon: <IconBox size={17} /> },
          { to: '/tienda/reclamaciones', label: 'Gestión de Reclamaciones', icon: <IconAlertTriangle size={17} /> },
        ]
      case 'TRANSPORTISTA':
        return [
          { to: '/transportista', label: 'Resumen General', icon: <IconDashboard size={17} />, end: true },
          { to: '/transportista/solicitudes', label: 'Solicitudes de Flete', icon: <IconBox size={17} /> },
          { to: '/transportista/servicios', label: 'Servicios Activos', icon: <IconTruck size={17} /> },
          { to: '/transportista/vehiculos', label: 'Mis Vehículos', icon: <IconTruck size={17} /> },
          { to: '/transportista/disponibilidad', label: 'Estado y Disponibilidad', icon: <IconShield size={17} /> },
        ]
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Panel General', icon: <IconDashboard size={17} />, end: true },
          { to: '/admin/usuarios', label: 'Usuarios y Aprobaciones', icon: <IconUsers size={17} /> },
          { to: '/admin/productos', label: 'Catálogo Global', icon: <IconSprout size={17} /> },
          { to: '/admin/reclamaciones', label: 'Gestión de Reclamaciones', icon: <IconAlertTriangle size={17} /> },
          { to: '/admin/reportes', label: 'Reportes e Indicadores', icon: <IconChart size={17} /> },
        ]
      default:
        return []
    }
  }

  const headerInfo = getRoleHeader()
  const links = getNavLinks()

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-title">
        <span className="sidebar-title-icon">{headerInfo.icon}</span>
        <span>{headerInfo.title}</span>
      </div>
      <nav className="nav-menu">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
