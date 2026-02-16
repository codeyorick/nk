<script lang="ts">
	import * as Button from '$lib/components/ui/shadcn-svelte/button';
	import * as Card from '$lib/components/ui/shadcn-svelte/card';

	let { data } = $props();
</script>

<div class="mx-auto max-w-lg px-4 py-12">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-green-600">
				{data.alreadyConfirmed ? 'Already Confirmed' : 'Registration Confirmed!'}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.alreadyConfirmed}
				<p class="text-muted-foreground">Your registration was already confirmed.</p>
			{:else}
				<p class="text-muted-foreground">
					Your registration has been confirmed successfully! You will receive a confirmation email
					shortly.
				</p>
			{/if}
		</Card.Content>
		<Card.Footer>
			<Button.Root href="/events" variant="outline">← Back to Events</Button.Root>
		</Card.Footer>
	</Card.Root>
</div>
