<script>
	export let mensaje = '';
	export let tipo = 'success'; // 'success' | 'danger' | 'warning' | 'info'
	export let dismissible = true;

	function cerrar() {
		mensaje = '';
	}
</script>

{#if mensaje}
	<div
		class="alert alert-{tipo} {dismissible ? 'alert-dismissible' : ''} fade show d-flex align-items-center shadow-sm mb-4"
		role="alert"
	>
		{#if tipo === 'success'}
			<i class="bi bi-check-circle-fill fs-5 me-2"></i>
		{:else if tipo === 'danger'}
			<i class="bi bi-exclamation-octagon-fill fs-5 me-2"></i>
		{:else if tipo === 'warning'}
			<i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
		{:else}
			<i class="bi bi-info-circle-fill fs-5 me-2"></i>
		{/if}
		<div class="flex-grow-1">
			{mensaje}
		</div>
		{#if dismissible}
			<button type="button" class="btn-close" on:click={cerrar} aria-label="Cerrar"></button>
		{/if}
	</div>
{/if}
