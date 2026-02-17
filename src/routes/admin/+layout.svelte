<script lang="ts">
	import { getBreadcrumbs, setBreadcrumb } from '$lib/state/breadcrumb.svelte';

	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbPage,
		BreadcrumbSeparator
	} from '$lib/components/ui/shadcn-svelte/breadcrumb';
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
			<Breadcrumb>
				<BreadcrumbList>
					{#each getBreadcrumbs().slice(0, -1) as breadcrumb}
						<BreadcrumbItem>
							<BreadcrumbLink href={breadcrumb.path}>{breadcrumb.name}</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
					{/each}
					{#if getBreadcrumbs().length > 0}
						<BreadcrumbItem>
							<BreadcrumbPage>{getBreadcrumbs().at(-1)?.name}</BreadcrumbPage>
						</BreadcrumbItem>
					{/if}
				</BreadcrumbList>
			</Breadcrumb>
			<div>
				<Button href="/" variant="link" class="text-muted-foreground hover:text-foreground gap-1">
					<ArrowLeft class="size-4" />
					<span>Back to site</span>
				</Button>
			</div>
		</div>
	</div>
</nav>
<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	{@render children()}
</main>
