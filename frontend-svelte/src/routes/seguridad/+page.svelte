<script>
	import { onMount } from 'svelte';
	import { obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '$lib/services/api_usuario.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import BadgeEstado from '$lib/components/BadgeEstado.svelte';
	import AlertMessage from '$lib/components/AlertMessage.svelte';

	let usuarios = [];
	let cargando = false;
	let mensaje = '';
	let tipoMensaje = 'success';

	onMount(async () => {
		await cargarUsuarios();
	});

	async function cargarUsuarios() {
		cargando = true;
		try {
			usuarios = await obtenerUsuarios();
		} catch (error) {
			mensaje = 'Error al cargar usuarios: ' + error.message;
			tipoMensaje = 'danger';
		} finally {
			cargando = false;
		}
	}

	async function alternarEstado(u) {
		const nuevoEstado = u.estado === 1 ? 0 : 1;
		const accion = nuevoEstado === 1 ? 'activar' : 'inactivar (borrado lógico)';
		const seguro = confirm(`¿Está seguro de ${accion} la cuenta de ${u.nombres} ${u.apellidos}?`);
		if (!seguro) return;

		try {
			if (nuevoEstado === 0) {
				await eliminarUsuario(u.id_usuario);
			} else {
				await actualizarUsuario(u.id_usuario, { estado: 1 });
			}
			mensaje = `Estado del usuario ${u.nombres} actualizado a ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}.`;
			tipoMensaje = 'success';
			await cargarUsuarios();
		} catch (error) {
			mensaje = 'No se pudo actualizar el usuario: ' + error.message;
			tipoMensaje = 'danger';
		}
	}
</script>

<Header
	titulo="Gestión de Seguridad y Usuarios"
	subtitulo="Control de cuentas, roles de la plataforma y auditoría transversal"
	icono="bi-shield-lock"
>
	<button class="btn btn-outline-success btn-sm" on:click={cargarUsuarios} disabled={cargando}>
		<i class="bi bi-arrow-clockwise me-1"></i> Actualizar
	</button>
</Header>

<AlertMessage {mensaje} tipo={tipoMensaje} />

<Card titulo="Usuarios Registrados en la Plataforma" subtitulo="Visualización ordenada de cuentas y roles">
	{#if cargando}
		<div class="text-center py-5">
			<div class="spinner-border text-success" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
			<p class="text-muted mt-2">Consultando usuarios en la base de datos...</p>
		</div>
	{:else}
		<DataTable
			items={usuarios}
			searchFields={['nombres', 'apellidos', 'correo', 'documento', 'rol_nombre']}
			placeholder="Buscar por nombre, correo, documento o rol..."
			pageSize={5}
		>
			<tr slot="header">
				<th>Usuario</th>
				<th>Documento</th>
				<th>Contacto</th>
				<th>Rol en Sistema</th>
				<th>Estado</th>
				<th class="text-end">Acciones</th>
			</tr>

			<tr slot="row" let:item>
				<td>
					<strong>{item.nombres} {item.apellidos}</strong>
					<div class="small text-muted">{item.direccion || 'Sin dirección'}</div>
				</td>
				<td>
					<code>{item.documento}</code>
				</td>
				<td>
					<div><i class="bi bi-envelope me-1"></i>{item.correo}</div>
					{#if item.telefono}
						<small class="text-muted"><i class="bi bi-telephone me-1"></i>{item.telefono}</small>
					{/if}
				</td>
				<td>
					<span class="badge {item.rol_nombre === 'ADMINISTRADOR' ? 'bg-dark' : item.rol_nombre === 'PRODUCTOR' ? 'bg-success' : item.rol_nombre === 'TIENDA' ? 'bg-primary' : 'bg-info text-dark'}">
						{item.rol_nombre || 'USUARIO'}
					</span>
				</td>
				<td>
					<BadgeEstado estado={item.estado} />
				</td>
				<td class="text-end">
					<button
						class="btn btn-sm {item.estado === 1 ? 'btn-outline-danger' : 'btn-outline-success'}"
						title={item.estado === 1 ? 'Desactivar cuenta' : 'Activar cuenta'}
						on:click={() => alternarEstado(item)}
					>
						<i class="bi {item.estado === 1 ? 'bi-person-x' : 'bi-person-check'} me-1"></i>
						{item.estado === 1 ? 'Desactivar' : 'Activar'}
					</button>
				</td>
			</tr>
		</DataTable>
	{/if}
</Card>
