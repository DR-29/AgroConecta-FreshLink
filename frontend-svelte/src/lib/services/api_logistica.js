import { request } from './api_client.js';

const URL_BASE = '/api/v1/logistica';

export async function obtenerVehiculos(soloAprobados = false) {
	return await request(`${URL_BASE}/vehiculos?solo_aprobados=${soloAprobados}`);
}

export async function crearVehiculo(vehiculo) {
	return await request(`${URL_BASE}/vehiculos`, {
		method: 'POST',
		body: JSON.stringify(vehiculo)
	});
}

export async function aprobarVehiculo(id) {
	return await request(`${URL_BASE}/vehiculos/${id}/aprobar`, {
		method: 'PUT'
	});
}

export async function obtenerSolicitudes() {
	return await request(`${URL_BASE}/solicitudes`);
}

export async function crearSolicitud(solicitud) {
	return await request(`${URL_BASE}/solicitudes`, {
		method: 'POST',
		body: JSON.stringify(solicitud)
	});
}

export async function actualizarEstadoSolicitud(id, nuevoEstado, observaciones = null) {
	return await request(`${URL_BASE}/solicitudes/${id}/estado`, {
		method: 'PUT',
		body: JSON.stringify({
			estado_solicitud: nuevoEstado,
			observaciones: observaciones
		})
	});
}
