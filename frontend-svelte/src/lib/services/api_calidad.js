import { request } from './api_client.js';

const URL_BASE = '/api/v1/calificaciones';

export async function obtenerCalificaciones(idCalificado = null) {
	const qs = idCalificado ? `?id_calificado=${idCalificado}` : '';
	return await request(`${URL_BASE}/${qs}`);
}

export async function crearCalificacion(calificacion) {
	return await request(`${URL_BASE}/`, {
		method: 'POST',
		body: JSON.stringify(calificacion)
	});
}
