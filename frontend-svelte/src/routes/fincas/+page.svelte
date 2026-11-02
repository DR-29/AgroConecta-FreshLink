<script>
	import { onMount } from 'svelte';
	import { obtenerFincas, crearFinca, actualizarFinca, eliminarFinca } from '$lib/services/api_finca.js';
	import { getStoredUser } from '$lib/services/api_auth.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import BadgeEstado from '$lib/components/BadgeEstado.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let fincas = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';
	let usuario = null;

	// Formulario reactivo (Cero campos ID)
	let nombre = '';
	let departamento = '';
	let municipio = '';
	let vereda = '';
	let area_hectareas = '';

	// Estado para modo Edición vs Creación (Siguiendo la Guía Parte 7 del Docente)
	let idEditando = null;

	onMount(async () => {
		usuario = getStoredUser();
		await cargarFincas();
	});

	async function cargarFincas() {
		cargando = true;
		try {
			fincas = await obtenerFincas();
		} catch (error) {
			mensaje = 'Error al cargar fincas: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	function limpiarFormulario() {
		nombre = '';
		departamento = '';
		municipio = '';
		vereda = '';
		area_hectareas = '';
		idEditando = null;
	}

	function prepararEdicion(finca) {
		idEditando = finca.id_finca;
		nombre = finca.nombre;
		departamento = finca.departamento;
		municipio = finca.municipio;
		vereda = finca.vereda || '';
		area_hectareas = finca.area_hectareas || '';
		mensaje = '';

		// Scroll suave al formulario
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function guardarFinca(event) {
		event.preventDefault();
		mensaje = '';

		const datos = {
			nombre,
			departamento,
			municipio,
			vereda: vereda || null,
			area_hectareas: area_hectareas ? Number(area_hectareas) : null
		};

		try {
			if (idEditando === null) {
				await crearFinca(datos);
				mensaje = `Finca "${nombre}" registrada exitosamente.`;
				tipoMensaje = 'success';
			} else {
				await actualizarFinca(idEditando, datos);
				mensaje = `Finca "${nombre}" actualizada exitosamente.`;
				tipoMensaje = 'success';
			}
			limpiarFormulario();
			await cargarFincas();
		} catch (error) {
			mensaje = 'No se pudo guardar: ' + error.message;
			tipoMensaje = 'danger';
		}
	}

	async function borrarFinca(finca) {
		const seguro = confirm(`¿Está seguro de cambiar el estado de la finca "${finca.nombre}" a inactivo (borrado lógico)?`);
		if (!seguro) return;

		try {
			await eliminarFinca(finca.id_finca);
			mensaje = `Finca "${finca.nombre}" marcada como inactiva (estado = 0).`;
			tipoMensaje = 'warning';
			if (idEditando === finca.id_finca) {
				limpiarFormulario();
			}
			await cargarFincas();
		} catch (error) {
			mensaje = 'Error al eliminar finca: ' + error.message;
			tipoMensaje = 'danger';
		}
	}
</script>

<Header
	titulo="Gestión de Fincas y Parcelas"
	subtitulo="Registro y administración de unidades productivas agrícolas"
	icono="bi-geo-alt"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarFincas} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<div class="row g-4">
	<!-- Formulario Reactivo Único (Crear / Editar) -->
	<div class="col-lg-4">
		<Card
			titulo={idEditando === null ? 'Registrar Nueva Finca' : 'Editar Información de Finca'}
			subtitulo="Información técnica y ubicación"
		>
			<form on:submit={guardarFinca}>
				<div class="mb-3">
					<label for="nombre" class="form-label fw-semibold">Nombre de la Finca *</label>
					<input
						type="text"
						id="nombre"
						class="form-control"
						placeholder="Ej. Finca La Primavera"
						bind:value={nombre}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="departamento" class="form-label fw-semibold">Departamento *</label>
					<input
						type="text"
						id="departamento"
						class="form-control"
						placeholder="Ej. Cundinamarca"
						bind:value={departamento}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="municipio" class="form-label fw-semibold">Municipio *</label>
					<input
						type="text"
						id="municipio"
						class="form-control"
						placeholder="Ej. Fusagasugá"
						bind:value={municipio}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="vereda" class="form-label fw-semibold">Vereda / Sector</label>
					<input
						type="text"
						id="vereda"
						class="form-control"
						placeholder="Ej. El Porvenir"
						bind:value={vereda}
					/>
				</div>

				<div class="mb-3">
					<label for="area" class="form-label fw-semibold">Área en Hectáreas</label>
					<input
						type="number"
						step="0.1"
						min="0"
						id="area"
						class="form-control"
						placeholder="Ej. 5.5"
						bind:value={area_hectareas}
					/>
				</div>

				<div class="d-grid gap-2">
					<button type="submit" class="btn {idEditando === null ? 'btn-success' : 'btn-primary'} py-2 fw-semibold">
						<i class="bi {idEditando === null ? 'bi-plus-circle' : 'bi-check2-circle'} me-1"></i>
						{idEditando === null ? 'Registrar Finca' : 'Guardar Cambios'}
					</button>

					{#if idEditando !== null}
						<button type="button" class="btn btn-outline-secondary" on:click={limpiarFormulario}>
							Cancelar Edición
						</button>
					{/if}
				</div>
			</form>
		</Card>
	</div>

	<!-- Tabla con DataTable (Búsqueda en vivo + Paginación, CERO IDs visibles) -->
	<div class="col-lg-8">
		<Card titulo="Listado de Fincas Registradas" subtitulo="Visualización ordenada de predios activos">
			{#if cargando}
				<div class="text-center py-5">
					<div class="spinner-border text-success" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Cargando fincas desde la base de datos...</p>
				</div>
			{:else}
				<DataTable
					items={fincas}
					searchFields={['nombre', 'departamento', 'municipio', 'vereda']}
					placeholder="Buscar por finca, municipio o vereda..."
					pageSize={5}
				>
					<tr slot="header">
						<th>Finca</th>
						<th>Ubicación</th>
						<th>Área</th>
						<th>Estado</th>
						<th class="text-end">Acciones</th>
					</tr>

					<tr slot="row" let:item>
						<td>
							<strong>{item.nombre}</strong>
						</td>
						<td>
							<div>{item.municipio}, {item.departamento}</div>
							{#if item.vereda}
								<small class="text-muted"><i class="bi bi-geo-alt"></i> Vereda {item.vereda}</small>
							{/if}
						</td>
						<td>
							{item.area_hectareas ? `${item.area_hectareas} Ha` : 'No especificada'}
						</td>
						<td>
							<BadgeEstado estado={item.estado} />
						</td>
						<td class="text-end">
							<div class="btn-group btn-group-sm">
								<button
									class="btn btn-outline-primary"
									title="Editar Finca"
									on:click={() => prepararEdicion(item)}
								>
									<i class="bi bi-pencil"></i>
								</button>
								<button
									class="btn btn-outline-danger"
									title="Eliminar (Borrado Lógico)"
									on:click={() => borrarFinca(item)}
								>
									<i class="bi bi-trash"></i>
								</button>
							</div>
						</td>
					</tr>
				</DataTable>
			{/if}
		</Card>
	</div>
</div>
