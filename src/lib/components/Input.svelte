<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'datetime-local';
		name?: string;
		id?: string;
		value?: string;
		placeholder?: string;
		label?: string | Snippet;
		helperText?: string;
		state?: 'default' | 'error' | 'success';
		disabled?: boolean;
		required?: boolean;
		/**
		 * Forwarded verbatim to the element. Without them a datetime-local can
		 * only be bounded after the fact, by refusing the save -- `min` lets the
		 * picker grey out what was never allowed, and `step` decides the
		 * granularity (60 = whole minutes, which also hides the seconds box).
		 */
		min?: string | number;
		max?: string | number;
		step?: string | number;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		class?: string;
		inputClass?: string;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onkeydown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		type = 'text',
		name,
		id,
		value = $bindable(''),
		placeholder,
		label,
		helperText,
		state = 'default',
		disabled = false,
		required = false,
		min,
		max,
		step,
		autocomplete,
		class: className,
		inputClass,
		oninput,
		onchange,
		onkeydown
	}: Props = $props();

	const autoId = nextDomId('ds-input');
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
		<label
			for={resolvedId}
			class="text-sm font-semibold text-ds-text"
		>
			{#if typeof label === 'string'}
				{label}
			{:else}
				{@render label()}
			{/if}
		</label>
	{/if}
	<input
		id={resolvedId}
		{name}
		{type}
		{placeholder}
		{disabled}
		{required}
		{min}
		{max}
		{step}
		autocomplete={autocomplete}
		class={cn(
			'w-full rounded-ds-md border-2 bg-ds-surface px-3.5 py-2.5 text-sm text-ds-text shadow-ds-sm transition-shadow duration-ds-fast placeholder:text-ds-text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-ds-bg',
			stateRing[state],
			inputClass
		)}
		bind:value
		aria-invalid={state === 'error'}
		aria-describedby={helperId}
		{oninput}
		{onchange}
		{onkeydown}
	/>
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
