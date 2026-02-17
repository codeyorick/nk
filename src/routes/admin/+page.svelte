<script lang="ts">
	import * as Card from '$lib/components/ui/shadcn-svelte/card';
</script>

<h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
<div class="grid gap-4 md:grid-cols-2">
	<a href="/admin/events">
		<Card.Root class="hover:bg-accent">
			<Card.Content>
				<Card.Title class="text-lg">Events</Card.Title>
				<Card.Description>Manage events and registration forms</Card.Description>
			</Card.Content>
		</Card.Root>
	</a>
</div>
