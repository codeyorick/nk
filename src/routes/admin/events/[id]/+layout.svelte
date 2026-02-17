<script lang="ts">
	import { setBreadcrumb } from '$lib/state/breadcrumb.svelte';
	import { page } from '$app/state';

	let { data, children } = $props();

	$effect(() => {
		setBreadcrumb({
			path: `/admin/events/${page.params.id}`,
			name: data.event.name
		});
	});
</script>

{@render children()}
