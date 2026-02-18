<script lang="ts">
	import { Badge } from '$lib/components/ui/shadcn-svelte/badge';
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import * as ButtonGroup from '$lib/components/ui/shadcn-svelte/button-group';
	import * as Empty from '$lib/components/ui/shadcn-svelte/empty';
	import * as Table from '$lib/components/ui/shadcn-svelte/table';
	import * as Tooltip from '$lib/components/ui/shadcn-svelte/tooltip';

	import SettingsIcon from '@lucide/svelte/icons/settings';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Rows4Icon from '@lucide/svelte/icons/rows-4';

	let { data } = $props();
</script>

<div class="flex items-center justify-between w-full mb-6">
	<h1 class="text-3xl font-bold">Events</h1>
	<Button href="/admin/events/new">Create Event</Button>
</div>

{#if data.events.length === 0}
	<Empty.Root>
		<Empty.Header>
			<Empty.Title>No events yet</Empty.Title>
			<Empty.Description>Get started by creating your first event.</Empty.Description>
		</Empty.Header>
		<Button href="/admin/events/new">Create Event</Button>
	</Empty.Root>
{:else}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Published</Table.Head>
				<Table.Head class="max-sm:hidden">Start Date</Table.Head>
				<Table.Head class="max-sm:hidden">Max Registrations</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.events as event}
				<Table.Row>
					<Table.Cell class="font-medium max-w-36 overflow-hidden">{event.name}</Table.Cell>
					<Table.Cell>
						<Badge
							class={event.isPublished
								? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
								: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}
						>
							{event.isPublished ? 'Published' : 'Draft'}
						</Badge>
					</Table.Cell>
					<Table.Cell class="max-sm:hidden">
						{event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}
					</Table.Cell>
					<Table.Cell class="max-sm:hidden">{event.maxRegistrations ?? 'Unlimited'}</Table.Cell>
					<Table.Cell class="text-right">
						<div class="flex items-center justify-end gap-2">
							<ButtonGroup.Root>
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												variant="ghost"
												size="icon-sm"
												href="/admin/events/{event.id}"
												aria-label="Edit Event"
												{...props}
											>
												<SettingsIcon />
											</Button>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Edit event</p>
									</Tooltip.Content>
								</Tooltip.Root>

								<ButtonGroup.Separator />

								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												variant="ghost"
												size="icon-sm"
												href="/admin/events/{event.id}/form"
												aria-label="Edit Form"
												{...props}
											>
												<PencilIcon />
											</Button>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Edit form</p>
									</Tooltip.Content>
								</Tooltip.Root>

								<ButtonGroup.Separator />

								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												variant="ghost"
												size="icon-sm"
												href="/admin/events/{event.id}/registrations"
												aria-label="View Registrations"
												{...props}
											>
												<Rows4Icon />
											</Button>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>View registrations</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</ButtonGroup.Root>
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/if}
