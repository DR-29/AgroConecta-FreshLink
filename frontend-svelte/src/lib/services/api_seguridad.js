import { request } from './api_client.js';

const URL_BASE = '/api/v1/seguridad';

export async function obtenerModulos() {
	return await request(`${URL_BASE}/modulos`);
}

export async function obtenerPermisos(idRol = null) {
	const qs = idRol ? `?id_rol=${idRol}` : '';
	return await request(`${URL_BASE}/permisos${qs}`);
}

/**
 * Consulta la base de datos (tabla rolxmodulo y modulo) para determinar
 * qué módulos tiene autorizados el rol del usuario autenticado.
 */
export async function obtenerModulosAutorizados(idRol) {
	try {
		const [modulos, permisos] = await Promise.all([
			obtenerModulos(),
			obtenerPermisos(idRol)
		]);

		const modulosPermitidos = permisos
			.filter((p) => p.puede_leer && p.estado === 1)
			.map((p) => p.id_modulo);

		return modulos.filter((m) => modulosPermitidos.includes(m.id_modulo) && m.estado === 1);
	} catch (error) {
		console.error('Error cargando módulos autorizados:', error);
		return [];
	}
}
