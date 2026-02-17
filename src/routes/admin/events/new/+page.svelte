<script lang="ts">
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import * as Card from '$lib/components/ui/shadcn-svelte/card';
	import { Input } from '$lib/components/ui/shadcn-svelte/input';
	import { Textarea } from '$lib/components/ui/shadcn-svelte/textarea';
	import { Label } from '$lib/components/ui/shadcn-svelte/label';
	import { Switch } from '$lib/components/ui/shadcn-svelte/switch';
	import { enhance } from '$app/forms';
	import { setBreadcrumb } from '$lib/state/breadcrumb.svelte.js';

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
</script>

<div class="max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Create Event</h1>

	<form method="POST" use:enhance>
		<Card.Root>
			<Card.Header>
				<Card.Title>Event Details</Card.Title>
				<Card.Description>Set up the basic information for your event</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name *</Label>
					<Input id="name" name="name" bind:value={name} required placeholder="My Event" />
					{#if form?.errors?.name}
						<p class="text-sm text-destructive">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="slug">Slug *</Label>
					<div class="flex gap-2">
						<Input id="slug" name="slug" bind:value={slug} required placeholder="my-event" />
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => {
								autoSlug = !autoSlug;
							}}
						>
							{autoSlug ? 'Manual' : 'Auto'}
						</Button>
					</div>
					{#if form?.errors?.slug}
						<p class="text-sm text-destructive">{form.errors.slug[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						placeholder="Describe your event..."
						value={form?.values?.description ?? ''}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="startDate">Start Date</Label>
						<Input
							id="startDate"
							name="startDate"
							type="datetime-local"
							value={form?.values?.startDate ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="endDate">End Date</Label>
						<Input
							id="endDate"
							name="endDate"
							type="datetime-local"
							value={form?.values?.endDate ?? ''}
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
						value={form?.values?.maxRegistrations ?? ''}
					/>
				</div>

				<div class="flex items-center gap-2">
					<Switch id="isPublished" name="isPublished" />
					<Label for="isPublished">Published</Label>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button variant="outline" href="/admin/events">Cancel</Button>
				<Button type="submit">Create Event</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
