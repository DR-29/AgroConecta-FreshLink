<script>
	export let items = [];
	export let searchFields = []; // Campos por los cuales buscar
	export let placeholder = 'Buscar registros...';
	export let pageSize = 5;

	let searchTerm = '';
	let currentPage = 1;

	$: filteredItems = items.filter((item) => {
		if (!searchTerm.trim()) return true;
		const term = searchTerm.toLowerCase();
		if (searchFields.length > 0) {
			return searchFields.some((field) => {
				const val = item[field];
				return val && String(val).toLowerCase().includes(term);
			});
		}
		return Object.values(item).some((val) => val && String(val).toLowerCase().includes(term));
	});

	$: totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
	$: {
		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;
	}
	$: paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}
</script>

<div class="datatable-wrapper">
	<div class="row align-items-center mb-3 g-2">
		<div class="col-md-6 col-12">
			<div class="input-group">
				<span class="input-group-text bg-white text-muted">
					<i class="bi bi-search"></i>
				</span>
				<input
					type="text"
					class="form-control"
					{placeholder}
					bind:value={searchTerm}
				/>
				{#if searchTerm}
					<button class="btn btn-outline-secondary" type="button" aria-label="Limpiar búsqueda" on:click={() => (searchTerm = '')}>
						<i class="bi bi-x"></i>
					</button>
				{/if}
			</div>
		</div>
		<div class="col-md-6 col-12 text-md-end">
			<span class="badge bg-light text-dark border px-3 py-2">
				Total: <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'registro' : 'registros'}
			</span>
		</div>
	</div>

	<div class="table-responsive bg-white rounded shadow-sm border">
		<table class="table table-hover align-middle mb-0">
			<thead class="table-light text-uppercase small fw-bold">
				<slot name="header" />
			</thead>
			<tbody>
				{#if paginatedItems.length === 0}
					<tr>
						<td colspan="10" class="text-center py-5 text-muted">
							<i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
							No se encontraron registros coincidentes.
						</td>
					</tr>
				{:else}
					{#each paginatedItems as item, index}
						<slot name="row" {item} {index} />
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if totalPages > 1}
		<div class="d-flex flex-wrap justify-content-between align-items-center mt-3">
			<small class="text-muted">
				Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
			</small>
			<nav aria-label="Navegación de páginas">
				<ul class="pagination pagination-sm mb-0">
					<li class="page-item {currentPage === 1 ? 'disabled' : ''}">
						<button class="page-link" on:click={() => goToPage(currentPage - 1)}>
							&laquo; Anterior
						</button>
					</li>
					{#each Array(totalPages) as _, i}
						<li class="page-item {currentPage === i + 1 ? 'active' : ''}">
							<button class="page-link" on:click={() => goToPage(i + 1)}>
								{i + 1}
							</button>
						</li>
					{/each}
					<li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
						<button class="page-link" on:click={() => goToPage(currentPage + 1)}>
							Siguiente &raquo;
						</button>
					</li>
				</ul>
			</nav>
		</div>
	{/if}
</div>

<style>
	.datatable-wrapper {
		margin-bottom: 1.5rem;
	}
	.page-link {
		color: #198754;
	}
	.page-item.active .page-link {
		background-color: #198754;
		border-color: #198754;
		color: white;
	}
</style>
