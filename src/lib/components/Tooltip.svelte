<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		/** the explanation; when empty, nothing is rendered and the child stands alone */
		text?: string;
		placement?: 'top' | 'bottom';
		class?: string;
		children: Snippet;
	}

	let { text, placement = 'top', class: className, children }: Props = $props();

	const id = nextDomId('ds-tooltip');
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
				'pointer-events-none absolute left-1/2 z-50 w-max max-w-xs -translate-x-1/2 rounded-ds-md border-2 border-ds-border bg-ds-surface px-3 py-2 text-xs font-medium text-ds-text opacity-0 shadow-ds-md transition-opacity duration-ds-fast',
				'group-hover:opacity-100 group-focus-within:opacity-100',
				placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
			)}
		>
			{text}
		</span>
	</span>
{:else}
	{@render children()}
{/if}
