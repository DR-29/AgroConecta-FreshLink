/**
 * ProtectedRoute.jsx - Guardián de Seguridad de Rutas (RBAC)
 * 1. Valida si el usuario está autenticado (JWT en AuthContext).
 * 2. Valida si el rol del usuario tiene permiso para acceder a la ruta solicitada.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // Si no ha iniciado sesión, redirige al Login guardando la ruta previa
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Si el rol del usuario no está dentro de los permitidos, redirige a 403 (No Autorizado)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Si pasa todas las validaciones, renderiza el componente hijo de la ruta
  return <Outlet />
}
