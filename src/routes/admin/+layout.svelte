<script lang="ts">
	import { getBreadcrumbs, setBreadcrumb } from '$lib/state/breadcrumb.svelte';

	import * as Breadcrumb from '$lib/components/ui/shadcn-svelte/breadcrumb';
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	setBreadcrumb({
		path: '/admin',
		name: 'Admin'
	});

	let { children } = $props();
</script>

<nav class="border-b bg-card">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{#each getBreadcrumbs().slice(0, -1) as breadcrumb}
						<Breadcrumb.Item>
							<Breadcrumb.Link href={breadcrumb.path}>{breadcrumb.name}</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
					{/each}
					{#if getBreadcrumbs().length > 0}
						<Breadcrumb.Item>
							<Breadcrumb.Page>{getBreadcrumbs().at(-1)?.name}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{/if}
				</Breadcrumb.List>
			</Breadcrumb.Root>
			<div>
				<Button
					href="/"
					size="sm"
					variant="ghost"
					class="text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft class="size-4" />
					<span>Back to site</span>
				</Button>
			</div>
		</div>
	</div>
</nav>
<main class="mx-auto w-full max-w-4xl flex flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
	{@render children()}
</main>
