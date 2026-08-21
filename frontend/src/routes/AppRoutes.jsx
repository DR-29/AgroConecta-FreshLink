import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Auth Pages
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import PerfilPage from '../pages/PerfilPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'

// Productor Pages
import ProductorDashboard from '../pages/productor/ProductorDashboard'
import MisFincasPage from '../pages/productor/MisFincasPage'
import MisProductosPage from '../pages/productor/MisProductosPage'
import PedidosProductorPage from '../pages/productor/PedidosProductorPage'
import TransportistasPage from '../pages/productor/TransportistasPage'

// Tienda Pages
import TiendaDashboard from '../pages/tienda/TiendaDashboard'
import BuscarProductosPage from '../pages/tienda/BuscarProductosPage'
import PedidosTiendaPage from '../pages/tienda/PedidosTiendaPage'
import ReclamacionesTiendaPage from '../pages/tienda/ReclamacionesTiendaPage'

// Transportista Pages
import TransportistaDashboard from '../pages/transportista/TransportistaDashboard'
import SolicitudesPage from '../pages/transportista/SolicitudesPage'
import MisServiciosPage from '../pages/transportista/MisServiciosPage'
import MisVehiculosPage from '../pages/transportista/MisVehiculosPage'
import DisponibilidadPage from '../pages/transportista/DisponibilidadPage'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import UsuariosPage from '../pages/admin/UsuariosPage'
import ProductosAdminPage from '../pages/admin/ProductosAdminPage'
import ReclamacionesAdminPage from '../pages/admin/ReclamacionesAdminPage'
import ReportesAdminPage from '../pages/admin/ReportesAdminPage'

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role.toLowerCase()}`} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* RUTAS COMUNES PROTEGIDAS (Cualquier usuario autenticado) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTOR', 'TIENDA', 'TRANSPORTISTA']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
          <Route path="/admin/productos" element={<ProductosAdminPage />} />
          <Route path="/admin/reclamaciones" element={<ReclamacionesAdminPage />} />
          <Route path="/admin/reportes" element={<ReportesAdminPage />} />
        </Route>
      </Route>

      {/* PRODUCTOR */}
      <Route element={<ProtectedRoute allowedRoles={['PRODUCTOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/productor" element={<ProductorDashboard />} />
          <Route path="/productor/fincas" element={<MisFincasPage />} />
          <Route path="/productor/productos" element={<MisProductosPage />} />
          <Route path="/productor/pedidos" element={<PedidosProductorPage />} />
          <Route path="/productor/transportistas" element={<TransportistasPage />} />
        </Route>
      </Route>

      {/* TIENDA */}
      <Route element={<ProtectedRoute allowedRoles={['TIENDA']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/tienda" element={<TiendaDashboard />} />
          <Route path="/tienda/productos" element={<BuscarProductosPage />} />
          <Route path="/tienda/pedidos" element={<PedidosTiendaPage />} />
          <Route path="/tienda/reclamaciones" element={<ReclamacionesTiendaPage />} />
        </Route>
      </Route>

      {/* TRANSPORTISTA */}
      <Route element={<ProtectedRoute allowedRoles={['TRANSPORTISTA']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/transportista" element={<TransportistaDashboard />} />
          <Route path="/transportista/solicitudes" element={<SolicitudesPage />} />
          <Route path="/transportista/servicios" element={<MisServiciosPage />} />
          <Route path="/transportista/vehiculos" element={<MisVehiculosPage />} />
          <Route path="/transportista/disponibilidad" element={<DisponibilidadPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
