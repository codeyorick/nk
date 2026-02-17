<script lang="ts" module>
	import { CalendarDate } from '@internationalized/date';
	export const dateToCalendarDate = (
		dateStr: string | Date | null | undefined
	): CalendarDate | undefined => {
		if (!dateStr) return undefined;
		const d = new Date(dateStr);
		return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
	};
</script>

<script lang="ts">
	import { getLocalTimeZone } from '@internationalized/date';

	import * as Popover from '$lib/components/ui/shadcn-svelte/popover';
	import { Button } from '$lib/components/ui/shadcn-svelte/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { RangeCalendar } from './shadcn-svelte/range-calendar';

	let {
		value = $bindable({ start: undefined, end: undefined })
	}: {
		value: {
			start: CalendarDate | undefined;
			end: CalendarDate | undefined;
		};
	} = $props();

	let rawValue = $derived.by(() => {
		if (!value.start) return { start: undefined, end: undefined };
		if (value.start == value.end) return { start: value.start, end: undefined };
		return { start: value.start, end: value.end };
	});

	let open = $state(false);
	let id = $props.id();
</script>

<Popover.Root bind:open>
	<Popover.Trigger id="{id}-date">
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="justify-between font-normal">
				{#if value.start && value.end}
					{#if value.start == value.end}
						{value.start.toDate(getLocalTimeZone()).toLocaleDateString()}
					{:else}
						{value.start.toDate(getLocalTimeZone()).toLocaleDateString()}
						-
						{value.end.toDate(getLocalTimeZone()).toLocaleDateString()}
					{/if}
				{:else}
					Select date
				{/if}
				<ChevronDownIcon />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="start">
		<RangeCalendar
			bind:value={
				() => rawValue,
				(v) => {
					rawValue = v;
					if (!v.end) {
						value = { start: v.start, end: v.start };
					} else {
						value = v;
					}
				}
			}
			captionLayout="dropdown"
		/>
	</Popover.Content>
</Popover.Root>
