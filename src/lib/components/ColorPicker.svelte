<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import Input from './Input.svelte';
	import { cn } from './cn';
	import { nextDomId } from './next-id';
	import { hexToHsv, hsvToHex, parseHex, stepArea, withHex, type Hsv } from './color';
	import { placePanel } from './place-panel';

	interface Props {
		/** lowercase `#rrggbb`; anything else shows `#000000` */
		value?: string;
		label?: string | Snippet;
		/** id of the hex field */
		id?: string;
		disabled?: boolean;
		class?: string;
		open?: boolean;
		/** each change during a drag or a key repeat */
		oninput?: (value: string) => void;
		/** a typed commit, or the end of a gesture that changed the value */
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable('#000000'),
		label,
		id,
		disabled = false,
		class: className,
		open = $bindable(false),
		oninput,
		onchange
	}: Props = $props();

	const autoId = nextDomId('ds-color');
	const fieldId = $derived(id ?? autoId);
	const labelId = $derived(`${fieldId}-label`);
	const panelId = $derived(`${fieldId}-panel`);
	const hasLabel = $derived(label !== undefined && label !== null);

	// Without the popover API (older engines, happy-dom) the panel sits under the root instead.
	const native =
		typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

	const hex = $derived(parseHex(value ?? '') ?? '#000000');
	let hsv = $state<Hsv>(hexToHsv(untrack(() => hex)));
	const hueHex = $derived(hsvToHex({ h: hsv.h, s: 1, v: 1 }));
	let text = $state(untrack(() => hex));
	let pos = $state({ top: 0, left: 0 });

	let rootEl: HTMLDivElement | undefined = $state();
	let swatchEl: HTMLButtonElement | undefined = $state();
	let panelEl: HTMLDivElement | undefined = $state();
	let areaEl: HTMLDivElement | undefined = $state();

	let editing = false;
	let dragging = false;
	let gestureStart: string | null = null;
	let pressOpen: boolean | null = null;

	// An outside value replaces the state only when it is a different color, so gray and black keep the hue.
	$effect(() => {
		const next = hex;
		untrack(() => {
			if (hsvToHex(hsv) !== next) hsv = withHex(hsv, next);
			if (!editing) text = next;
		});
	});

	$effect(() => {
		if (disabled) untrack(() => close(false));
	});

	$effect(() => {
		if (!open || !panelEl) return;
		const panel = panelEl;
		untrack(() => {
			if (native) {
				panel.showPopover();
				place();
			}
			areaEl?.focus();
		});
		const onDocPointerDown = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (target && rootEl && !rootEl.contains(target)) close(false);
		};
		document.addEventListener('pointerdown', onDocPointerDown, true);
		if (native) {
			window.addEventListener('resize', place);
			window.addEventListener('scroll', place, true);
		}
		return () => {
			document.removeEventListener('pointerdown', onDocPointerDown, true);
			window.removeEventListener('resize', place);
			window.removeEventListener('scroll', place, true);
		};
	});

	function place() {
		if (!swatchEl || !panelEl) return;
		const size = panelEl.getBoundingClientRect();
		pos = placePanel(
			swatchEl.getBoundingClientRect(),
			{ width: size.width, height: size.height },
			{ width: window.innerWidth, height: window.innerHeight }
		);
	}

	function update(next: Hsv) {
		hsv = next;
		const out = hsvToHex(next);
		if (out === hex) return;
		value = out;
		oninput?.(out);
	}

	function beginGesture() {
		gestureStart ??= hex;
	}

	function endGesture() {
		const start = gestureStart;
		gestureStart = null;
		if (start !== null && start !== hex) onchange?.(hex);
	}

	function close(restoreFocus: boolean) {
		if (open) {
			dragging = false;
			endGesture();
			open = false;
		}
		if (restoreFocus) swatchEl?.focus();
	}

	function toggle() {
		// The native light dismiss closes the panel on pointer down, before this click.
		const wasOpen = pressOpen ?? open;
		pressOpen = null;
		if (disabled) return;
		if (wasOpen) close(true);
		else open = true;
	}

	function commitText() {
		const next = parseHex(text);
		if (next === null) {
			text = hex;
			return;
		}
		text = next;
		if (next === hex) return;
		hsv = withHex(hsv, next);
		value = next;
		onchange?.(next);
	}

	function pointAt(e: PointerEvent) {
		if (!areaEl) return;
		const r = areaEl.getBoundingClientRect();
		const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
		update({
			...hsv,
			s: clamp01((e.clientX - r.left) / (r.width || 1)),
			v: clamp01(1 - (e.clientY - r.top) / (r.height || 1))
		});
	}

	function onAreaPointerDown(e: PointerEvent & { currentTarget: HTMLDivElement }) {
		if (e.button !== 0) return;
		e.preventDefault();
		e.currentTarget.focus();
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {
			// a synthetic pointer has no capture; the drag still works inside the area
		}
		dragging = true;
		beginGesture();
		pointAt(e);
	}

	function onAreaPointerUp() {
		if (!dragging) return;
		dragging = false;
		endGesture();
	}

	function onAreaKeydown(e: KeyboardEvent) {
		const next = stepArea(hsv, e.key, e.shiftKey);
		if (!next) return;
		e.preventDefault();
		beginGesture();
		update(next);
	}

	function onPanelKeydown(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		e.preventDefault();
		close(true);
	}

	function onBeforeToggle(e: Event) {
		if ((e as ToggleEvent).newState !== 'closed') return;
		close(!!panelEl?.contains(document.activeElement));
	}
</script>

<div bind:this={rootEl} class={cn('relative flex flex-col gap-1.5', className)}>
	{#if hasLabel}
		<label id={labelId} for={fieldId} class="text-sm font-semibold text-ds-text">
			{#if typeof label === 'string'}
				{label}
			{:else}
				{@render label?.()}
			{/if}
		</label>
	{/if}
	<div class="flex items-stretch gap-2">
		<button
			bind:this={swatchEl}
			type="button"
			class="w-11 shrink-0 self-stretch cursor-pointer rounded-ds-md border-2 border-ds-border shadow-ds-sm transition-shadow duration-ds-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg disabled:cursor-not-allowed disabled:opacity-60"
			style:background-color={hex}
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-controls={open ? panelId : undefined}
			aria-labelledby={hasLabel ? labelId : undefined}
			aria-label={hasLabel ? undefined : hex}
			{disabled}
			onpointerdown={() => (pressOpen = open)}
			onclick={toggle}
		></button>
		<div
			class="min-w-0 flex-1"
			onfocusin={() => (editing = true)}
			onfocusout={() => {
				editing = false;
				commitText();
			}}
		>
			<Input
				id={fieldId}
				bind:value={text}
				{disabled}
				autocomplete="off"
				inputClass="tabular-nums"
				onkeydown={(e) => {
					if (e.key !== 'Enter') return;
					e.preventDefault();
					commitText();
				}}
			/>
		</div>
	</div>
	{#if open}
		<div
			bind:this={panelEl}
			id={panelId}
			role="dialog"
			tabindex="-1"
			aria-labelledby={hasLabel ? labelId : undefined}
			popover={native ? 'auto' : undefined}
			class={cn(
				'z-50 flex w-60 flex-col gap-3 rounded-ds-md border-2 border-ds-border bg-ds-surface p-3 text-ds-text shadow-ds-md',
				native ? 'fixed m-0' : 'absolute left-0 top-full mt-2'
			)}
			style={native ? `inset: auto; top: ${pos.top}px; left: ${pos.left}px` : undefined}
			onbeforetoggle={onBeforeToggle}
			onkeydown={onPanelKeydown}
		>
			<div
				bind:this={areaEl}
				role="slider"
				tabindex="0"
				aria-labelledby={hasLabel ? labelId : undefined}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(hsv.s * 100)}
				aria-valuetext={hex}
				class="area relative h-36 w-full cursor-crosshair touch-none rounded-ds-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ds-surface"
				style:background-color={hueHex}
				onpointerdown={onAreaPointerDown}
				onpointermove={(e) => dragging && pointAt(e)}
				onpointerup={onAreaPointerUp}
				onpointercancel={onAreaPointerUp}
				onlostpointercapture={onAreaPointerUp}
				onkeydown={onAreaKeydown}
				onkeyup={(e) => e.key.startsWith('Arrow') && endGesture()}
			>
				<span
					class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ds-surface shadow-ds-sm ring-1 ring-ds-text"
					style:left="{hsv.s * 100}%"
					style:top="{(1 - hsv.v) * 100}%"
					style:background-color={hex}
				></span>
			</div>
			<input
				type="range"
				min="0"
				max="360"
				step="1"
				value={Math.round(hsv.h)}
				aria-labelledby={hasLabel ? labelId : undefined}
				class="hue h-3 w-full cursor-pointer rounded-full"
				style:--hue-thumb={hueHex}
				{disabled}
				oninput={(e) => {
					beginGesture();
					update({ ...hsv, h: Number(e.currentTarget.value) });
				}}
				onchange={endGesture}
			/>
		</div>
	{/if}
</div>

<style>
	/* The gradients are the color data of the two controls. */
	.area {
		background-image:
			linear-gradient(to top, rgb(0 0 0), transparent),
			linear-gradient(to right, rgb(255 255 255), transparent);
	}

	.hue {
		appearance: none;
		background: linear-gradient(
			to right,
			rgb(255 0 0),
			rgb(255 255 0),
			rgb(0 255 0),
			rgb(0 255 255),
			rgb(0 0 255),
			rgb(255 0 255),
			rgb(255 0 0)
		);
	}

	.hue:focus-visible {
		outline: 2px solid var(--ds-color-primary);
		outline-offset: 2px;
	}

	.hue::-webkit-slider-thumb {
		appearance: none;
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--ds-color-surface);
		border-radius: 9999px;
		background: var(--hue-thumb);
		box-shadow: 0 0 0 1px var(--ds-color-text);
	}

	.hue::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--ds-color-surface);
		border-radius: 9999px;
		background: var(--hue-thumb);
		box-shadow: 0 0 0 1px var(--ds-color-text);
	}
</style>
