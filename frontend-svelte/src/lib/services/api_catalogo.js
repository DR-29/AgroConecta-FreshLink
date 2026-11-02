import { request } from './api_client.js';

const URL_BASE = '/api/v1/catalogo';

export async function obtenerCategorias() {
	return await request(`${URL_BASE}/categorias`);
}

export async function obtenerProductos(params = {}) {
	const query = new URLSearchParams();
	if (params.id_categoria) query.append('id_categoria', params.id_categoria);
	if (params.id_finca) query.append('id_finca', params.id_finca);
	if (params.buscar) query.append('buscar', params.buscar);
	if (params.solo_con_stock !== undefined) query.append('solo_con_stock', params.solo_con_stock);

	const qs = query.toString();
	return await request(`${URL_BASE}/productos${qs ? `?${qs}` : ''}`);
}

export async function obtenerProductoPorId(id) {
	return await request(`${URL_BASE}/productos/${id}`);
}

export async function crearProducto(producto) {
	return await request(`${URL_BASE}/productos`, {
		method: 'POST',
		body: JSON.stringify(producto)
	});
}

export async function actualizarProducto(id, producto) {
	return await request(`${URL_BASE}/productos/${id}`, {
		method: 'PUT',
		body: JSON.stringify(producto)
	});
}

export async function actualizarStock(id, stock) {
	return await request(`${URL_BASE}/productos/${id}/stock`, {
		method: 'PATCH',
		body: JSON.stringify({ stock_disponible: stock })
	});
}

export async function eliminarProducto(id) {
	return await request(`${URL_BASE}/productos/${id}`, {
		method: 'DELETE'
	});
}
