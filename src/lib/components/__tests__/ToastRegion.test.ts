// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import { tick } from 'svelte';
import ToastRegion from '../ToastRegion.svelte';
import { clearToasts, toasts } from '../toast-state';

describe('ToastRegion', () => {
	afterEach(() => {
		cleanup();
		clearToasts();
	});

	it('renders pushed toasts', async () => {
		render(ToastRegion);
		toasts.push({ variant: 'info', message: 'Saved' });
		await tick();
		expect(screen.getByText('Saved')).toBeTruthy();
	});
});
