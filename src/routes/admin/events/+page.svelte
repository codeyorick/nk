<script lang="ts">
	import * as Button from '$lib/components/ui/shadcn-svelte/button';
	import * as Table from '$lib/components/ui/shadcn-svelte/table';

	let { data } = $props();
</script>

<div class="flex items-center justify-between mb-6">
	<h1 class="text-3xl font-bold">Events</h1>
	<Button.Root href="/admin/events/new">Create Event</Button.Root>
</div>

{#if data.events.length === 0}
	<div class="text-center py-12 text-muted-foreground">
		<p class="text-lg">No events yet</p>
		<p class="mt-2">Create your first event to get started</p>
	</div>
{:else}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Slug</Table.Head>
				<Table.Head>Published</Table.Head>
				<Table.Head>Start Date</Table.Head>
				<Table.Head>Max Registrations</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.events as event}
				<Table.Row>
					<Table.Cell class="font-medium">{event.name}</Table.Cell>
					<Table.Cell class="text-muted-foreground">{event.slug}</Table.Cell>
					<Table.Cell>
						<span
							class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {event.isPublished
								? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
								: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}"
						>
							{event.isPublished ? 'Published' : 'Draft'}
						</span>
					</Table.Cell>
					<Table.Cell
						>{event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}</Table.Cell
					>
					<Table.Cell>{event.maxRegistrations ?? 'Unlimited'}</Table.Cell>
					<Table.Cell class="text-right">
						<div class="flex items-center justify-end gap-2">
							<Button.Root variant="outline" size="sm" href="/admin/events/{event.id}"
								>Edit</Button.Root
							>
							<Button.Root variant="outline" size="sm" href="/admin/events/{event.id}/form"
								>Form</Button.Root
							>
							<Button.Root variant="outline" size="sm" href="/admin/events/{event.id}/registrations"
								>Registrations</Button.Root
							>
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/if}
