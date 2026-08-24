<script lang="ts">
	import { cn } from './cn';

	interface Props {
		src?: string;
		alt?: string;
		initials?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		src,
		alt = '',
		initials = '?',
		size = 'md',
		class: className
	}: Props = $props();

	const sizes = {
		sm: 'h-8 w-8 text-xs',
		md: 'h-10 w-10 text-sm',
		lg: 'h-14 w-14 text-base'
	} as const;

	const px = {
		sm: 32,
		md: 40,
		lg: 56
	} as const;
</script>

{#if src}
	<img
		src={src}
		width={px[size]}
		height={px[size]}
		loading="lazy"
		decoding="async"
		alt={alt || 'Avatar'}
		class={cn(
			'shrink-0 rounded-full object-cover ring-2 ring-ds-border',
			sizes[size],
			className
		)}
	/>
{:else}
	<div
		class={cn(
			'flex shrink-0 items-center justify-center rounded-full bg-ds-secondary font-bold text-ds-on-secondary ring-2 ring-ds-border',
			sizes[size],
			className
		)}
		role="img"
		aria-label={alt || initials}
	>
		<span aria-hidden="true">{initials}</span>
	</div>
{/if}
