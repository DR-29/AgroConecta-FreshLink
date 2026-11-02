<script>
	export let titulo = '';
	export let subtitulo = '';
	export let claseExtra = '';
</script>

<div class="card shadow-sm border-0 mb-4 {claseExtra}">
	{#if titulo}
		<div class="card-header bg-white border-bottom py-3">
			<h5 class="card-title mb-0 fw-bold text-dark">{titulo}</h5>
			{#if subtitulo}
				<small class="text-muted">{subtitulo}</small>
			{/if}
		</div>
	{/if}
	<div class="card-body p-4">
		<slot />
	</div>
</div>

<style>
	.card {
		border-radius: 12px;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}
</style>
