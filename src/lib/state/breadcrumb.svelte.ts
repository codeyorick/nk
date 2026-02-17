import { SvelteMap } from 'svelte/reactivity';

export interface Breadcrumb {
	path: string;
	name: string;
}

interface BreadcrumbInternal extends Breadcrumb {
	count: number;
}

const breadcrumbMap = new SvelteMap<string, BreadcrumbInternal>();

const breadcrumbs: Breadcrumb[] = $derived(
	Array.from(breadcrumbMap.values()).toSorted((a, b) => a.count - b.count)
);

export const getBreadcrumbs = () => breadcrumbs;

export const setBreadcrumb = (item: Breadcrumb) => {
	$effect(() => {
		breadcrumbMap.set(item.path, { ...item, count: item.path.split('/').length });
		return () => {
			breadcrumbMap.delete(item.path);
		};
	});
};
