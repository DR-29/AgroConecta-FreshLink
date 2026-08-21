import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconSprout, IconHome, IconBox, IconTruck } from '../../components/Icons'

export default function ProductorDashboard() {
  const { user } = useAuth()

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconSprout size={28} color="var(--color-primary)" />
          <span>Panel del Productor</span>
        </h1>
        <p className="subtitle">
          Bienvenido de vuelta, <strong>{user?.name || 'Productor'}</strong>. Gestiona tus fincas, inventario de productos y logística de despachos.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconHome size={20} color="var(--color-primary)" />
              <span>Mis Fincas</span>
            </h3>
            <span className="card-tag">Predios</span>
          </div>
          <p>Registra y administra las ubicaciones de cultivo y predios agrícolas.</p>
          <div className="card-actions">
            <Link to="/productor/fincas" className="btn btn-primary btn-block">
              Gestionar Fincas
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSprout size={20} color="var(--color-primary)" />
              <span>Mis Productos</span>
            </h3>
            <span className="card-tag">Inventario</span>
          </div>
          <p>Publica cosechas, actualiza precios y controla el stock disponible en tiempo real.</p>
          <div className="card-actions">
            <Link to="/productor/productos" className="btn btn-primary btn-block">
              Ver Productos
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox size={20} color="var(--color-accent)" />
              <span>Pedidos Recibidos</span>
            </h3>
            <span className="card-tag">Órdenes</span>
          </div>
          <p>Revisa las solicitudes entrantes de tiendas, acepta pedidos y prepara despachos.</p>
          <div className="card-actions">
            <Link to="/productor/pedidos" className="btn btn-primary btn-block">
              Ver Pedidos
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconTruck size={20} color="var(--color-secondary-dark)" />
              <span>Transportistas</span>
            </h3>
            <span className="card-tag">Logística</span>
          </div>
          <p>Consulta el directorio de transportistas autorizados y disponibles para despachar tus pedidos.</p>
          <div className="card-actions">
            <Link to="/productor/transportistas" className="btn btn-accent btn-block">
              Buscar Transportistas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
