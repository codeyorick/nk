<script lang="ts">
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import * as Alert from '$lib/components/ui/shadcn-svelte/alert';
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

	let date = $derived({
		start: dateToCalendarDate(data.event.startDate),
		end: dateToCalendarDate(data.event.endDate)
	});
</script>

<div class="max-w-lg">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">Edit Event</h1>
		<div class="flex gap-2">
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
		</div>
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
						<Input id="name" name="name" value={form?.values?.name ?? data.event.name} />
						{#if form?.errors?.name}
							<Field.Error>{form.errors.name[0]}</Field.Error>
						{/if}
					</Field.Field>

					<Field.Field>
						<Field.Label for="slug">Slug *</Field.Label>
						<Input id="slug" name="slug" value={form?.values?.slug ?? data.event.slug} required />
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
						<input name="startDate" type="hidden" value={date.start?.toString() ?? ''} />
						<input name="endDate" type="hidden" value={date.end?.toString() ?? ''} />
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
