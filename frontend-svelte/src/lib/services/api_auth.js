import { request, setSession, clearSession, getStoredUser } from './api_client.js';

const URL_AUTH = '/api/v1/auth';

export async function login(correo, contrasena) {
	const data = await request(`${URL_AUTH}/login-json`, {
		method: 'POST',
		body: JSON.stringify({ correo, contrasena })
	});

	if (data && data.access_token) {
		const user = {
			id_usuario: data.id_usuario,
			correo: data.correo,
			nombres: data.nombres,
			apellidos: data.apellidos,
			rol: data.rol
		};
		setSession(data.access_token, user);
		return user;
	}
	throw new Error('Respuesta de autenticación inválida');
}

export async function register(userData) {
	return await request(`${URL_AUTH}/register`, {
		method: 'POST',
		body: JSON.stringify(userData)
	});
}

export async function getMe() {
	return await request(`${URL_AUTH}/me`);
}

export function logout() {
	clearSession();
}

export { getStoredUser };
