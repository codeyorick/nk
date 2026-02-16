<script lang="ts">
	import * as Button from '$lib/components/ui/shadcn-svelte/button';
	import * as Card from '$lib/components/ui/shadcn-svelte/card';
	import { Input } from '$lib/components/ui/shadcn-svelte/input';
	import { Textarea } from '$lib/components/ui/shadcn-svelte/textarea';
	import { Label } from '$lib/components/ui/shadcn-svelte/label';
	import { Switch } from '$lib/components/ui/shadcn-svelte/switch';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function formatDateForInput(date: string | Date | null | undefined): string {
		if (!date) return '';
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	}
</script>

<div class="max-w-2xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">Edit Event</h1>
		<div class="flex gap-2">
			<Button.Root variant="outline" href="/admin/events/{data.event.id}/form"
				>Edit Form</Button.Root
			>
			<Button.Root variant="outline" href="/admin/events/{data.event.id}/registrations"
				>Registrations</Button.Root
			>
		</div>
	</div>

	{#if form?.success}
		<div
			class="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300"
		>
			Event updated successfully!
		</div>
	{/if}

	<form method="POST" action="?/update" use:enhance>
		<Card.Root>
			<Card.Header>
				<Card.Title>Event Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name *</Label>
					<Input id="name" name="name" value={form?.values?.name ?? data.event.name} required />
					{#if form?.errors?.name}
						<p class="text-sm text-destructive">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="slug">Slug *</Label>
					<Input id="slug" name="slug" value={form?.values?.slug ?? data.event.slug} required />
					{#if form?.errors?.slug}
						<p class="text-sm text-destructive">{form.errors.slug[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						value={form?.values?.description ?? data.event.description ?? ''}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="startDate">Start Date</Label>
						<Input
							id="startDate"
							name="startDate"
							type="datetime-local"
							value={form?.values?.startDate ?? formatDateForInput(data.event.startDate)}
						/>
					</div>
					<div class="space-y-2">
						<Label for="endDate">End Date</Label>
						<Input
							id="endDate"
							name="endDate"
							type="datetime-local"
							value={form?.values?.endDate ?? formatDateForInput(data.event.endDate)}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="maxRegistrations">Max Registrations</Label>
					<Input
						id="maxRegistrations"
						name="maxRegistrations"
						type="number"
						min="1"
						placeholder="Leave empty for unlimited"
						value={form?.values?.maxRegistrations ?? data.event.maxRegistrations ?? ''}
					/>
				</div>

				<div class="flex items-center gap-2">
					<Switch id="isPublished" name="isPublished" checked={data.event.isPublished} />
					<Label for="isPublished">Published</Label>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button.Root variant="outline" href="/admin/events">Back</Button.Root>
				<Button.Root type="submit">Save Changes</Button.Root>
			</Card.Footer>
		</Card.Root>
	</form>

	<form method="POST" action="?/delete" use:enhance class="mt-6">
		<Card.Root class="border-destructive">
			<Card.Header>
				<Card.Title class="text-destructive">Danger Zone</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground mb-4">
					Deleting this event will remove all registration forms, registrations, and associated
					data. This action cannot be undone.
				</p>
				<Button.Root type="submit" variant="destructive">Delete Event</Button.Root>
			</Card.Content>
		</Card.Root>
	</form>
</div>
