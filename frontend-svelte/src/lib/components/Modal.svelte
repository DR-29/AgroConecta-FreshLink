<script>
	export let id = 'modalDialog';
	export let titulo = 'Modal';
	export let tamano = ''; // 'modal-lg', 'modal-sm'
</script>

<div class="modal fade" {id} tabindex="-1" aria-labelledby="{id}Label" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered {tamano}">
		<div class="modal-content border-0 shadow">
			<div class="modal-header bg-light border-bottom">
				<h5 class="modal-title fw-bold" id="{id}Label">{titulo}</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
			</div>
			<div class="modal-body p-4">
				<slot />
			</div>
			{#if $$slots.footer}
				<div class="modal-footer bg-light border-top">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
</div>
