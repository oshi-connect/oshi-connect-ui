import { writable } from 'svelte/store';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
	id: string;
	variant: ToastVariant;
	message: string;
};

const DEFAULT_MS = 5000;

const store = writable<ToastItem[]>([]);

export const toasts = {
	subscribe: store.subscribe,
	push(
		item: Omit<ToastItem, 'id'>,
		durationMs: number = DEFAULT_MS
	): string {
		const id =
			typeof crypto !== 'undefined' && crypto.randomUUID
				? crypto.randomUUID()
				: `toast-${Date.now()}`;
		store.update((list) => [...list, { ...item, id }]);
		if (durationMs > 0) {
			setTimeout(() => dismissToast(id), durationMs);
		}
		return id;
	}
};

export function dismissToast(id: string): void {
	store.update((list) => list.filter((t) => t.id !== id));
}

/** Test helper — clears all queued toasts. */
export function clearToasts(): void {
	store.set([]);
}
