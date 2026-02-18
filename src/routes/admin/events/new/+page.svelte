<script lang="ts">
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import * as Card from '$lib/components/ui/shadcn-svelte/card';
	import * as Field from '$lib/components/ui/shadcn-svelte/field';
	import { Input } from '$lib/components/ui/shadcn-svelte/input';
	import * as ButtonGroup from '$lib/components/ui/shadcn-svelte/button-group';
	import { Textarea } from '$lib/components/ui/shadcn-svelte/textarea';
	import { Switch } from '$lib/components/ui/shadcn-svelte/switch';
	import { enhance } from '$app/forms';
	import { setBreadcrumb } from '$lib/state/breadcrumb.svelte.js';
	import DateRangePicker from '$lib/components/ui/date-range-picker.svelte';
	import type { CalendarDate } from '@internationalized/date';

	setBreadcrumb({
		path: '/admin/events/new',
		name: 'New'
	});

	let { form } = $props();

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	let name = $derived(form?.values?.name ?? '');
	let slug = $derived(form?.values?.slug ?? '');
	let autoSlug = $state(true);

	$effect(() => {
		if (autoSlug) {
			slug = generateSlug(name);
		}
	});

	let date = $state({
		start: undefined as CalendarDate | undefined,
		end: undefined as CalendarDate | undefined
	});
</script>

<div class="max-w-lg w-full">
	<h1 class="text-3xl font-bold mb-6">Create Event</h1>

	<form method="POST" use:enhance>
		<Card.Root>
			<Card.Header>
				<Card.Title>Event Details</Card.Title>
				<Card.Description>Set up the basic information for your event</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Field.Group>
					<Field.Field>
						<Field.Label for="name">Name *</Field.Label>
						<Input id="name" name="name" bind:value={name} required placeholder="My Event" />
						{#if form?.errors?.name}
							<Field.Error>{form.errors.name[0]}</Field.Error>
						{/if}
					</Field.Field>

					<Field.Field>
						<Field.Label for="slug">Slug *</Field.Label>
						<ButtonGroup.Root>
							<Input
								id="slug"
								name="slug"
								disabled={autoSlug}
								bind:value={slug}
								required
								placeholder="my-event"
							/>
							<Button
								variant="outline"
								onclick={() => {
									autoSlug = !autoSlug;
								}}
							>
								{autoSlug ? 'Manual' : 'Auto'}
							</Button>
						</ButtonGroup.Root>
						{#if form?.errors?.slug}
							<Field.Error>{form.errors.slug[0]}</Field.Error>
						{/if}
					</Field.Field>

					<Field.Field>
						<Field.Label for="description">Description</Field.Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Describe your event..."
							value={form?.values?.description ?? ''}
						/>
					</Field.Field>

					<Field.Field>
						<Field.Label for="startDate">Date</Field.Label>
						<DateRangePicker bind:value={date} />
						<input name="startDate" type="hidden" value={date.start?.toString() ?? ''} />
						<input name="endDate" type="hidden" value={date.end?.toString() ?? ''} />
					</Field.Field>

					<Field.Field>
						<Field.Label for="maxRegistrations">Max Registrations</Field.Label>
						<Input
							id="maxRegistrations"
							name="maxRegistrations"
							type="number"
							min="1"
							placeholder="Leave empty for unlimited"
							value={form?.values?.maxRegistrations ?? ''}
						/>
					</Field.Field>

					<Field.Field orientation="horizontal">
						<Field.Label for="isPublished">Published</Field.Label>
						<Switch id="isPublished" name="isPublished" />
					</Field.Field>
				</Field.Group>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button variant="outline" href="/admin/events">Cancel</Button>
				<Button type="submit">Create Event</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
