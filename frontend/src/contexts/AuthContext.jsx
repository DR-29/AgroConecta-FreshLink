import { createContext, useContext, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'

const TOKEN_KEY = 'freshlink_token'
const USER_KEY = 'freshlink_user'
const AuthContext = createContext(null)

function storedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(storedUser)
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await authApi.login(credentials)
      const currentUser = { id: response.userId, name: response.name, email: response.email, role: response.role }
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      setToken(response.token)
      setUser(currentUser)
      return response
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, isAuthenticated: Boolean(token), login, logout }), [token, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
