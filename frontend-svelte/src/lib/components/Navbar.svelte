<script>
	import { onMount } from 'svelte';
	import { getStoredUser, logout } from '$lib/services/api_auth.js';
	import { obtenerModulosAutorizados } from '$lib/services/api_seguridad.js';

	let usuario = null;
	let modulos = [];
	let cargandoModulos = true;

	onMount(async () => {
		usuario = getStoredUser();
		if (usuario) {
			try {
				const idRol = usuario.id_rol || (usuario.rol === 'ADMINISTRADOR' ? 1 : usuario.rol === 'PRODUCTOR' ? 2 : usuario.rol === 'TIENDA' ? 3 : 4);
				modulos = await obtenerModulosAutorizados(idRol);
			} catch (e) {
				console.error('Error cargando módulos de navegación:', e);
			} finally {
				cargandoModulos = false;
			}
		} else {
			cargandoModulos = false;
		}
	});

	function cerrarSesion() {
		logout();
		window.location.href = '/login';
	}
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
	<div class="container-fluid px-4">
		<a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/">
			<i class="bi bi-tree-fill fs-4"></i>
			<span>AgroConecta</span>
		</a>

		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarContenido"
			aria-controls="navbarContenido"
			aria-expanded="false"
			aria-label="Alternar navegación"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarContenido">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link" href="/">
						<i class="bi bi-house-door me-1"></i> Inicio
					</a>
				</li>

				{#if usuario && modulos.length > 0}
					{#each modulos as mod}
						<li class="nav-item">
							<a class="nav-link text-capitalize" href={mod.ruta}>
								{#if mod.codigo === 'MOD_FINCAS'}
									<i class="bi bi-geo-alt me-1"></i>
								{:else if mod.codigo === 'MOD_CATALOGO'}
									<i class="bi bi-basket me-1"></i>
								{:else if mod.codigo === 'MOD_PEDIDOS'}
									<i class="bi bi-receipt me-1"></i>
								{:else if mod.codigo === 'MOD_LOGISTICA'}
									<i class="bi bi-truck me-1"></i>
								{:else if mod.codigo === 'MOD_CALIDAD'}
									<i class="bi bi-star me-1"></i>
								{:else if mod.codigo === 'MOD_SEGURIDAD'}
									<i class="bi bi-shield-lock me-1"></i>
								{:else}
									<i class="bi bi-folder me-1"></i>
								{/if}
								{mod.nombre}
							</a>
						</li>
					{/each}

					<li class="nav-item">
						<a class="nav-link" href="/pagos">
							<i class="bi bi-credit-card me-1"></i> Pagos y Facturas
						</a>
					</li>
				{/if}
			</ul>

			<div class="d-flex align-items-center gap-3">
				{#if usuario}
					<div class="text-white text-end d-none d-md-block">
						<div class="fw-semibold small">{usuario.nombres} {usuario.apellidos}</div>
						<span class="badge bg-light text-success fw-bold">{usuario.rol}</span>
					</div>
					<button class="btn btn-outline-light btn-sm" on:click={cerrarSesion}>
						<i class="bi bi-box-arrow-right me-1"></i> Salir
					</button>
				{:else}
					<a href="/login" class="btn btn-light btn-sm fw-semibold text-success">
						<i class="bi bi-person me-1"></i> Iniciar Sesión
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

<style>
	.navbar-brand {
		letter-spacing: 0.5px;
	}
	.nav-link {
		font-weight: 500;
		transition: opacity 0.2s ease;
	}
	.nav-link:hover {
		opacity: 0.9;
	}
</style>
