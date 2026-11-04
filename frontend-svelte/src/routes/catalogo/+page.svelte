<script>
	import { onMount } from 'svelte';
	import {
		obtenerProductos,
		obtenerCategorias,
		crearProducto,
		actualizarProducto,
		actualizarStock,
		eliminarProducto
	} from '$lib/services/api_catalogo.js';
	import { obtenerFincas } from '$lib/services/api_finca.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import BadgeEstado from '$lib/components/BadgeEstado.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let productos = [];
	let categorias = [];
	let fincas = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';

	let id_finca = '';
	let id_categoria = '';
	let nombre = '';
	let descripcion = '';
	let unidad_medida = 'KG';
	let precio_unitario = '';
	let stock_disponible = '';

	let idEditando = null;

	onMount(async () => {
		await Promise.all([cargarDatos(), cargarListasApoyo()]);
	});

	async function cargarDatos() {
		cargando = true;
		try {
			productos = await obtenerProductos();
		} catch (error) {
			mensaje = 'Error al cargar catálogo: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	async function cargarListasApoyo() {
		try {
			[categorias, fincas] = await Promise.all([obtenerCategorias(), obtenerFincas()]);
			if (categorias.length > 0 && !id_categoria) id_categoria = categorias[0].id_categoria;
			if (fincas.length > 0 && !id_finca) id_finca = fincas[0].id_finca;
		} catch (e) {
			console.error('Error cargando listas de apoyo:', e);
		}
	}

	function limpiarFormulario() {
		nombre = '';
		descripcion = '';
		unidad_medida = 'KG';
		precio_unitario = '';
		stock_disponible = '';
		idEditando = null;
		if (categorias.length > 0) id_categoria = categorias[0].id_categoria;
		if (fincas.length > 0) id_finca = fincas[0].id_finca;
	}

	function prepararEdicion(item) {
		idEditando = item.id_producto;
		id_finca = item.id_finca;
		id_categoria = item.id_categoria;
		nombre = item.nombre;
		descripcion = item.descripcion || '';
		unidad_medida = item.unidad_medida || 'KG';
		precio_unitario = item.precio_unitario;
		stock_disponible = item.stock_disponible;
		mensaje = '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function guardarProducto(event) {
		event.preventDefault();
		mensaje = '';

		const datos = {
			id_finca: Number(id_finca),
			id_categoria: Number(id_categoria),
			nombre,
			descripcion: descripcion || null,
			unidad_medida,
			precio_unitario: Number(precio_unitario),
			stock_disponible: Number(stock_disponible)
		};

		try {
			if (idEditando === null) {
				await crearProducto(datos);
				mensaje = `Cosecha "${nombre}" publicada en el catálogo.`;
				tipoMensaje = 'success';
			} else {
				await actualizarProducto(idEditando, datos);
				mensaje = `Cosecha "${nombre}" actualizada.`;
				tipoMensaje = 'success';
			}
			limpiarFormulario();
			await cargarDatos();
		} catch (error) {
			mensaje = 'No se pudo guardar: ' + error.message;
			tipoMensaje = 'danger';
		}
	}

	async function cambiarStock(item) {
		const nuevo = prompt(`Actualizar stock disponible para "${item.nombre}" (${item.unidad_medida}):`, item.stock_disponible);
		if (nuevo === null || isNaN(Number(nuevo))) return;

		try {
			await actualizarStock(item.id_producto, Number(nuevo));
			mensaje = `Stock de "${item.nombre}" actualizado a ${nuevo} ${item.unidad_medida}.`;
			tipoMensaje = 'success';
			await cargarDatos();
		} catch (e) {
			mensaje = 'Error al actualizar stock: ' + e.message;
			tipoMensaje = 'danger';
		}
	}

	async function borrarProducto(item) {
		const seguro = confirm(`¿Desea dar de baja la cosecha "${item.nombre}" del catálogo (borrado lógico)?`);
		if (!seguro) return;

		try {
			await eliminarProducto(item.id_producto);
			mensaje = `Cosecha "${item.nombre}" desactivada (estado = 0).`;
			tipoMensaje = 'warning';
			await cargarDatos();
		} catch (e) {
			mensaje = 'Error al eliminar: ' + e.message;
			tipoMensaje = 'danger';
		}
	}

	function nombreCategoria(idCat) {
		const cat = categorias.find((c) => c.id_categoria === idCat);
		return cat ? cat.nombre : 'General';
	}

	function nombreFinca(idF) {
		const f = fincas.find((item) => item.id_finca === idF);
		return f ? f.nombre : 'Finca Productor';
	}
</script>

<Header
	titulo="Catálogo de Productos y Cosechas"
	subtitulo="Publicación, precios por unidad y control de inventario en tiempo real"
	icono="bi-basket"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarDatos} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<div class="row g-4">
	<div class="col-lg-4">
		<Card
			titulo={idEditando === null ? 'Publicar Nueva Cosecha' : 'Editar Producto'}
			subtitulo="Información comercial para tiendas"
		>
			<form on:submit={guardarProducto}>
				<div class="mb-3">
					<label for="nombre" class="form-label fw-semibold">Nombre del Producto *</label>
					<input
						type="text"
						id="nombre"
						class="form-control"
						placeholder="Ej. Tomate Chonto"
						bind:value={nombre}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="fincaSelect" class="form-label fw-semibold">Finca de Origen *</label>
					<select id="fincaSelect" class="form-select" bind:value={id_finca} required>
						{#each fincas as f}
							<option value={f.id_finca}>{f.nombre} ({f.municipio})</option>
						{/each}
					</select>
					<small class="text-muted">Se asocia por nombre sin requerir código ID.</small>
				</div>

				<div class="mb-3">
					<label for="categoriaSelect" class="form-label fw-semibold">Categoría *</label>
					<select id="categoriaSelect" class="form-select" bind:value={id_categoria} required>
						{#each categorias as c}
							<option value={c.id_categoria}>{c.nombre}</option>
						{/each}
					</select>
				</div>

				<div class="row g-2 mb-3">
					<div class="col-6">
						<label for="precio" class="form-label fw-semibold">Precio Unitario ($) *</label>
						<input
							type="number"
							min="0"
							id="precio"
							class="form-control"
							placeholder="3500"
							bind:value={precio_unitario}
							required
						/>
					</div>
					<div class="col-6">
						<label for="unidad" class="form-label fw-semibold">Unidad Medida *</label>
						<select id="unidad" class="form-select" bind:value={unidad_medida}>
							<option value="KG">Kilogramo (KG)</option>
							<option value="BULTO">Bulto (50kg)</option>
							<option value="CANASTILLA">Canastilla</option>
							<option value="LIBRA">Libra</option>
							<option value="UNIDAD">Unidad</option>
						</select>
					</div>
				</div>

				<div class="mb-3">
					<label for="stock" class="form-label fw-semibold">Stock Inicial Disponible *</label>
					<input
						type="number"
						min="0"
						id="stock"
						class="form-control"
						placeholder="500"
						bind:value={stock_disponible}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="descripcion" class="form-label fw-semibold">Descripción / Calidad</label>
					<textarea
						id="descripcion"
						class="form-control"
						rows="2"
						placeholder="Cosecha de primera selección orgánica..."
						bind:value={descripcion}
					></textarea>
				</div>

				<div class="d-grid gap-2">
					<button type="submit" class="btn {idEditando === null ? 'btn-success' : 'btn-primary'} py-2 fw-semibold">
						<i class="bi {idEditando === null ? 'bi-plus-circle' : 'bi-check2-circle'} me-1"></i>
						{idEditando === null ? 'Publicar Cosecha' : 'Guardar Cambios'}
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

	<div class="col-lg-8">
		<Card titulo="Catálogo Disponible para Comercios" subtitulo="Productos con stock actualizado">
			{#if cargando}
				<div class="text-center py-5">
					<div class="spinner-border text-success" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Consultando cosechas en la base de datos...</p>
				</div>
			{:else}
				<DataTable
					items={productos}
					searchFields={['nombre', 'unidad_medida', 'descripcion']}
					placeholder="Buscar por cosecha o término..."
					pageSize={5}
				>
					<tr slot="header">
						<th>Cosecha / Producto</th>
						<th>Categoría</th>
						<th>Finca Origen</th>
						<th>Precio Unitario</th>
						<th>Stock</th>
						<th>Estado</th>
						<th class="text-end">Acciones</th>
					</tr>

					<tr slot="row" let:item>
						<td>
							<strong>{item.nombre}</strong>
							{#if item.descripcion}
								<div class="small text-muted text-truncate" style="max-width: 180px;">
									{item.descripcion}
								</div>
							{/if}
						</td>
						<td>
							<span class="badge bg-light text-dark border">
								{nombreCategoria(item.id_categoria)}
							</span>
						</td>
						<td>
							<small class="text-secondary">
								<i class="bi bi-geo-alt"></i> {nombreFinca(item.id_finca)}
							</small>
						</td>
						<td>
							<span class="text-success fw-bold">
								${Number(item.precio_unitario).toLocaleString()}
							</span>
							<small class="text-muted">/{item.unidad_medida}</small>
						</td>
						<td>
							<span class="badge {item.stock_disponible > 50 ? 'bg-success' : item.stock_disponible > 0 ? 'bg-warning text-dark' : 'bg-danger'}">
								{item.stock_disponible} {item.unidad_medida}
							</span>
						</td>
						<td>
							<BadgeEstado estado={item.estado} />
						</td>
						<td class="text-end">
							<div class="btn-group btn-group-sm">
								<button
									class="btn btn-outline-success"
									title="Actualizar Stock Rápido"
									on:click={() => cambiarStock(item)}
								>
									<i class="bi bi-box-seam"></i>
								</button>
								<button
									class="btn btn-outline-primary"
									title="Editar Producto"
									on:click={() => prepararEdicion(item)}
								>
									<i class="bi bi-pencil"></i>
								</button>
								<button
									class="btn btn-outline-danger"
									title="Eliminar (Borrado Lógico)"
									on:click={() => borrarProducto(item)}
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
