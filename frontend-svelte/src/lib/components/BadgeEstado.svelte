<script>
	export let estado = 1; // 1 | 0 o texto de estado
</script>

{#if estado === 1 || estado === 'ACTIVO' || estado === 'ENTREGADO' || estado === 'COMPLETADA'}
	<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
		<i class="bi bi-check-circle-fill me-1"></i>
		{typeof estado === 'number' ? 'Activo' : estado}
	</span>
{:else if estado === 0 || estado === 'INACTIVO' || estado === 'CANCELADO' || estado === 'RECHAZADA'}
	<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
		<i class="bi bi-x-circle-fill me-1"></i>
		{typeof estado === 'number' ? 'Inactivo' : estado}
	</span>
{:else if estado === 'PENDIENTE' || estado === 'EN_PROCESO'}
	<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">
		<i class="bi bi-hourglass-split me-1"></i>
		{estado}
	</span>
{:else if estado === 'ACEPTADO' || estado === 'EN_RUTA' || estado === 'EN_CURSO'}
	<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">
		<i class="bi bi-truck me-1"></i>
		{estado}
	</span>
{:else}
	<span class="badge bg-secondary px-2 py-1">
		{estado}
	</span>
{/if}
