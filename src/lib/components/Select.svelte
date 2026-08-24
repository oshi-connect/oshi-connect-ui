<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SelectOption } from './form.types';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		name?: string;
		id?: string;
		value?: string;
		options: SelectOption[];
		placeholder?: string;
		label?: string | Snippet;
		helperText?: string;
		state?: 'default' | 'error' | 'success';
		disabled?: boolean;
		required?: boolean;
		class?: string;
		selectClass?: string;
		onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
	}

	let {
		name,
		id,
		value = $bindable(''),
		options,
		placeholder,
		label,
		helperText,
		state = 'default',
		disabled = false,
		required = false,
		class: className,
		selectClass,
		onchange
	}: Props = $props();

	const autoId = nextDomId('ds-select');
	const resolvedId = $derived(id ?? autoId);
	const helperId = $derived(helperText ? `${resolvedId}-help` : undefined);

	const stateRing = {
		default: 'border-ds-border focus-visible:ring-ds-primary',
		error: 'border-ds-error focus-visible:ring-ds-error',
		success: 'border-ds-success focus-visible:ring-ds-success'
	} as const;
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
	{#if label !== undefined && label !== null}
		<label for={resolvedId} class="text-sm font-semibold text-ds-text">
			{#if typeof label === 'string'}
				{label}
			{:else}
				{@render label()}
			{/if}
		</label>
	{/if}
	<div class="relative">
		<select
			id={resolvedId}
			{name}
			{disabled}
			{required}
			class={cn(
				'w-full appearance-none rounded-ds-md border-2 bg-ds-surface px-3.5 py-2.5 pr-10 text-sm text-ds-text shadow-ds-sm transition-shadow duration-ds-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-ds-bg',
				stateRing[state],
				selectClass
			)}
			bind:value
			aria-invalid={state === 'error'}
			aria-describedby={helperId}
			{onchange}
		>
			{#if placeholder}
				<option value="" disabled>
					{placeholder}
				</option>
			{/if}
			{#each options as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<span
			class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ds-text-muted"
			aria-hidden="true"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</span>
	</div>
	{#if helperText}
		<p
			id={helperId}
			class={cn(
				'text-xs',
				state === 'error' && 'text-ds-error',
				state === 'success' && 'text-ds-success',
				state === 'default' && 'text-ds-text-muted'
			)}
			role={state === 'error' ? 'alert' : undefined}
		>
			{helperText}
		</p>
	{/if}
</div>
