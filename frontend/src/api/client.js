/**
 
 1. Conecta con la URL base del Backend Spring Boot.
 2. Inyecta automáticamente el header 'Authorization: Bearer <JWT>' si existe sesión activa.
 3.. Procesar las respuestas JSON y estandariza el manejo de errores HTTP.
 */

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

async function request(path, options = {}) {
  // Obtiene el token JWT del almacenamiento local
  const token = localStorage.getItem('freshlink_token')

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  // Analiza si la respuesta viene en formato JSON o texto plano
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  // Si el servidor responde con código de error (4xx / 5xx), lanza una excepción
  if (!response.ok) {
    const message = typeof data === 'object' && data?.message
      ? data.message
      : `Error ${response.status} al comunicarse con el servidor`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// Métodos HTTP reutilizables exportados para toda la aplicación
export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  }),
  put: (path, body, options = {}) => request(path, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  patch: (path, body, options = {}) => request(path, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
}

export { API_URL }
