import { request } from './api_client.js';

const URL_BASE = '/api/v1/pedidos';

export async function obtenerPedidos(params = {}) {
	const query = new URLSearchParams();
	if (params.estado_pedido) query.append('estado_pedido', params.estado_pedido);
	if (params.skip !== undefined) query.append('skip', params.skip);
	if (params.limit !== undefined) query.append('limit', params.limit);

	const qs = query.toString();
	return await request(`${URL_BASE}/${qs ? `?${qs}` : ''}`);
}

export async function obtenerPedidoPorId(id) {
	return await request(`${URL_BASE}/${id}`);
}

export async function crearPedido(pedido) {
	return await request(`${URL_BASE}/`, {
		method: 'POST',
		body: JSON.stringify(pedido)
	});
}

export async function actualizarEstadoPedido(id, nuevoEstado, comentario = null) {
	return await request(`${URL_BASE}/${id}/estado`, {
		method: 'PUT',
		body: JSON.stringify({
			estado_pedido: nuevoEstado,
			comentario: comentario
		})
	});
}
