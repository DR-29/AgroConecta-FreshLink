import { request } from './api_client.js';

const URL_BASE = '/api/v1/fincas';

export async function obtenerFincas() {
	return await request(`${URL_BASE}/`);
}

export async function obtenerFincaPorId(id) {
	return await request(`${URL_BASE}/${id}`);
}

export async function crearFinca(finca) {
	return await request(`${URL_BASE}/`, {
		method: 'POST',
		body: JSON.stringify(finca)
	});
}

export async function actualizarFinca(id, finca) {
	return await request(`${URL_BASE}/${id}`, {
		method: 'PUT',
		body: JSON.stringify(finca)
	});
}

export async function eliminarFinca(id) {
	return await request(`${URL_BASE}/${id}`, {
		method: 'DELETE'
	});
}
