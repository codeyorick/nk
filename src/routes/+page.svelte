<script lang="ts">
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
</script>

<div class="flex flex-1 flex-col items-center justify-center">
	<div class="flex flex-col items-center text-center gap-8">
		<h1 class="text-4xl font-bold">Event Registration System</h1>
		<p class="text-muted-foreground text-lg mx-auto">
			Create events, build customizable registration forms, and manage registrations with ease.
		</p>
		<div class="flex gap-4">
			<Button href="/events" size="lg" class="text-base">Browse Events</Button>
			<Button href="/admin" size="lg" variant="outline" class="text-base">Admin Panel</Button>
		</div>
	</div>
</div>
