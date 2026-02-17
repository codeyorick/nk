<script lang="ts">
	import { setBreadcrumb } from '$lib/state/breadcrumb.svelte';

	setBreadcrumb({
		path: '/admin/events',
		name: 'Events'
	});

	let { children } = $props();
</script>

{@render children()}
