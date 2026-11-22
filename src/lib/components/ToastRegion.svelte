<script lang="ts">
	import { cn } from './cn';
	import { dismissToast, toasts, type ToastVariant } from './toast-state';

	const variantClass: Record<ToastVariant, string> = {
		success: 'border-ds-border text-ds-text',
		error: 'border-ds-error/45 text-ds-text',
		warning: 'border-ds-warning/45 text-ds-text',
		info: 'border-ds-border text-ds-text'
	};
</script>

<div
	class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100%-2rem,20rem)] flex-col gap-2"
	aria-live="polite"
	aria-relevant="additions"
>
	{#each $toasts as t (t.id)}
		<div
			class={cn(
				'pointer-events-auto flex items-center gap-3 rounded-ds-md border bg-ds-surface px-3 py-2.5 shadow-ds-md',
				variantClass[t.variant]
			)}
			role={t.variant === 'error' ? 'alert' : 'status'}
		>
			<p class="min-w-0 flex-1 translate-y-px text-sm leading-none">{t.message}</p>
			<button
				type="button"
				class="shrink-0 translate-y-px rounded-ds-sm px-1.5 text-sm leading-none text-ds-text-muted hover:bg-ds-surface-elevated hover:text-ds-text"
				onclick={() => dismissToast(t.id)}
			>
				Dismiss
			</button>
		</div>
	{/each}
</div>
