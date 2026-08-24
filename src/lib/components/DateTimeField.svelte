<script lang="ts">
	/**
	 * A wall clock typed by hand: a date box and a time box, both plain text.
	 *
	 * No `type="date"`, and so no calendar popup and no locale guessing. The
	 * format is printed under the field (`DD.MM.YYYY`) because the same digits
	 * mean different days on either side of the Atlantic and the browser's own
	 * date control never says which order it wants.
	 *
	 * The value stays a single `YYYY-MM-DDTHH:mm` wall clock, so the form and the
	 * server keep the contract they already had -- a hidden input carries it, and
	 * nothing downstream knows this is two boxes.
	 */
	import X from '@lucide/svelte/icons/x';
	import { cn } from './cn';
	import { nextDomId } from './next-id';
	import { joinWallClock, splitWallClock } from '../datetime/wall-clock.js';
	import {
		DATE_PLACEHOLDER,
		TIME_PLACEHOLDER,
		formatDateForDisplay,
		maskDateInput,
		maskTimeInput,
		parseDisplayDate,
		parseDisplayTime,
		type WallClockParts
	} from '../datetime/manual-entry.js';

	interface Props {
		/** wall clock, `YYYY-MM-DDTHH:mm`, or '' while incomplete */
		value?: string;
		/** the halves, exposed so a caller can seed another field from a partial one */
		parts?: WallClockParts;
		/** submitted under this name, as the combined wall clock */
		name?: string;
		label?: string;
		helperText?: string;
		validationState?: 'default' | 'error' | 'success';
		disabled?: boolean;
		required?: boolean;
		/** offers a Clear button -- for the fields where empty is a real answer */
		clearable?: boolean;
		class?: string;
		onchange?: (value: string, parts: WallClockParts) => void;
	}

	let {
		value = $bindable(''),
		parts = $bindable({ date: '', time: '' }),
		name,
		label,
		helperText,
		validationState = 'default',
		disabled = false,
		required = false,
		clearable = false,
		class: className,
		onchange
	}: Props = $props();

	const autoId = nextDomId('ds-datetime');
	const dateId = $derived(`${autoId}-date`);
	const timeId = $derived(`${autoId}-time`);
	const helperId = $derived(helperText ? `${autoId}-help` : undefined);

	// What is in the boxes, as typed. Kept apart from the ISO parts because a
	// half-written "31.12.20" is a legitimate thing to be looking at and has no
	// ISO form yet.
	let dateText = $state(formatDateForDisplay(splitWallClock(value).date));
	let timeText = $state(splitWallClock(value).time);

	/**
	 * What the boxes currently amount to. Derived from the text rather than read
	 * off `parts`, because `parts` is an outward binding and effects do not run
	 * during server rendering -- taking the hidden input's value from it left
	 * every untouched field submitting an empty string.
	 */
	const shownParts = $derived<WallClockParts>({
		date: parseDisplayDate(dateText),
		time: parseDisplayTime(timeText)
	});

	function currentParts(): WallClockParts {
		return { date: parseDisplayDate(dateText), time: parseDisplayTime(timeText) };
	}

	// seeded here and not only from publish(), for the same reason: a caller
	// binding `parts` has to see them on the first render, not after an edit
	parts = currentParts();

	function publish(next: WallClockParts) {
		parts = next;
		const joined = joinWallClock(next.date, next.time);
		if (joined !== value) value = joined;
		onchange?.(joined, next);
	}

	function commit() {
		publish(currentParts());
	}

	function onDateInput(e: Event & { currentTarget: HTMLInputElement }) {
		dateText = maskDateInput(e.currentTarget.value);
		commit();
	}

	function onTimeInput(e: Event & { currentTarget: HTMLInputElement }) {
		timeText = maskTimeInput(e.currentTarget.value);
		commit();
	}

	function clear() {
		dateText = '';
		timeText = '';
		publish({ date: '', time: '' });
	}

	// The value can also move from the outside -- a form seeded from a saved
	// event, or a parent writing into bind:value. Adopted only when it actually
	// disagrees with what is on screen, so typing is never fought mid-word.
	$effect(() => {
		const incoming = splitWallClock(value);
		const shown = currentParts();
		if (incoming.date === shown.date && incoming.time === shown.time) return;
		if (value.length === 0) return; // cleared by us; leave a half-typed pair alone
		dateText = formatDateForDisplay(incoming.date);
		timeText = incoming.time;
		parts = incoming;
	});

	const hasContent = $derived(dateText.length > 0 || timeText.length > 0);

	const fieldRing = {
		default: 'border-ds-border focus-visible:ring-ds-primary',
		error: 'border-ds-error focus-visible:ring-ds-error',
		success: 'border-ds-success focus-visible:ring-ds-success'
	} as const;

	const fieldClass = $derived(
		cn(
			'w-full rounded-ds-md border-2 bg-ds-surface px-3.5 py-2.5 text-sm tabular-nums text-ds-text shadow-ds-sm transition-shadow duration-ds-fast placeholder:text-ds-text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-ds-bg',
			fieldRing[validationState]
		)
	);
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
	{#if label}
		<div class="flex items-center justify-between gap-2">
			<span class="text-sm font-semibold text-ds-text" id={`${autoId}-label`}>{label}</span>
			{#if clearable && hasContent && !disabled}
				<button
					type="button"
					onclick={clear}
					class="inline-flex items-center gap-1 text-xs font-semibold text-ds-text-muted hover:text-ds-error"
				>
					<X class="h-3 w-3" aria-hidden="true" />
					Clear
				</button>
			{/if}
		</div>
	{/if}
	<div
		class="grid grid-cols-[1.4fr_1fr] gap-2"
		role="group"
		aria-labelledby={label ? `${autoId}-label` : undefined}
	>
		<div class="flex flex-col gap-1">
			<label for={dateId} class="text-xs font-semibold text-ds-text-muted">
				Date <span class="font-normal">({DATE_PLACEHOLDER})</span>
			</label>
			<input
				id={dateId}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				maxlength={10}
				placeholder={DATE_PLACEHOLDER}
				value={dateText}
				oninput={onDateInput}
				{disabled}
				{required}
				class={fieldClass}
				aria-invalid={validationState === 'error'}
				aria-describedby={helperId}
			/>
		</div>
		<div class="flex flex-col gap-1">
			<label for={timeId} class="text-xs font-semibold text-ds-text-muted">
				Time <span class="font-normal">({TIME_PLACEHOLDER})</span>
			</label>
			<input
				id={timeId}
				type="text"
				inputmode="numeric"
				autocomplete="off"
				maxlength={5}
				placeholder={TIME_PLACEHOLDER}
				value={timeText}
				oninput={onTimeInput}
				{disabled}
				{required}
				class={fieldClass}
				aria-invalid={validationState === 'error'}
				aria-describedby={helperId}
			/>
		</div>
	</div>
	{#if name}
		<input type="hidden" {name} value={joinWallClock(shownParts.date, shownParts.time)} />
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
