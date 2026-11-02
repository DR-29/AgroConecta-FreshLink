<script>
	export let titulo = 'Módulo';
	export let subtitulo = '';
	export let icono = '';
</script>

<div class="encabezado d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
	<div>
		<h1 class="h3 text-success fw-bold d-flex align-items-center gap-2 mb-1">
			{#if icono}
				<i class="bi {icono}"></i>
			{/if}
			<span>{titulo}</span>
		</h1>
		{#if subtitulo}
			<p class="text-muted mb-0">{subtitulo}</p>
		{/if}
	</div>
	<div class="d-flex gap-2 mt-2 mt-md-0">
		<slot />
	</div>
</div>

<style>
	.encabezado h1 {
		letter-spacing: -0.3px;
	}
</style>
