<script>
	import { onMount } from 'svelte';
	import { getStoredUser } from '$lib/services/api_auth.js';
	import Header from '$lib/components/Header.svelte';
	import Card from '$lib/components/Card.svelte';
	import StatCard from '$lib/components/StatCard.svelte';

	let usuario = null;

	onMount(() => {
		usuario = getStoredUser();
	});
</script>

<Header
	titulo="Plataforma AgroConecta"
	subtitulo="Conexión Directa del Campo a la Ciudad sin Intermediarios"
	icono="bi-tree-fill"
>
	{#if !usuario}
		<a href="/login" class="btn btn-success">
			<i class="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
		</a>
	{:else}
		<span class="badge bg-success-subtle text-success fs-6 border border-success-subtle px-3 py-2">
			<i class="bi bi-person-check-fill me-1"></i> Rol: {usuario.rol}
		</span>
	{/if}
</Header>

<div class="row g-3 mb-4">
	<div class="col-md-3 col-sm-6">
		<StatCard titulo="Fincas Registradas" valor="10+" icono="bi-geo-alt" color="success" />
	</div>
	<div class="col-md-3 col-sm-6">
		<StatCard titulo="Cosechas Activas" valor="25+" icono="bi-basket" color="primary" />
	</div>
	<div class="col-md-3 col-sm-6">
		<StatCard titulo="Órdenes Despachadas" valor="50+" icono="bi-receipt" color="warning" />
	</div>
	<div class="col-md-3 col-sm-6">
		<StatCard titulo="Vehículos de Carga" valor="8+" icono="bi-truck" color="info" />
	</div>
</div>

<div class="row g-4">
	<div class="col-lg-8">
		<Card titulo="Bienvenido a AgroConecta" subtitulo="Ciclo Operativo Transparente">
			<p class="lead text-secondary">
				Nuestra plataforma conecta en tiempo real a los cuatro actores fundamentales de la cadena de suministro agropecuaria:
			</p>

			<div class="row g-3 mt-2">
				<div class="col-md-6">
					<div class="border rounded p-3 h-100 bg-white">
						<h6 class="fw-bold text-success d-flex align-items-center gap-2">
							<i class="bi bi-person-badge"></i> Productores Campesinos
						</h6>
						<p class="small text-muted mb-2">
							Registran sus fincas, publican cosechas frescas a precios justos y gestionan la recolección.
						</p>
						<a href="/fincas" class="btn btn-outline-success btn-sm">Ver Fincas</a>
					</div>
				</div>

				<div class="col-md-6">
					<div class="border rounded p-3 h-100 bg-white">
						<h6 class="fw-bold text-primary d-flex align-items-center gap-2">
							<i class="bi bi-shop"></i> Tiendas y Comercios
						</h6>
						<p class="small text-muted mb-2">
							Compran productos directamente de la finca, siguen el pedido en vivo y califican el servicio.
						</p>
						<a href="/catalogo" class="btn btn-outline-primary btn-sm">Ver Catálogo</a>
					</div>
				</div>

				<div class="col-md-6">
					<div class="border rounded p-3 h-100 bg-white">
						<h6 class="fw-bold text-info-emphasis d-flex align-items-center gap-2">
							<i class="bi bi-truck"></i> Transportistas
						</h6>
						<p class="small text-muted mb-2">
							Postulan vehículos autorizados, coordinan fletes rurales y garantizan la entrega en ciudad.
						</p>
						<a href="/logistica" class="btn btn-outline-info btn-sm">Ver Logística</a>
					</div>
				</div>

				<div class="col-md-6">
					<div class="border rounded p-3 h-100 bg-white">
						<h6 class="fw-bold text-dark d-flex align-items-center gap-2">
							<i class="bi bi-credit-card-2-front"></i> Pagos y Facturación
						</h6>
						<p class="small text-muted mb-2">
							Microservicio auxiliar con <strong>Express + MySQL</strong> para conciliación de transacciones y facturas.
						</p>
						<a href="/pagos" class="btn btn-outline-secondary btn-sm">Ver Pagos</a>
					</div>
				</div>
			</div>
		</Card>
	</div>

	<div class="col-lg-4">
		<Card titulo="Guía de Demostración" subtitulo="Credenciales de Prueba">
			<p class="small text-muted">
				Puedes ingresar con cualquiera de los perfiles para validar cómo los cambios en un rol se reflejan de inmediato en los demás:
			</p>

			<ul class="list-group list-group-flush small">
				<li class="list-group-item d-flex justify-content-between align-items-center px-0">
					<div>
						<strong>Productor (Carlos):</strong><br>
						<span class="text-muted">carlos.productor@agroconecta.com</span>
					</div>
					<span class="badge bg-success">PRODUCTOR</span>
				</li>
				<li class="list-group-item d-flex justify-content-between align-items-center px-0">
					<div>
						<strong>Tienda (María):</strong><br>
						<span class="text-muted">maria.tienda@agroconecta.com</span>
					</div>
					<span class="badge bg-primary">TIENDA</span>
				</li>
				<li class="list-group-item d-flex justify-content-between align-items-center px-0">
					<div>
						<strong>Transportista (Jorge):</strong><br>
						<span class="text-muted">jorge.transporte@agroconecta.com</span>
					</div>
					<span class="badge bg-info text-dark">TRANSPORTE</span>
				</li>
				<li class="list-group-item d-flex justify-content-between align-items-center px-0">
					<div>
						<strong>Administrador:</strong><br>
						<span class="text-muted">admin@agroconecta.com</span>
					</div>
					<span class="badge bg-dark">ADMIN</span>
				</li>
			</ul>

			<div class="alert alert-light border small mt-3 mb-0">
				<i class="bi bi-key me-1"></i> Contraseña para todos: <code>Password123*</code>
			</div>
		</Card>
	</div>
</div>
