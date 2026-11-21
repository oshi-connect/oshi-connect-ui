<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';
	import Spinner from './Spinner.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		title?: string;
		tooltip?: string;
		loading?: boolean;
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => void;
		'aria-expanded'?: boolean;
		'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'dialog';
	}

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		title,
		tooltip,
		loading = false,
		class: className,
		children,
		onclick,
		'aria-expanded': ariaExpanded,
		'aria-haspopup': ariaHaspopup
	}: Props = $props();

	const busy = $derived(disabled || loading);

	const base =
		'inline-flex select-none items-center justify-center gap-2 rounded-ds-md font-semibold transition-opacity duration-ds-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-primary disabled:pointer-events-none disabled:opacity-50';

	const variants = {
		primary: 'bg-ds-primary text-ds-on-primary shadow-ds-sm hover:opacity-90 active:opacity-80',
		secondary:
			'bg-ds-secondary text-ds-on-secondary shadow-ds-sm hover:opacity-90 active:opacity-80',
		ghost: 'border-2 border-ds-primary bg-transparent text-ds-primary hover:bg-ds-surface-elevated',
		danger: 'bg-ds-error text-ds-on-error shadow-ds-sm hover:opacity-90 active:opacity-80'
	} as const;

	const sizes = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-5 py-2.5 text-sm',
		lg: 'px-7 py-3 text-base'
	} as const;

	const spinnerSize = $derived(size === 'lg' ? 'md' : size === 'sm' ? 'sm' : 'md');
</script>

{#snippet control(nativeTitle: string | undefined)}
	<button
		{type}
		class={cn(base, variants[variant], sizes[size], className)}
		title={nativeTitle}
		disabled={busy}
		aria-busy={loading}
		aria-expanded={ariaExpanded}
		aria-haspopup={ariaHaspopup}
		onclick={onclick}
	>
		{#if loading}
			<Spinner
				size={spinnerSize}
				variant={variant === 'ghost' ? 'primary' : 'inherit'}
				aria-hidden={true}
			/>
		{/if}
		{@render children?.()}
	</button>
{/snippet}

{#if tooltip}
	<Tooltip text={tooltip}>
		{@render control(undefined)}
	</Tooltip>
{:else}
	{@render control(title)}
{/if}
