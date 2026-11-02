<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div class="d-flex flex-column min-vh-100 bg-light">
	<Navbar />

	<main class="container py-4 flex-grow-1">
		{@render children()}
	</main>

	<Footer />
</div>

<style>
	:global(body) {
		font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	}
</style>
