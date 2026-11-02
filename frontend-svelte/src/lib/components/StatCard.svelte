<script>
	export let titulo = 'Métrica';
	export let valor = '0';
	export let icono = 'bi-bar-chart';
	export let color = 'success'; // primary, success, warning, info, danger
</script>

<div class="card border-0 shadow-sm rounded-3 h-100">
	<div class="card-body p-3 d-flex align-items-center">
		<div class="rounded-3 p-3 bg-{color}-subtle text-{color} me-3 fs-3 d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
			<i class="bi {icono}"></i>
		</div>
		<div>
			<h6 class="card-subtitle text-muted small text-uppercase fw-semibold mb-1">{titulo}</h6>
			<h3 class="card-title fw-bold text-dark mb-0">{valor}</h3>
		</div>
	</div>
</div>
