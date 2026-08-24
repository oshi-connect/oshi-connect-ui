<script lang="ts">
	import { cn } from './cn';
	import { dismissToast, toasts, type ToastVariant } from './toast-state';

	const variantClass: Record<ToastVariant, string> = {
		success: 'border-ds-success/40 bg-ds-surface text-ds-text',
		error: 'border-ds-error/50 bg-ds-surface text-ds-text',
		warning: 'border-ds-warning/50 bg-ds-surface text-ds-text',
		info: 'border-ds-secondary/50 bg-ds-surface text-ds-text'
	};

	const dotClass: Record<ToastVariant, string> = {
		success: 'bg-ds-success',
		error: 'bg-ds-error',
		warning: 'bg-ds-warning',
		info: 'bg-ds-secondary'
	};
</script>

<div
	class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
	aria-live="polite"
	aria-relevant="additions"
>
	{#each $toasts as t (t.id)}
		<div
			class={cn(
				'pointer-events-auto flex items-start gap-3 rounded-ds-md border-2 p-3 shadow-ds-lg',
				variantClass[t.variant]
			)}
			role={t.variant === 'error' ? 'alert' : 'status'}
		>
			<span
				class={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotClass[t.variant])}
				aria-hidden="true"
			></span>
			<p class="min-w-0 flex-1 text-sm leading-snug">{t.message}</p>
			<button
				type="button"
				class="shrink-0 rounded-ds-sm px-2 py-0.5 text-xs font-semibold text-ds-text-muted hover:bg-ds-surface-elevated"
				onclick={() => dismissToast(t.id)}
			>
				Dismiss
			</button>
		</div>
	{/each}
</div>
