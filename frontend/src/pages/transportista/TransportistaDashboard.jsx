import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconTruck, IconBox, IconMapPin, IconShield } from '../../components/Icons'

export default function TransportistaDashboard() {
  const { user } = useAuth()

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconTruck size={28} color="var(--color-primary)" />
          <span>Panel Logístico del Transportista</span>
        </h1>
        <p className="subtitle">
          Bienvenido, <strong>{user?.name || 'Transportista'}</strong>. Gestiona tus vehículos, acepta servicios y transmite ubicación de entregas.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox size={20} color="var(--color-accent)" />
              <span>Solicitudes de Flete</span>
            </h3>
            <span className="card-tag">Bandeja</span>
          </div>
          <p>Revisa solicitudes de despacho entrantes enviadas por productores para aceptar o rechazar fletes.</p>
          <div className="card-actions">
            <Link to="/transportista/solicitudes" className="btn btn-primary btn-block">
              Ver Solicitudes
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconMapPin size={20} color="var(--color-primary)" />
              <span>Servicios y Entregas</span>
            </h3>
            <span className="card-tag">Activos</span>
          </div>
          <p>Monitorea fletes en curso, transmite coordenadas GPS en vivo y confirma entregas completadas.</p>
          <div className="card-actions">
            <Link to="/transportista/servicios" className="btn btn-primary btn-block">
              Ver Servicios Activos
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconTruck size={20} color="var(--color-secondary-dark)" />
              <span>Mis Vehículos</span>
            </h3>
            <span className="card-tag">Flotas</span>
          </div>
          <p>Registra camiones o camionetas con capacidad de carga y especificaciones de refrigeración.</p>
          <div className="card-actions">
            <Link to="/transportista/vehiculos" className="btn btn-primary btn-block">
              Gestionar Vehículos
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconShield size={20} color="var(--color-primary)" />
              <span>Estado y Disponibilidad</span>
            </h3>
            <span className="card-tag">Turnos</span>
          </div>
          <p>Activa o pausa tu disponibilidad en línea para recibir nuevas solicitudes de productores.</p>
          <div className="card-actions">
            <Link to="/transportista/disponibilidad" className="btn btn-accent btn-block">
              Cambiar Estado
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
