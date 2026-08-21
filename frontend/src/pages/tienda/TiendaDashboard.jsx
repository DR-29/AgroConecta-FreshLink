import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconStore, IconSearch, IconBox, IconAlertTriangle } from '../../components/Icons'

export default function TiendaDashboard() {
  const { user } = useAuth()

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconStore size={28} color="var(--color-primary)" />
          <span>Panel de la Tienda</span>
        </h1>
        <p className="subtitle">
          Bienvenido, <strong>{user?.name || 'Tienda'}</strong>. Explora productos frescos del campo, realiza pedidos directos a productores y monitorea el seguimiento de entregas.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSearch size={20} color="var(--color-primary)" />
              <span>Catálogo y Búsqueda</span>
            </h3>
            <span className="card-tag">Mercado</span>
          </div>
          <p>Encuentra cosechas agrícolas por nombre o categoría con precios transparentes de venta directa.</p>
          <div className="card-actions">
            <Link to="/tienda/productos" className="btn btn-primary btn-block">
              Buscar Productos
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox size={20} color="var(--color-accent)" />
              <span>Mis Pedidos y Seguimiento</span>
            </h3>
            <span className="card-tag">Órdenes</span>
          </div>
          <p>Realiza órdenes de compra, rastrea la ubicación del transporte y califica la calidad del servicio.</p>
          <div className="card-actions">
            <Link to="/tienda/pedidos" className="btn btn-primary btn-block">
              Ver Mis Pedidos
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
          <p>Reporta inconvenientes con pedidos o calidad de producto para soporte y resolución administrativa.</p>
          <div className="card-actions">
            <Link to="/tienda/reclamaciones" className="btn btn-accent btn-block">
              Mis Reclamaciones
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
