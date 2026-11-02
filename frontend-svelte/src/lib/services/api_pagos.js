import { request } from './api_client.js';

const URL_BASE = '/api/aux';

export async function obtenerMetodosPago() {
	return await request(`${URL_BASE}/metodos-pago`);
}

export async function obtenerTransacciones() {
	return await request(`${URL_BASE}/transacciones`);
}

export async function crearTransaccion(datos) {
	return await request(`${URL_BASE}/transacciones`, {
		method: 'POST',
		body: JSON.stringify(datos)
	});
}

export async function obtenerFacturas() {
	return await request(`${URL_BASE}/facturas`);
}
