<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';

	interface Props {
		variant?:
			| 'primary'
			| 'secondary'
			| 'accent'
			| 'neutral'
			| 'success'
			| 'warning'
			| 'error';
		size?: 'sm' | 'md';
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'sm',
		class: className,
		children
	}: Props = $props();

	const variants = {
		primary: 'bg-ds-primary text-ds-on-primary',
		secondary: 'bg-ds-secondary text-ds-on-secondary',
		accent: 'bg-ds-accent text-ds-on-accent',
		neutral: 'bg-ds-neutral text-ds-on-neutral',
		success: 'bg-ds-success text-ds-on-success',
		warning: 'bg-ds-warning text-ds-on-warning',
		error: 'bg-ds-error text-ds-on-error'
	} as const;

	const sizes = {
		sm: 'px-2.5 py-0.5 text-[11px]',
		md: 'px-3 py-1 text-xs'
	} as const;
</script>

<span
	class={cn(
		'inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide',
		variants[variant],
		sizes[size],
		className
	)}
>
	{@render children?.()}
</span>
