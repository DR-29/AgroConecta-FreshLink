<script>
	export let id = 'confirmModal';
	export let titulo = '¿Confirmar acción?';
	export let mensaje = '¿Está seguro de que desea realizar esta operación?';
	export let textoConfirmar = 'Confirmar';
	export let claseBoton = 'btn-danger';
	export let onConfirmar = () => {};
</script>

<div class="modal fade" {id} tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content border-0 shadow">
			<div class="modal-header border-bottom">
				<h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
					<i class="bi bi-exclamation-triangle-fill text-warning"></i>
					<span>{titulo}</span>
				</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
			</div>
			<div class="modal-body py-4">
				<p class="mb-0 text-secondary">{mensaje}</p>
			</div>
			<div class="modal-footer bg-light border-top">
				<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
					Cancelar
				</button>
				<button
					type="button"
					class="btn {claseBoton}"
					data-bs-dismiss="modal"
					on:click={onConfirmar}
				>
					{textoConfirmar}
				</button>
			</div>
		</div>
	</div>
</div>
