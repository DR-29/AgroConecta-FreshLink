<script>
	import { login } from '$lib/services/api_auth.js';
	import Card from '$lib/components/Card.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let correo = '';
	let contrasena = '';
	let cargando = false;
	let mensajeError = '';
	let mensajeExito = '';

	async function handleSubmit(event) {
		if (event) event.preventDefault();
		mensajeError = '';
		mensajeExito = '';
		cargando = true;

		try {
			const usuario = await login(correo, contrasena);
			mensajeExito = `¡Bienvenido, ${usuario.nombres}! Redirigiendo...`;
			setTimeout(() => {
				window.location.href = '/';
			}, 600);
		} catch (error) {
			mensajeError = error.message || 'Error al iniciar sesión';
		} finally {
			cargando = false;
		}
	}

	function autocompletar(email, pass = 'Password123*') {
		correo = email;
		contrasena = pass;
		handleSubmit();
	}
</script>

<div class="row justify-content-center py-4">
	<div class="col-md-6 col-lg-5">
		<Card titulo="Iniciar Sesión" subtitulo="Acceso a la plataforma AgroConecta">
			<AlertMessage mensaje={mensajeError} tipo="danger" />
			<AlertMessage mensaje={mensajeExito} tipo="success" />

			<form on:submit={handleSubmit}>
				<div class="mb-3">
					<label for="correo" class="form-label fw-semibold">Correo Electrónico</label>
					<div class="input-group">
						<span class="input-group-text bg-white"><i class="bi bi-envelope"></i></span>
						<input
							type="email"
							class="form-control"
							id="correo"
							placeholder="ejemplo@agroconecta.com"
							bind:value={correo}
							required
						/>
					</div>
				</div>

				<div class="mb-4">
					<label for="contrasena" class="form-label fw-semibold">Contraseña</label>
					<div class="input-group">
						<span class="input-group-text bg-white"><i class="bi bi-lock"></i></span>
						<input
							type="password"
							class="form-control"
							id="contrasena"
							placeholder="••••••••"
							bind:value={contrasena}
							required
						/>
					</div>
				</div>

				<button type="submit" class="btn btn-success w-100 py-2 fw-semibold" disabled={cargando}>
					{#if cargando}
						<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
						Autenticando...
					{:else}
						<i class="bi bi-box-arrow-in-right me-1"></i> Ingresar
					{/if}
				</button>
			</form>

			<hr class="my-4" />

			<div class="text-center">
				<p class="small text-muted fw-semibold mb-2">Cuentas de demostración:</p>
				<div class="d-grid gap-2">
					<button
						type="button"
						class="btn btn-outline-success btn-sm text-start"
						on:click={() => autocompletar('carlos.productor@agroconecta.com')}
					>
						<i class="bi bi-person-fill me-1"></i> Rol <strong>PRODUCTOR</strong> (Carlos Pérez)
					</button>

					<button
						type="button"
						class="btn btn-outline-primary btn-sm text-start"
						on:click={() => autocompletar('maria.tienda@agroconecta.com')}
					>
						<i class="bi bi-shop me-1"></i> Rol <strong>TIENDA</strong> (María Restrepo)
					</button>

					<button
						type="button"
						class="btn btn-outline-info btn-sm text-start text-dark"
						on:click={() => autocompletar('jorge.transporte@agroconecta.com')}
					>
						<i class="bi bi-truck me-1"></i> Rol <strong>TRANSPORTISTA</strong> (Jorge García)
					</button>

					<button
						type="button"
						class="btn btn-outline-dark btn-sm text-start"
						on:click={() => autocompletar('admin@agroconecta.com')}
					>
						<i class="bi bi-shield-check me-1"></i> Rol <strong>ADMINISTRADOR</strong> (Admin)
					</button>
				</div>
			</div>
		</Card>
	</div>
</div>
