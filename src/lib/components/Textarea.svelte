<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		name?: string;
		id?: string;
		value?: string;
		placeholder?: string;
		rows?: number;
		maxlength?: number;
		showCount?: boolean;
		label?: string | Snippet;
		helperText?: string;
		state?: 'default' | 'error' | 'success';
		disabled?: boolean;
		required?: boolean;
		resize?: 'none' | 'vertical' | 'both';
		class?: string;
		textareaClass?: string;
		oninput?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
		onchange?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
	}

	let {
		name,
		id,
		value = $bindable(''),
		placeholder,
		rows = 4,
		maxlength,
		showCount = false,
		label,
		helperText,
		state = 'default',
		disabled = false,
		required = false,
		resize = 'vertical',
		class: className,
		textareaClass,
		oninput,
		onchange
	}: Props = $props();

	const autoId = nextDomId('ds-textarea');
	const resolvedId = $derived(id ?? autoId);
	const helperId = $derived(helperText || showCount ? `${resolvedId}-help` : undefined);

	const resizeClass = {
		none: 'resize-none',
		vertical: 'resize-y',
		both: 'resize'
	} as const;

	const stateRing = {
		default: 'border-ds-border focus-visible:ring-ds-primary',
		error: 'border-ds-error focus-visible:ring-ds-error',
		success: 'border-ds-success focus-visible:ring-ds-success'
	} as const;

	const countLabel = $derived(
		maxlength !== undefined ? `${value.length} / ${maxlength}` : ''
	);
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
	<textarea
		id={resolvedId}
		{name}
		{rows}
		maxlength={maxlength}
		{placeholder}
		{disabled}
		{required}
		class={cn(
			'min-h-[5rem] w-full rounded-ds-md border-2 bg-ds-surface px-3.5 py-2.5 text-sm text-ds-text shadow-ds-sm transition-shadow duration-ds-fast placeholder:text-ds-text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-ds-bg',
			resizeClass[resize],
			stateRing[state],
			textareaClass
		)}
		bind:value
		aria-invalid={state === 'error'}
		aria-describedby={helperId}
		{oninput}
		{onchange}
	></textarea>
	{#if helperText || showCount}
		<div class="flex items-center justify-between gap-2 text-xs" id={helperId}>
			{#if helperText}
				<p
					class={cn(
						state === 'error' && 'text-ds-error',
						state === 'success' && 'text-ds-success',
						state === 'default' && 'text-ds-text-muted'
					)}
					role={state === 'error' ? 'alert' : undefined}
				>
					{helperText}
				</p>
			{:else}
				<span></span>
			{/if}
			{#if showCount && maxlength !== undefined}
				<span class="shrink-0 text-ds-text-muted">{countLabel}</span>
			{/if}
		</div>
	{/if}
</div>
