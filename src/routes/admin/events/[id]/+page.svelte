<script lang="ts">
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import * as Alert from '$lib/components/ui/shadcn-svelte/alert';
	import * as ButtonGroup from '$lib/components/ui/shadcn-svelte/button-group';
	import * as Card from '$lib/components/ui/shadcn-svelte/card';
	import * as Field from '$lib/components/ui/shadcn-svelte/field';
	import { Input } from '$lib/components/ui/shadcn-svelte/input';
	import { Textarea } from '$lib/components/ui/shadcn-svelte/textarea';
	import { Switch } from '$lib/components/ui/shadcn-svelte/switch';

	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Rows4Icon from '@lucide/svelte/icons/rows-4';

	import { enhance } from '$app/forms';
	import DateRangePicker from '$lib/components/ui/date-range-picker.svelte';
	import { dateToCalendarDate } from '$lib/components/ui/date-range-picker.svelte';

	let { data, form } = $props();

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	}

	let name = $derived(form?.values?.name ?? data.event.name);
	let slug = $derived(form?.values?.slug ?? data.event.slug);
	let autoSlug = $derived(data.event.slug === generateSlug(data.event.name));

	$effect(() => {
		if (autoSlug) {
			slug = generateSlug(name);
		}
	});

	let date = $derived({
		start: dateToCalendarDate(data.event.startDate),
		end: dateToCalendarDate(data.event.endDate)
	});
</script>

<div class="max-w-lg w-full">
	<div class="flex items-center justify-between gap-4 mb-6">
		<h1 class="text-3xl font-bold">Edit Event</h1>
		<ButtonGroup.Root>
			<Button
				variant="outline"
				size="sm"
				href="/admin/events/{data.event.id}/form"
				aria-label="Edit Form"
			>
				<PencilIcon />
				<span>Form</span>
			</Button>
			<Button
				variant="outline"
				size="sm"
				href="/admin/events/{data.event.id}/registrations"
				aria-label="View Registrations"
			>
				<Rows4Icon />
				<span>Registrations</span>
			</Button>
		</ButtonGroup.Root>
	</div>

	<form method="POST" action="?/update" use:enhance>
		<Card.Root>
			<Card.Header>
				<Card.Title>Event Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Field.Group>
					<Field.Field>
						<Field.Label for="name">Name *</Field.Label>
						<Input id="name" name="name" bind:value={name} />
						{#if form?.errors?.name}
							<Field.Error>{form.errors.name[0]}</Field.Error>
						{/if}
					</Field.Field>

					<Field.Field>
						<Field.Label for="slug">Slug *</Field.Label>
						<ButtonGroup.Root>
							<Input
								id="slug"
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

						<input type="hidden" name="slug" value={slug} />

						{#if form?.errors?.slug}
							<Field.Error>{form.errors.slug[0]}</Field.Error>
						{/if}
					</Field.Field>

					<Field.Field>
						<Field.Label for="description">Description</Field.Label>
						<Textarea
							id="description"
							name="description"
							value={form?.values?.description ?? data.event.description ?? ''}
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
							value={form?.values?.maxRegistrations ?? data.event.maxRegistrations ?? ''}
						/>
					</Field.Field>

					<Field.Field orientation="horizontal">
						<Field.Label for="isPublished">Published</Field.Label>
						<Switch id="isPublished" name="isPublished" checked={data.event.isPublished} />
					</Field.Field>
				</Field.Group>

				{#if form?.success}
					<Alert.Root>
						<CheckCircle2Icon />
						<Alert.Title>Event updated successfully!</Alert.Title>
					</Alert.Root>
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button variant="outline" href="/admin/events">Back</Button>
				<Button type="submit">Save Changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<form method="POST" action="?/delete" use:enhance class="mt-6">
		<Card.Root class="border-destructive">
			<Card.Header>
				<Card.Title class="text-destructive">Danger Zone</Card.Title>
			</Card.Header>
			<Card.Content class="text-sm text-muted-foreground">
				Deleting this event will remove all registration forms, registrations, and associated data.
				This action cannot be undone.
			</Card.Content>
			<Card.Footer>
				<Button type="submit" variant="destructive">Delete Event</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
