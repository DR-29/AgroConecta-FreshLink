import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconShield, IconUsers, IconSprout, IconAlertTriangle, IconChart } from '../../components/Icons'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconShield size={28} color="var(--color-primary)" />
          <span>Panel de Administración</span>
        </h1>
        <p className="subtitle">
          Bienvenido de nuevo, <strong>{user?.name || 'Administrador'}</strong>. Monitorea usuarios, aprueba transportistas, gestiona el catálogo y resuelve incidencias.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconUsers size={20} color="var(--color-primary)" />
              <span>Usuarios y Aprobaciones</span>
            </h3>
            <span className="card-tag">Gestión</span>
          </div>
          <p>Supervisa las cuentas registradas, habilita o suspende accesos y aprueba la autorización de transportistas.</p>
          <div className="card-actions">
            <Link to="/admin/usuarios" className="btn btn-primary btn-block">
              Gestionar Usuarios
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSprout size={20} color="var(--color-primary)" />
              <span>Catálogo Global</span>
            </h3>
            <span className="card-tag">Productos</span>
          </div>
          <p>Consulta la lista general de publicaciones agrícolas y realiza bajas lógicas cuando sea necesario.</p>
          <div className="card-actions">
            <Link to="/admin/productos" className="btn btn-primary btn-block">
              Ver Catálogo
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconAlertTriangle size={20} color="var(--color-secondary-dark)" />
              <span>Reclamaciones</span>
            </h3>
            <span className="card-tag">Soporte</span>
          </div>
          <p>Revisa y resuelve las incidencias o problemas reportados por las tiendas compradoras.</p>
          <div className="card-actions">
            <Link to="/admin/reclamaciones" className="btn btn-primary btn-block">
              Resolver Reclamaciones
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconChart size={20} color="var(--color-accent)" />
              <span>Reportes e Indicadores</span>
            </h3>
            <span className="card-tag">Métricas</span>
          </div>
          <p>Analiza el comportamiento global: distribución de usuarios, flujo de pedidos y niveles de satisfacción.</p>
          <div className="card-actions">
            <Link to="/admin/reportes" className="btn btn-accent btn-block">
              Ver Indicadores
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
