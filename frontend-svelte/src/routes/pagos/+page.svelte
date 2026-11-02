<script>
	import { onMount } from 'svelte';
	import { obtenerMetodosPago, obtenerTransacciones, crearTransaccion, obtenerFacturas } from '$lib/services/api_pagos.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import BadgeEstado from '$lib/components/BadgeEstado.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let metodos = [];
	let transacciones = [];
	let facturas = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';

	// Formulario de Transacción
	let id_metodo_pago = '';
	let monto = '';
	let codigo_referencia = '';
	let observaciones = 'Pago contra entrega verificado';

	onMount(async () => {
		await cargarDatos();
	});

	async function cargarDatos() {
		cargando = true;
		try {
			[metodos, transacciones, facturas] = await Promise.all([
				obtenerMetodosPago().catch(() => []),
				obtenerTransacciones().catch(() => []),
				obtenerFacturas().catch(() => [])
			]);
			if (metodos.length > 0 && !id_metodo_pago) {
				id_metodo_pago = metodos[0].id_metodo_pago;
			}
		} catch (error) {
			mensaje = 'Error al consultar API Express/MySQL: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	async function handleCrearTransaccion(event) {
		event.preventDefault();
		mensaje = '';

		const nueva = {
			id_metodo_pago: Number(id_metodo_pago),
			monto: Number(monto),
			codigo_referencia: codigo_referencia || `REF-${Date.now().toString().slice(-6)}`,
			observaciones
		};

		try {
			await crearTransaccion(nueva);
			mensaje = `Transacción registrada en la base de datos auxiliar MySQL.`;
			tipoMensaje = 'success';
			monto = '';
			codigo_referencia = '';
			await cargarDatos();
		} catch (error) {
			mensaje = 'Error al registrar pago en Express: ' + error.message;
			tipoMensaje = 'danger';
		}
	}
</script>

<Header
	titulo="Microservicio de Pagos y Facturación"
	subtitulo="Integración con la API Auxiliar en Express.js y base de datos MySQL"
	icono="bi-credit-card-2-front"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarDatos} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<div class="row g-4">
	<!-- Formulario de Pago (Express) -->
	<div class="col-lg-4">
		<Card titulo="Registrar Transacción" subtitulo="Procesamiento en MySQL">
			<form on:submit={handleCrearTransaccion}>
				<div class="mb-3">
					<label for="metodoSelect" class="form-label fw-semibold">Método de Pago *</label>
					<select id="metodoSelect" class="form-select" bind:value={id_metodo_pago} required>
						{#each metodos as m}
							<option value={m.id_metodo_pago}>{m.nombre}</option>
						{/each}
					</select>
				</div>

				<div class="mb-3">
					<label for="monto" class="form-label fw-semibold">Monto a Facturar ($) *</label>
					<input
						type="number"
						min="1000"
						id="monto"
						class="form-control"
						placeholder="150000"
						bind:value={monto}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="ref" class="form-label fw-semibold">Código de Referencia / Voucher</label>
					<input
						type="text"
						id="ref"
						class="form-control"
						placeholder="Autogenerado si se deja vacío"
						bind:value={codigo_referencia}
					/>
				</div>

				<div class="mb-3">
					<label for="obs" class="form-label fw-semibold">Observaciones</label>
					<textarea
						id="obs"
						class="form-control"
						rows="2"
						bind:value={observaciones}
					></textarea>
				</div>

				<button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
					<i class="bi bi-cash-coin me-1"></i> Confirmar Pago
				</button>
			</form>
		</Card>
	</div>

	<!-- Listado de Transacciones en MySQL -->
	<div class="col-lg-8">
		<Card titulo="Historial de Transacciones Registradas" subtitulo="Base de datos auxiliar MySQL">
			{#if cargando}
				<div class="text-center py-5">
					<div class="spinner-border text-success" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Consultando microservicio Express...</p>
				</div>
			{:else}
				<DataTable
					items={transacciones}
					searchFields={['codigo_referencia', 'observaciones', 'estado_transaccion']}
					placeholder="Buscar por referencia o estado..."
					pageSize={5}
				>
					<tr slot="header">
						<th>Referencia</th>
						<th>Monto</th>
						<th>Estado</th>
						<th>Fecha</th>
					</tr>

					<tr slot="row" let:item>
						<td>
							<strong>{item.codigo_referencia || 'SIN-REF'}</strong>
							{#if item.observaciones}
								<div class="small text-muted">{item.observaciones}</div>
							{/if}
						</td>
						<td>
							<span class="fw-bold text-success">
								${Number(item.monto).toLocaleString()}
							</span>
						</td>
						<td>
							<BadgeEstado estado={item.estado_transaccion || item.estado} />
						</td>
						<td>
							<small class="text-muted">
								{new Date(item.creado).toLocaleDateString()} {new Date(item.creado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</small>
						</td>
					</tr>
				</DataTable>
			{/if}
		</Card>
	</div>
</div>
