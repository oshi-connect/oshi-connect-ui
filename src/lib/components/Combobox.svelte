<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SelectOption } from './form.types';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		name?: string;
		id?: string;
		value?: string;
		/**
		 * Offer the typed text as a choice of its own, as the last list entry.
		 *
		 * For the cases where the list is a roster rather than a closed set: you
		 * search for a cast member or a co-organizer, and if they are not on it
		 * you enter them by hand. Which of the two happened has to stay
		 * distinguishable, so the result lands in `custom`, never in `value` --
		 * exactly one of the pair is ever non-empty.
		 */
		allowCustom?: boolean;
		/** free text, set only when the typed value was taken as-is */
		custom?: string;
		/** how the offer reads, e.g. (q) => `Add “${q}” as a guest` */
		customLabel?: (query: string) => string;
		options: SelectOption[];
		placeholder?: string;
		label?: string | Snippet;
		helperText?: string;
		validationState?: 'default' | 'error' | 'success';
		disabled?: boolean;
		required?: boolean;
		class?: string;
	}

	let {
		name,
		id,
		value = $bindable(''),
		allowCustom = false,
		custom = $bindable(''),
		customLabel = (q: string) => `Use “${q}”`,
		options,
		placeholder = 'Search…',
		label,
		helperText,
		validationState = 'default',
		disabled = false,
		required = false,
		class: className
	}: Props = $props();

	const autoId = nextDomId('ds-combobox');
	const resolvedId = $derived(id ?? autoId);
	const helperId = $derived(helperText ? `${resolvedId}-help` : undefined);
	const listboxId = $derived(`${resolvedId}-listbox`);

	let rootEl: HTMLDivElement | undefined = $state();
	let open = $state(false);
	let query = $state('');
	let activeIndex = $state(0);

	const selectedOption = $derived(options.find((o) => o.value === value));
	// the visible field shows the search text while open, and once closed either
	// the chosen option's label or the free text that was taken instead
	const displayValue = $derived(open ? query : (selectedOption?.label ?? custom ?? ''));

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((o) => o.label.toLowerCase().includes(q));
	});

	/**
	 * The list as navigated by keyboard and mouse: the matching options, plus
	 * the free-text offer when there is something to offer. Kept as one array so
	 * arrow keys and Enter do not need to know which kind they are on.
	 *
	 * Suppressed on an exact label match -- offering "Add hololive production"
	 * directly under the real hololive production is how duplicates get made.
	 */
	type Entry = { kind: 'option'; option: SelectOption } | { kind: 'custom'; text: string };
	const entries = $derived.by<Entry[]>(() => {
		const list: Entry[] = filtered.map((option) => ({ kind: 'option', option }));
		const trimmed = query.trim();
		if (!allowCustom || trimmed.length === 0) return list;
		const exact = options.some((o) => o.label.trim().toLowerCase() === trimmed.toLowerCase());
		if (exact) return list;
		list.push({ kind: 'custom', text: trimmed });
		return list;
	});

	const validationRing = {
		default: 'border-ds-border focus-visible:ring-ds-primary',
		error: 'border-ds-error focus-visible:ring-ds-error',
		success: 'border-ds-success focus-visible:ring-ds-success'
	} as const;

	function openList() {
		if (disabled) return;
		query = '';
		open = true;
		activeIndex = Math.max(
			options.findIndex((o) => o.value === value),
			0
		);
	}

	function closeList() {
		open = false;
		query = '';
	}

	function choose(entry: Entry) {
		// exactly one of the two carries the answer, always
		if (entry.kind === 'option') {
			value = entry.option.value;
			custom = '';
		} else {
			value = '';
			custom = entry.text;
		}
		closeList();
	}

	function onDocClick(e: MouseEvent) {
		if (!open) return;
		const target = e.target as Node | null;
		if (target && rootEl && !rootEl.contains(target)) closeList();
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'Enter') {
				e.preventDefault();
				openList();
			}
			return;
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			closeList();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, entries.length - 1);
			return;
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
			return;
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			const entry = entries[activeIndex];
			if (entry) choose(entry);
		}
	}
</script>

<svelte:document onclick={onDocClick} />

<div class={cn('flex flex-col gap-1.5', className)} bind:this={rootEl}>
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
		<input
			id={resolvedId}
			type="text"
			role="combobox"
			aria-expanded={open}
			aria-controls={listboxId}
			aria-autocomplete="list"
			aria-invalid={validationState === 'error'}
			aria-describedby={helperId}
			autocomplete="off"
			{disabled}
			{required}
			placeholder={selectedOption ? undefined : placeholder}
			value={displayValue}
			oninput={(e) => {
				query = e.currentTarget.value;
				open = true;
				activeIndex = 0;
			}}
			onfocus={openList}
			onkeydown={onKeydown}
			class={cn(
				'w-full rounded-ds-md border-2 bg-ds-surface px-3.5 py-2.5 text-sm text-ds-text shadow-ds-sm transition-shadow duration-ds-fast placeholder:text-ds-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-ds-bg',
				validationRing[validationState]
			)}
		/>
		<!-- the visible input above carries no name (its value is a label, not
		     the submitted value) and native `required` on a hidden input is a
		     no-op per spec, so validation lives on the visible field instead -->
		<input type="hidden" {name} value={value ?? ''} />
		{#if open}
			<ul
				id={listboxId}
				role="listbox"
				class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-ds-md border-2 border-ds-border bg-ds-surface py-1 shadow-ds-md"
			>
				{#if entries.length === 0}
					<li class="px-3.5 py-2 text-sm text-ds-text-muted">No matches</li>
				{:else}
					{#each entries as entry, i (entry.kind === 'option' ? entry.option.value : '\u0000custom')}
						<li
							role="option"
							aria-selected={entry.kind === 'option' && entry.option.value === value}
						>
							<button
								type="button"
								class={cn(
									'flex w-full px-3.5 py-2 text-left text-sm hover:bg-ds-surface-elevated',
									i === activeIndex && 'bg-ds-surface-elevated',
									entry.kind === 'custom'
										? 'border-t border-ds-border font-semibold text-ds-primary'
										: 'text-ds-text',
									entry.kind === 'option' && entry.option.value === value && 'font-semibold'
								)}
								onclick={() => choose(entry)}
								onmouseenter={() => (activeIndex = i)}
							>
								{entry.kind === 'option' ? entry.option.label : customLabel(entry.text)}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		{/if}
	</div>
	{#if helperText}
		<p
			id={helperId}
			class={cn(
				'text-xs',
				validationState === 'error' && 'text-ds-error',
				validationState === 'success' && 'text-ds-success',
				validationState === 'default' && 'text-ds-text-muted'
			)}
			role={validationState === 'error' ? 'alert' : undefined}
		>
			{helperText}
		</p>
	{/if}
</div>
