<script lang="ts">
	import { cn } from './cn';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		/** `inherit` uses currentColor (e.g. inside a button). */
		variant?: 'primary' | 'muted' | 'inherit';
		class?: string;
		'aria-label'?: string;
		'aria-hidden'?: boolean | 'true' | 'false';
	}

	let {
		size = 'md',
		variant = 'primary',
		class: className,
		'aria-label': ariaLabel = 'Loading',
		'aria-hidden': ariaHidden
	}: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-8 w-8'
	} as const;

	const toneClasses = {
		primary: 'text-ds-primary',
		muted: 'text-ds-text-muted',
		inherit: 'text-current'
	} as const;

	const hidden = $derived(ariaHidden ?? false);
	const label = $derived(hidden ? undefined : ariaLabel);
</script>

<svg
	class={cn('animate-spin', sizeClasses[size], toneClasses[variant], className)}
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	role={hidden ? 'presentation' : 'img'}
	aria-hidden={hidden ? 'true' : undefined}
	aria-label={label}
>
	<circle
		class="opacity-25"
		cx="12"
		cy="12"
		r="10"
		stroke="currentColor"
		stroke-width="4"
	></circle>
	<path
		class="opacity-90"
		fill="currentColor"
		d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
	></path>
</svg>
