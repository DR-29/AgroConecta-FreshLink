<script>
	import { onMount } from 'svelte';
	import { obtenerCalificaciones, crearCalificacion } from '$lib/services/api_calidad.js';
	import { obtenerPedidos } from '$lib/services/api_pedido.js';
	import { getStoredUser } from '$lib/services/api_auth.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let calificaciones = [];
	let pedidosEntregados = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';
	let usuario = null;

	// Formulario de Calificación
	let id_pedido = '';
	let id_calificado = '';
	let puntuacion = 5;
	let comentario = 'Excelente cumplimiento y frescura garantizada';

	onMount(async () => {
		usuario = getStoredUser();
		await cargarDatos();
	});

	async function cargarDatos() {
		cargando = true;
		try {
			[calificaciones, pedidosEntregados] = await Promise.all([
				obtenerCalificaciones(),
				obtenerPedidos({ estado_pedido: 'ENTREGADO' }).catch(() => [])
			]);
			if (pedidosEntregados.length > 0 && !id_pedido) {
				id_pedido = pedidosEntregados[0].id_pedido;
			}
		} catch (error) {
			mensaje = 'Error al cargar calificaciones: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	async function handleCalificar(event) {
		event.preventDefault();
		mensaje = '';

		if (!id_pedido) {
			mensaje = 'Debe seleccionar un pedido completado';
			tipoMensaje = 'warning';
			return;
		}

		// Calificar al productor o transportista del pedido
		const nueva = {
			id_pedido: Number(id_pedido),
			id_calificado: 2, // Por defecto califica al productor de la orden (Carlos)
			puntuacion: Number(puntuacion),
			comentario
		};

		try {
			await crearCalificacion(nueva);
			mensaje = '¡Calificación registrada con éxito!';
			tipoMensaje = 'success';
			comentario = '';
			await cargarDatos();
		} catch (error) {
			mensaje = 'No se pudo calificar: ' + error.message;
			tipoMensaje = 'danger';
		}
	}
</script>

<Header
	titulo="Calidad y Reputación del Servicio"
	subtitulo="Evaluaciones verificadas entre tiendas, campesinos y transportistas"
	icono="bi-star"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarDatos} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<div class="row g-4">
	<!-- Formulario para Calificar -->
	<div class="col-lg-4">
		<Card titulo="Emitir Calificación de Servicio" subtitulo="Solo órdenes entregadas">
			<form on:submit={handleCalificar}>
				<div class="mb-3">
					<label for="ordenSelect" class="form-label fw-semibold">Orden Entregada *</label>
					{#if pedidosEntregados.length === 0}
						<div class="alert alert-light border small text-muted">
							No hay pedidos entregados pendientes por calificar en este momento.
						</div>
					{:else}
						<select id="ordenSelect" class="form-select" bind:value={id_pedido} required>
							{#each pedidosEntregados as p}
								<option value={p.id_pedido}>
									{p.codigo_pedido} ({p.municipio_entrega})
								</option>
							{/each}
						</select>
					{/if}
				</div>

				<div class="mb-3">
					<label for="stars" class="form-label fw-semibold">Puntuación (1 a 5 estrellas) *</label>
					<select id="stars" class="form-select" bind:value={puntuacion}>
						<option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas - Excelente)</option>
						<option value={4}>⭐⭐⭐⭐ (4 Estrellas - Muy Bueno)</option>
						<option value={3}>⭐⭐⭐ (3 Estrellas - Aceptable)</option>
						<option value={2}>⭐⭐ (2 Estrellas - Regular)</option>
						<option value={1}>⭐ (1 Estrella - Deficiente)</option>
					</select>
				</div>

				<div class="mb-3">
					<label for="coment" class="form-label fw-semibold">Comentario de Experiencia</label>
					<textarea
						id="coment"
						class="form-control"
						rows="3"
						placeholder="Puntualidad en la entrega, frescura de la cosecha..."
						bind:value={comentario}
						required
					></textarea>
				</div>

				<button
					type="submit"
					class="btn btn-success w-100 py-2 fw-semibold"
					disabled={pedidosEntregados.length === 0}
				>
					<i class="bi bi-star-fill me-1"></i> Enviar Calificación
				</button>
			</form>
		</Card>
	</div>

	<!-- Listado de Calificaciones Públicas -->
	<div class="col-lg-8">
		<Card titulo="Historial de Calificaciones y Reputación" subtitulo="Transparencia pública de servicio">
			{#if cargando}
				<div class="text-center py-5">
					<div class="spinner-border text-success" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Cargando valoraciones...</p>
				</div>
			{:else}
				<DataTable
					items={calificaciones}
					searchFields={['comentario']}
					placeholder="Buscar en comentarios de clientes..."
					pageSize={5}
				>
					<tr slot="header">
						<th>Puntuación</th>
						<th>Opinión / Comentario</th>
						<th>Fecha</th>
					</tr>

					<tr slot="row" let:item>
						<td>
							<div class="text-warning fs-5">
								{#each Array(item.puntuacion || 5) as _}
									★
								{/each}
							</div>
							<span class="badge bg-light text-dark border">
								{item.puntuacion}/5
							</span>
						</td>
						<td>
							<div class="fw-medium text-dark">{item.comentario || 'Sin comentario'}</div>
						</td>
						<td>
							<small class="text-muted">
								{new Date(item.creado).toLocaleDateString()}
							</small>
						</td>
					</tr>
				</DataTable>
			{/if}
		</Card>
	</div>
</div>
