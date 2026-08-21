/**
 * AuthContext.jsx - Estado Global de Autenticación
 * Gestiona el ciclo de vida de la sesión (Token JWT y datos del usuario).
 * Persiste la sesión en localStorage para mantenerla activa al recargar la página.
 */

import { createContext, useContext, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'

const TOKEN_KEY = 'freshlink_token'
const USER_KEY = 'freshlink_user'
const AuthContext = createContext(null)

// Función auxiliar para recuperar el usuario serializado de localStorage
function storedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(storedUser)
  const [loading, setLoading] = useState(false)

  // Inicia sesión: solicita JWT al backend y lo almacena localmente
  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await authApi.login(credentials)
      const currentUser = {
        id: response.userId,
        name: response.name,
        email: response.email,
        role: response.role,
      }
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      setToken(response.token)
      setUser(currentUser)
      return response
    } finally {
      setLoading(false)
    }
  }

  // Cierra sesión: limpia los tokens y resetea el estado
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  // Memoriza los valores para optimizar el rendimiento y evitar re-renders innecesarios
  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para consumir el contexto fácilmente en cualquier componente
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }
  return context
}
