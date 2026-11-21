<script lang="ts" module>
	export type TooltipPlacement = 'top' | 'bottom' | 'bottom-end' | 'right';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		/** the explanation; when empty, nothing is rendered and the child stands alone */
		text?: string;
		placement?: TooltipPlacement;
		class?: string;
		children: Snippet;
	}

	let { text, placement = 'top', class: className, children }: Props = $props();

	const id = nextDomId('ds-tooltip');

	const placements: Record<TooltipPlacement, string> = {
		top: 'left-1/2 -translate-x-1/2 bottom-full mb-2',
		bottom: 'left-1/2 -translate-x-1/2 top-full mt-2',
		'bottom-end': 'right-0 top-full mt-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};
</script>

<!--
	Wraps the trigger instead of sitting on it, because the usual reason for a
	tooltip here is a DISABLED control -- and a disabled element receives no
	pointer events, so a `title` on it is never shown. The wrapper still gets
	them.

	Hover and focus both open it: a mouse is not the only way to reach a control.
	`aria-describedby` sits on the wrapper for the same reason as above -- the
	element that can hold it is the one that can be interacted with.
-->
{#if text}
	<span
		class={cn('group relative inline-flex', className)}
		aria-describedby={id}
	>
		{@render children()}
		<span
			{id}
			role="tooltip"
			class={cn(
				'pointer-events-none absolute z-50 w-max max-w-xs rounded-ds-md border-2 border-ds-border bg-ds-surface px-3 py-2 text-xs font-medium text-ds-text opacity-0 shadow-ds-md transition-opacity duration-ds-fast',
				'group-hover:opacity-100 group-focus-within:opacity-100',
				placements[placement]
			)}
		>
			{text}
		</span>
	</span>
{:else}
	{@render children()}
{/if}
