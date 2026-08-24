<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';

	interface Props {
		elevation?: 'none' | 'sm' | 'md';
		hover?: boolean;
		class?: string;
		media?: Snippet;
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		elevation = 'sm',
		hover = false,
		class: className,
		media,
		header,
		children,
		footer
	}: Props = $props();

	const elevationClass = {
		none: 'shadow-none',
		sm: 'shadow-ds-sm',
		md: 'shadow-ds-md'
	} as const;
</script>

<article
	class={cn(
		'flex flex-col gap-4 overflow-hidden rounded-ds-lg border-2 border-ds-border bg-ds-surface p-5 transition-shadow duration-ds-normal',
		elevationClass[elevation],
		hover && 'hover:shadow-ds-md',
		className
	)}
>
	{#if media}
		<!-- full-bleed media: cancel the card padding and clip to the rounded top -->
		<div class="-mx-5 -mt-5 overflow-hidden rounded-t-ds-lg">
			{@render media()}
		</div>
	{/if}
	{#if header}
		<header class="flex items-start justify-between gap-3">
			<div class="min-w-0 flex-1">
				{@render header()}
			</div>
		</header>
	{/if}
	{#if children}
		<div class="min-w-0 flex-1 text-sm text-ds-text-muted">
			{@render children()}
		</div>
	{/if}
	{#if footer}
		<footer class="border-t border-ds-border pt-3">
			{@render footer()}
		</footer>
	{/if}
</article>
