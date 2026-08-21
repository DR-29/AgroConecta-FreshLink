import { api } from './client'

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (payload) => api.put('/users/me', payload),
}

export const productorApi = {
  getFincas: () => api.get('/productor/fincas'),
  createFinca: (payload) => api.post('/productor/fincas', payload),
  updateFinca: (id, payload) => api.put(`/productor/fincas/${id}`, payload),
  deleteFinca: (id) => api.delete(`/productor/fincas/${id}`),
  getProductos: () => api.get('/productor/productos'),
  createProducto: (payload) => api.post('/productor/productos', payload),
  updateProducto: (id, payload) => api.put(`/productor/productos/${id}`, payload),
  updateStock: (id, payload) => api.patch(`/productor/productos/${id}/stock`, payload),
  getPedidos: () => api.get('/productor/pedidos'),
  acceptPedido: (id) => api.post(`/productor/pedidos/${id}/aceptar`),
  selectTransportista: (pedidoId, transportistaId) => api.post(`/productor/pedidos/${pedidoId}/seleccionar-transportista`, { transportistaId }),
  getTransportistas: () => api.get('/productor/transportistas'),
}

export const tiendaApi = {
  searchProductos: (params = '') => api.get(`/tienda/productos${params}`),
  createPedido: (payload) => api.post('/tienda/pedidos', payload),
  getPedidos: () => api.get('/tienda/pedidos'),
  getSeguimiento: (id) => api.get(`/tienda/pedidos/${id}/seguimiento`),
  createCalificacion: (id, payload) => api.post(`/tienda/pedidos/${id}/calificar`, payload),
  createReclamacion: (payload) => api.post('/tienda/reclamaciones', payload),
  getReclamaciones: () => api.get('/tienda/reclamaciones'),
}

export const transportistaApi = {
  getVehiculos: () => api.get('/transportista/vehiculos'),
  createVehiculo: (payload) => api.post('/transportista/vehiculos', payload),
  getSolicitudes: () => api.get('/transportista/solicitudes'),
  acceptSolicitud: (id) => api.post(`/transportista/solicitudes/${id}/aceptar`),
  rejectSolicitud: (id) => api.post(`/transportista/solicitudes/${id}/rechazar`),
  getServicios: () => api.get('/transportista/servicios'),
  updateAvailability: (available) => api.patch(`/transportista/disponibilidad?disponible=${available}`),
  shareLocation: (payload) => api.post('/transportista/ubicacion', payload),
  updateDeliveryStatus: (id, payload) => api.patch(`/transportista/pedidos/${id}/estado`, payload),
}

export const adminApi = {
  getUsuarios: () => api.get('/admin/usuarios'),
  toggleUsuario: (id) => api.post(`/admin/usuarios/${id}/toggle`),
  approveTransportista: (id, approved) => api.patch(`/admin/transportistas/${id}/aprobacion?aprobado=${approved}`),
  getProductos: () => api.get('/admin/productos'),
  deactivateProducto: (id) => api.delete(`/admin/productos/${id}`),
  getReclamaciones: () => api.get('/admin/reclamaciones'),
  resolveReclamacion: (id, payload) => api.post(`/admin/reclamaciones/${id}/resolver`, payload),
  getReporteUsuarios: () => api.get('/admin/reportes/usuarios'),
  getReportePedidos: () => api.get('/admin/reportes/pedidos'),
  getReporteCalificaciones: () => api.get('/admin/reportes/calificaciones'),
}
