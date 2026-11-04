<script>
	import { onMount } from 'svelte';
	import { obtenerPedidos, crearPedido, actualizarEstadoPedido } from '$lib/services/api_pedido.js';
	import { obtenerProductos } from '$lib/services/api_catalogo.js';
	import { getStoredUser } from '$lib/services/api_auth.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import BadgeEstado from '$lib/components/BadgeEstado.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let pedidos = [];
	let productos = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';
	let usuario = null;

	let productoSeleccionado = '';
	let cantidad = 10;
	let direccion_entrega = 'Carrera 7 # 45-12';
	let municipio_entrega = 'Bogotá';
	let notas = 'Entrega en horario matutino';

	onMount(async () => {
		usuario = getStoredUser();
		await Promise.all([cargarPedidos(), cargarProductos()]);
	});

	async function cargarPedidos() {
		cargando = true;
		try {
			pedidos = await obtenerPedidos();
		} catch (error) {
			mensaje = 'Error al cargar pedidos: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	async function cargarProductos() {
		try {
			productos = await obtenerProductos({ solo_con_stock: true });
			if (productos.length > 0 && !productoSeleccionado) {
				productoSeleccionado = productos[0].id_producto;
			}
		} catch (e) {
			console.error('Error cargando productos:', e);
		}
	}

	async function handleCrearPedido(event) {
		event.preventDefault();
		if (!productoSeleccionado) {
			mensaje = 'Debe seleccionar un producto del catálogo';
			tipoMensaje = 'warning';
			return;
		}

		const prod = productos.find((p) => p.id_producto === Number(productoSeleccionado));
		if (!prod) return;

		const nuevoPedido = {
			direccion_entrega,
			municipio_entrega,
			notas,
			items: [
				{
					id_producto: prod.id_producto,
					cantidad: Number(cantidad),
					precio_unitario: Number(prod.precio_unitario)
				}
			]
		};

		try {
			await crearPedido(nuevoPedido);
			mensaje = `¡Orden emitida exitosamente para ${prod.nombre}! Reflejada de inmediato para el productor.`;
			tipoMensaje = 'success';
			await cargarPedidos();
		} catch (error) {
			mensaje = 'Error al emitir orden: ' + error.message;
			tipoMensaje = 'danger';
		}
	}

	async function cambiarEstado(pedido, nuevoEstado) {
		const comentario = prompt(`Cambiar estado del pedido ${pedido.codigo_pedido} a ${nuevoEstado}. Ingrese un comentario de auditoría:`, `Cambio a ${nuevoEstado} por ${usuario?.nombres || 'usuario'}`);
		if (comentario === null) return;

		try {
			await actualizarEstadoPedido(pedido.id_pedido, nuevoEstado, comentario);
			mensaje = `Pedido ${pedido.codigo_pedido} actualizado a ${nuevoEstado}.`;
			tipoMensaje = 'success';
			await cargarPedidos();
		} catch (error) {
			mensaje = 'No se pudo cambiar el estado: ' + error.message;
			tipoMensaje = 'danger';
		}
	}
</script>

<Header
	titulo="Gestión de Pedidos y Trazabilidad"
	subtitulo="Flujo completo de órdenes entre tiendas, campesinos y transportistas"
	icono="bi-receipt"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarPedidos} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<div class="row g-4">
	<div class="col-lg-4">
		<Card titulo="Emitir Orden de Compra" subtitulo="Comercio / Tienda">
			<form on:submit={handleCrearPedido}>
				<div class="mb-3">
					<label for="prodSelect" class="form-label fw-semibold">Cosecha / Producto *</label>
					<select id="prodSelect" class="form-select" bind:value={productoSeleccionado} required>
						{#each productos as p}
							<option value={p.id_producto}>
								{p.nombre} — ${Number(p.precio_unitario).toLocaleString()}/{p.unidad_medida} (Stock: {p.stock_disponible})
							</option>
						{/each}
					</select>
					<small class="text-muted">Selección directa de la cosecha sin requerir ID.</small>
				</div>

				<div class="mb-3">
					<label for="cantidad" class="form-label fw-semibold">Cantidad Requerida *</label>
					<input
						type="number"
						min="1"
						id="cantidad"
						class="form-control"
						bind:value={cantidad}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="dir" class="form-label fw-semibold">Dirección de Entrega en Ciudad *</label>
					<input
						type="text"
						id="dir"
						class="form-control"
						placeholder="Carrera 7 # 45-12, Local 2"
						bind:value={direccion_entrega}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="mun" class="form-label fw-semibold">Ciudad / Municipio *</label>
					<input
						type="text"
						id="mun"
						class="form-control"
						placeholder="Bogotá"
						bind:value={municipio_entrega}
						required
					/>
				</div>

				<div class="mb-3">
					<label for="notas" class="form-label fw-semibold">Instrucciones de Despacho</label>
					<textarea
						id="notas"
						class="form-control"
						rows="2"
						placeholder="Horario de recepción, observaciones..."
						bind:value={notas}
					></textarea>
				</div>

				<button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
					<i class="bi bi-cart-check me-1"></i> Confirmar Pedido
				</button>
			</form>
		</Card>
	</div>

	<div class="col-lg-8">
		<Card titulo="Órdenes Registradas y Seguimiento" subtitulo="Trazabilidad histórica de estados">
			{#if cargando}
				<div class="text-center py-5">
					<div class="spinner-border text-success" role="status">
						<span class="visually-hidden">Cargando...</span>
					</div>
					<p class="text-muted mt-2">Consultando pedidos...</p>
				</div>
			{:else}
				<DataTable
					items={pedidos}
					searchFields={['codigo_pedido', 'municipio_entrega', 'estado_pedido', 'direccion_entrega']}
					placeholder="Buscar por código, destino o estado..."
					pageSize={5}
				>
					<tr slot="header">
						<th>Orden</th>
						<th>Destino</th>
						<th>Total</th>
						<th>Estado</th>
						<th class="text-end">Transición de Estado</th>
					</tr>

					<tr slot="row" let:item>
						<td>
							<strong>{item.codigo_pedido}</strong>
							<div class="small text-muted">
								{new Date(item.creado).toLocaleDateString()} {new Date(item.creado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</div>
						</td>
						<td>
							<div>{item.direccion_entrega}</div>
							<small class="text-muted">{item.municipio_entrega}</small>
						</td>
						<td>
							<span class="fw-bold text-success">
								${Number(item.total).toLocaleString()}
							</span>
						</td>
						<td>
							<BadgeEstado estado={item.estado_pedido} />
						</td>
						<td class="text-end">
							<div class="btn-group btn-group-sm">
								{#if item.estado_pedido === 'PENDIENTE'}
									<button
										class="btn btn-outline-primary"
										title="Productor acepta pedido"
										on:click={() => cambiarEstado(item, 'ACEPTADO')}
									>
										Aceptar
									</button>
									<button
										class="btn btn-outline-danger"
										title="Cancelar pedido"
										on:click={() => cambiarEstado(item, 'CANCELADO')}
									>
										Cancelar
									</button>
								{:else if item.estado_pedido === 'ACEPTADO'}
									<button
										class="btn btn-outline-info text-dark"
										title="Transportista inicia ruta"
										on:click={() => cambiarEstado(item, 'EN_RUTA')}
									>
										En Ruta
									</button>
								{:else if item.estado_pedido === 'EN_RUTA'}
									<button
										class="btn btn-outline-success"
										title="Confirmar entrega"
										on:click={() => cambiarEstado(item, 'ENTREGADO')}
									>
										Entregar
									</button>
								{:else if item.estado_pedido === 'ENTREGADO'}
									<span class="badge bg-success-subtle text-success py-2 px-3 border border-success-subtle">
										<i class="bi bi-check-all me-1"></i> Completado
									</span>
								{:else}
									<span class="badge bg-secondary">Cerrado</span>
								{/if}
							</div>
						</td>
					</tr>
				</DataTable>
			{/if}
		</Card>
	</div>
</div>
