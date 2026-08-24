<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from './cn';
	import { nextDomId } from './next-id';

	interface Props {
		open?: boolean;
		title?: string;
		description?: string;
		closeOnBackdrop?: boolean;
		class?: string;
		children?: Snippet;
		footer?: Snippet;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		closeOnBackdrop = true,
		class: className,
		children,
		footer,
		onclose
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();
	const titleId = nextDomId('ds-modal-title');
	const descId = nextDomId('ds-modal-desc');

	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (open) {
			if (!el.open) el.showModal();
		} else if (el.open) {
			el.close();
		}
	});

	function handleDialogClose() {
		open = false;
		onclose?.();
	}

	function onPointerDown(e: PointerEvent & { currentTarget: HTMLDialogElement }) {
		if (!closeOnBackdrop) return;
		if (e.target === e.currentTarget) {
			e.currentTarget.close();
		}
	}
</script>

<dialog
	bind:this={dialogEl}
	class={cn(
		'fixed left-1/2 top-1/2 w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-ds-xl border-2 border-ds-border bg-ds-surface p-0 text-ds-text shadow-ds-lg backdrop:bg-black/40 [[open]]:flex',
		className
	)}
	aria-modal="true"
	aria-labelledby={title ? titleId : undefined}
	aria-describedby={description ? descId : undefined}
	onclose={handleDialogClose}
	onpointerdown={onPointerDown}
>
	<!--
		The whole dialog scrolls, or nothing does.

		It used to be the children alone in a `flex-1 overflow-y-auto` box, which
		meant a dialog whose content fit within a pixel still got a scrollbar --
		flex rounding, not real overflow -- and on a short viewport it cut the body
		into a tiny window while title and footer kept their full height. Capping
		the wrapper instead lets a dialog that fits show no scroll region at all,
		which is the normal case for every dialog in the app.
	-->
	<div
		role="document"
		class="flex max-h-[min(85vh,40rem)] flex-col gap-4 overflow-y-auto overscroll-contain p-6"
		onpointerdown={(e) => e.stopPropagation()}
	>
		<!-- shrink-0 throughout: a column flex item may be squeezed to make the
		     max-height fit, and squeezed text is worse than a scrollbar -->
		{#if title}
			<h2 id={titleId} class="shrink-0 text-xl font-bold text-ds-text">{title}</h2>
		{/if}
		{#if description}
			<p id={descId} class="shrink-0 text-sm text-ds-text-muted">{description}</p>
		{/if}
		<div class="shrink-0 text-sm">
			{@render children?.()}
		</div>
		{#if footer}
			<footer
				class="flex shrink-0 flex-wrap justify-end gap-2 border-t border-ds-border pt-4"
			>
				{@render footer()}
			</footer>
		{/if}
	</div>
</dialog>
