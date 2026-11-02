<script>
	export let autor = 'AgroConecta Team';
	export let anio = new Date().getFullYear();
</script>

<footer class="pie mt-auto py-3 bg-white border-top text-center text-muted">
	<div class="container">
		<p class="mb-1 small">
			<strong>AgroConecta (FreshLink)</strong> — Plataforma de Conexión Directa Campo-Ciudad
		</p>
		<p class="mb-0 text-secondary" style="font-size: 0.8rem;">
			Desarrollado con <strong>FastAPI (Python)</strong>, <strong>Express (MySQL)</strong> y <strong>SvelteKit</strong> · &copy; {anio} {autor}
		</p>
	</div>
</footer>

<style>
	.pie {
		box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.04);
	}
</style>
