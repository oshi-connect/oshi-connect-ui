<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SelectOption } from './form.types';
	import { cn } from './cn';
	import Button from './Button.svelte';

	interface Props {
		items: SelectOption[];
		value?: string;
		open?: boolean;
		disabled?: boolean;
		triggerLabel?: string;
		align?: 'start' | 'end';
		class?: string;
		menuClass?: string;
		trigger?: Snippet;
		onselect?: (value: string) => void;
	}

	let {
		items,
		value = $bindable(''),
		open = $bindable(false),
		disabled = false,
		triggerLabel = 'Open menu',
		align = 'start',
		class: className,
		menuClass,
		trigger,
		onselect
	}: Props = $props();

	let rootEl: HTMLDivElement | undefined = $state();
	let activeIndex = $state(0);

	const selectedLabel = $derived(
		items.find((i) => i.value === value)?.label ?? triggerLabel
	);

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			const i = items.findIndex((x) => x.value === value);
			activeIndex = i >= 0 ? i : 0;
		}
	}

	function choose(v: string, index: number) {
		value = v;
		activeIndex = index;
		open = false;
		onselect?.(v);
	}

	function onDocClick(e: MouseEvent) {
		if (!open) return;
		const t = e.target as Node | null;
		if (t && rootEl && !rootEl.contains(t)) open = false;
	}

	function onWinKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, items.length - 1);
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		}
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const opt = items[activeIndex];
			if (opt) choose(opt.value, activeIndex);
		}
	}
</script>

<svelte:document onclick={onDocClick} />
<svelte:window onkeydown={onWinKeydown} />

<div class={cn('relative inline-block text-left', className)} bind:this={rootEl}>
	{#if trigger}
		<button
			type="button"
			class="inline-flex items-center gap-1"
			aria-haspopup="menu"
			aria-expanded={open}
			aria-label={triggerLabel}
			{disabled}
			onclick={toggle}
		>
			{@render trigger()}
		</button>
	{:else}
		<Button variant="secondary" size="md" {disabled} onclick={toggle} aria-haspopup="menu" aria-expanded={open}>
			{selectedLabel}
		</Button>
	{/if}

	{#if open && items.length > 0}
		<div
			role="menu"
			class={cn(
				'absolute z-50 mt-2 min-w-40 rounded-ds-md border-2 border-ds-border bg-ds-surface py-1 shadow-ds-md',
				align === 'end' ? 'right-0' : 'left-0',
				menuClass
			)}
		>
			{#each items as opt, i (opt.value)}
				<button
					type="button"
					role="menuitem"
					class={cn(
						'flex w-full px-3 py-2 text-left text-sm text-ds-text hover:bg-ds-surface-elevated focus-visible:bg-ds-surface-elevated focus-visible:outline-none',
						i === activeIndex && 'bg-ds-surface-elevated'
					)}
					onclick={() => choose(opt.value, i)}
					onmouseenter={() => (activeIndex = i)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
