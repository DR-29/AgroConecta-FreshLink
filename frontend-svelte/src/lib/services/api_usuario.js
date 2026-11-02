import { request } from './api_client.js';

const URL_BASE = '/api/v1/usuarios';

export async function obtenerUsuarios() {
	return await request(`${URL_BASE}/`);
}

export async function obtenerUsuarioPorId(id) {
	return await request(`${URL_BASE}/${id}`);
}

export async function actualizarUsuario(id, usuario) {
	return await request(`${URL_BASE}/${id}`, {
		method: 'PUT',
		body: JSON.stringify(usuario)
	});
}

export async function eliminarUsuario(id) {
	return await request(`${URL_BASE}/${id}`, {
		method: 'DELETE'
	});
}
