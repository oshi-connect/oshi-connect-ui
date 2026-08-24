<script lang="ts">
	/**
	 * A select whose popup is ours, not the browser's.
	 *
	 * `<select>` draws its list with the operating system, so it ignores the
	 * design system entirely -- wrong typeface, wrong radii, and in dark mode a
	 * white sheet on a dark page. Everything except the popup can be styled,
	 * which is exactly the half that shows.
	 *
	 * A listbox rather than a menu: this picks a value, it does not run commands,
	 * and screen readers announce the two differently. The value rides in a
	 * hidden input so the form still submits a plain string.
	 */
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { SelectOption } from './form.types';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		value?: string;
		options: SelectOption[];
		name?: string;
		label?: string;
		placeholder?: string;
		helperText?: string;
		validationState?: 'default' | 'error' | 'success';
		disabled?: boolean;
		class?: string;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		options,
		name,
		label,
		placeholder = 'Select…',
		helperText,
		validationState = 'default',
		disabled = false,
		class: className,
		onchange
	}: Props = $props();

	const autoId = nextDomId('ds-selectmenu');
	const listboxId = $derived(`${autoId}-listbox`);
	const helperId = $derived(helperText ? `${autoId}-help` : undefined);

	let rootEl: HTMLDivElement | undefined = $state();
	let buttonEl: HTMLButtonElement | undefined = $state();
	let open = $state(false);
	let activeIndex = $state(0);

	const selected = $derived(options.find((o) => o.value === value));

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			const i = options.findIndex((o) => o.value === value);
			activeIndex = i >= 0 ? i : 0;
		}
	}

	function choose(index: number) {
		const opt = options[index];
		if (!opt) return;
		value = opt.value;
		open = false;
		onchange?.(opt.value);
		buttonEl?.focus();
	}

	function onDocPointerDown(e: Event) {
		if (!open) return;
		const target = e.target as Node | null;
		if (target && rootEl && !rootEl.contains(target)) open = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (disabled) return;

		if (!open) {
			// the keys that open a native select, so muscle memory carries over
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggle();
			}
			return;
		}

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				open = false;
				buttonEl?.focus();
				break;
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = Math.min(activeIndex + 1, options.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = Math.max(activeIndex - 1, 0);
				break;
			case 'Home':
				e.preventDefault();
				activeIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				activeIndex = options.length - 1;
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				choose(activeIndex);
				break;
			case 'Tab':
				// leaving the field commits nothing and closes, like a native select
				open = false;
				break;
		}
	}

	const stateRing = {
		default: 'border-ds-border focus-visible:ring-ds-primary',
		error: 'border-ds-error focus-visible:ring-ds-error',
		success: 'border-ds-success focus-visible:ring-ds-success'
	} as const;
</script>

<svelte:document onpointerdown={onDocPointerDown} />

<div class={cn('flex flex-col gap-1.5', className)} bind:this={rootEl}>
	{#if label}
		<span class="text-sm font-semibold text-ds-text" id={`${autoId}-label`}>{label}</span>
	{/if}
	<div class="relative">
		<button
			bind:this={buttonEl}
			type="button"
			id={autoId}
			{disabled}
			onclick={toggle}
			onkeydown={onKeydown}
			role="combobox"
			aria-controls={listboxId}
			aria-expanded={open}
			aria-haspopup="listbox"
			aria-labelledby={label ? `${autoId}-label ${autoId}` : undefined}
			aria-describedby={helperId}
			aria-invalid={validationState === 'error'}
			class={cn(
				'flex w-full items-center justify-between gap-2 rounded-ds-md border-2 bg-ds-surface px-3.5 py-2.5 text-left text-sm text-ds-text shadow-ds-sm transition-shadow duration-ds-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-ds-bg',
				stateRing[validationState]
			)}
		>
			<span class={cn('truncate', !selected && 'text-ds-text-muted/60')}>
				{selected?.label ?? placeholder}
			</span>
			<ChevronDown
				class={cn('h-4 w-4 shrink-0 text-ds-text-muted transition-transform', open && 'rotate-180')}
				aria-hidden="true"
			/>
		</button>

		{#if open}
			<ul
				id={listboxId}
				role="listbox"
				tabindex="-1"
				aria-labelledby={label ? `${autoId}-label` : undefined}
				aria-activedescendant={`${autoId}-opt-${activeIndex}`}
				class="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-ds-md border-2 border-ds-border bg-ds-surface py-1 shadow-ds-md"
			>
				{#each options as opt, i (opt.value)}
					<!-- the whole keyboard contract lives on the combobox button above,
					     which is what holds focus while this list is open -- that is the
					     listbox pattern, and putting handlers on the options too would
					     make each one a tab stop the pattern says it must not be -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<li
						id={`${autoId}-opt-${i}`}
						role="option"
						aria-selected={opt.value === value}
						class={cn(
							'flex cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm text-ds-text',
							i === activeIndex && 'bg-ds-surface-elevated'
						)}
						onpointerenter={() => (activeIndex = i)}
						onclick={() => choose(i)}
					>
						<span class="truncate">{opt.label}</span>
						{#if opt.value === value}
							<Check class="h-4 w-4 shrink-0 text-ds-primary" aria-hidden="true" />
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
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
