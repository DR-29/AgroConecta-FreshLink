<script>
	import { onMount } from 'svelte';
	import { obtenerVehiculos, crearVehiculo, aprobarVehiculo, obtenerSolicitudes } from '$lib/services/api_logistica.js';
	import { getStoredUser } from '$lib/services/api_auth.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import BadgeEstado from '$lib/components/BadgeEstado.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let vehiculos = [];
	let solicitudes = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';
	let usuario = null;

	// Formulario de Vehículo
	let placa = '';
	let modelo = '';
	let capacidad_toneladas = '';
	let tipo_carroceria = 'FURGON';

	onMount(async () => {
		usuario = getStoredUser();
		await cargarDatos();
	});

	async function cargarDatos() {
		cargando = true;
		try {
			[vehiculos, solicitudes] = await Promise.all([obtenerVehiculos(false), obtenerSolicitudes()]);
		} catch (error) {
			mensaje = 'Error al cargar logística: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	async function handleRegistrarVehiculo(event) {
		event.preventDefault();
		mensaje = '';

		const nuevo = {
			placa: placa.toUpperCase().trim(),
			modelo,
			capacidad_toneladas: Number(capacidad_toneladas),
			tipo_carroceria
		};

		try {
			await crearVehiculo(nuevo);
			mensaje = `Vehículo placa ${nuevo.placa} registrado. Queda pendiente de aprobación administrativa.`;
			tipoMensaje = 'success';
			placa = '';
			modelo = '';
			capacidad_toneladas = '';
			await cargarDatos();
		} catch (error) {
			mensaje = 'Error al registrar vehículo: ' + error.message;
			tipoMensaje = 'danger';
		}
	}

	async function handleAprobar(vehiculo) {
		try {
			await aprobarVehiculo(vehiculo.id_vehiculo);
			mensaje = `Vehículo placa ${vehiculo.placa} aprobado exitosamente para fletes.`;
			tipoMensaje = 'success';
			await cargarDatos();
		} catch (error) {
			mensaje = 'Error al aprobar vehículo: ' + error.message;
			tipoMensaje = 'danger';
		}
	}
</script>

<Header
	titulo="Gestión Logística y Transporte"
	subtitulo="Control de flota vehicular rural y solicitudes de flete"
	icono="bi-truck"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarDatos} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<div class="row g-4">
	<!-- Formulario de Vehículo (Transportista) -->
	<div class="col-lg-4">
		<Card titulo="Registrar Vehículo de Carga" subtitulo="Postulación para transporte">
			<form on:submit={handleRegistrarVehiculo}>
				<div class="mb-3">
					<label for="placa" class="form-label fw-semibold">Número de Placa *</label>
					<input
						type="text"
						id="placa"
						class="form-control text-uppercase"
						placeholder="Ej. WFL345"
						maxlength="10"
						bind:value={placa}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="modelo" class="form-label fw-semibold">Marca y Modelo *</label>
					<input
						type="text"
						id="modelo"
						class="form-control"
						placeholder="Ej. Chevrolet NHR 2022"
						bind:value={modelo}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="cap" class="form-label fw-semibold">Capacidad en Toneladas *</label>
					<input
						type="number"
						step="0.1"
						min="0.5"
						id="cap"
						class="form-control"
						placeholder="Ej. 2.5"
						bind:value={capacidad_toneladas}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="carroceria" class="form-label fw-semibold">Tipo de Carrocería</label>
					<select id="carroceria" class="form-select" bind:value={tipo_carroceria}>
						<option value="FURGON">Furgón Cerrado (Protección)</option>
						<option value="ESTACAS">Estacas (Ventilación)</option>
						<option value="REFRIGERADO">Refrigerado (Perecederos)</option>
						<option value="PLATAFORMA">Plataforma Plana</option>
					</select>
				</div>

				<button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
					<i class="bi bi-plus-circle me-1"></i> Postular Vehículo
				</button>
			</form>
		</Card>
	</div>

	<!-- Tabla de Vehículos -->
	<div class="col-lg-8">
		<Card titulo="Flota Vehicular Registrada" subtitulo="Estado de autorización y capacidad">
			{#if cargando}
				<div class="text-center py-5">
					<div class="spinner-border text-success" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Consultando vehículos...</p>
				</div>
			{:else}
				<DataTable
					items={vehiculos}
					searchFields={['placa', 'modelo', 'tipo_carroceria']}
					placeholder="Buscar por placa o modelo..."
					pageSize={5}
				>
					<tr slot="header">
						<th>Placa</th>
						<th>Vehículo</th>
						<th>Capacidad</th>
						<th>Carrocería</th>
						<th>Aprobación</th>
						<th class="text-end">Acción Admin</th>
					</tr>

					<tr slot="row" let:item>
						<td>
							<strong class="text-dark bg-warning-subtle px-2 py-1 rounded border">
								{item.placa}
							</strong>
						</td>
						<td>{item.modelo}</td>
						<td>
							<strong>{item.capacidad_toneladas}</strong> Ton
						</td>
						<td>
							<span class="badge bg-light text-secondary border">
								{item.tipo_carroceria}
							</span>
						</td>
						<td>
							{#if item.aprobado_admin}
								<span class="badge bg-success-subtle text-success border border-success-subtle">
									<i class="bi bi-shield-check me-1"></i> Aprobado
								</span>
							{:else}
								<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
									<i class="bi bi-clock me-1"></i> Pendiente
								</span>
							{/if}
						</td>
						<td class="text-end">
							{#if !item.aprobado_admin}
								<button
									class="btn btn-sm btn-outline-success"
									title="Aprobar Vehículo"
									on:click={() => handleAprobar(item)}
								>
									<i class="bi bi-check-lg me-1"></i> Aprobar
								</button>
							{:else}
								<small class="text-muted">Autorizado</small>
							{/if}
						</td>
					</tr>
				</DataTable>
			{/if}
		</Card>
	</div>
</div>
