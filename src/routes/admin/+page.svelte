<script lang="ts">
	import {
		Card,
		CardContent,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/shadcn-svelte/card';
</script>

<h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
<div class="grid gap-4 md:grid-cols-2">
	<a href="/admin/events">
		<Card class="hover:bg-accent">
			<CardContent>
				<CardTitle class="text-lg">Events</CardTitle>
				<CardDescription>Manage events and registration forms</CardDescription>
			</CardContent>
		</Card>
	</a>
</div>
