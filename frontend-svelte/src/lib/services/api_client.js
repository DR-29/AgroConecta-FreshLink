// Helper centralizado para peticiones HTTP a FastAPI y Express
const TOKEN_KEY = 'agroconecta_token';
const USER_KEY = 'agroconecta_user';

export function getStoredToken() {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
	if (typeof window === 'undefined') return null;
	const user = localStorage.getItem(USER_KEY);
	return user ? JSON.parse(user) : null;
}

export function setSession(token, user) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}

export async function request(url, options = {}) {
	const headers = {
		'Content-Type': 'application/json',
		...(options.headers || {})
	};

	const token = getStoredToken();
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(url, {
		...options,
		headers
	});

	if (!response.ok) {
		let errorMessage = `Error ${response.status}: ${response.statusText}`;
		try {
			const errData = await response.json();
			if (errData && errData.detail) {
				errorMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
			} else if (errData && errData.error) {
				errorMessage = errData.error;
			}
		} catch (e) {
			// No se pudo parsear JSON
		}
		throw new Error(errorMessage);
	}

	// 204 No Content
	if (response.status === 204) return null;

	return await response.json();
}
