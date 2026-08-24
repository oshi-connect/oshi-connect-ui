// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { tick } from 'svelte';
import Modal from '../Modal.svelte';

describe('Modal', () => {
	afterEach(() => cleanup());

	it('renders title when open', async () => {
		render(Modal, {
			props: { open: true, title: 'Hello', onclose: vi.fn() }
		});
		await tick();
		expect(screen.getByRole('heading', { name: 'Hello' })).toBeTruthy();
	});

	it('calls onclose when Escape closes the dialog', async () => {
		const onclose = vi.fn();
		render(Modal, { props: { open: true, title: 'T', onclose } });
		const dlg = document.querySelector('dialog');
		expect(dlg).toBeTruthy();
		dlg?.dispatchEvent(new Event('close'));
		expect(onclose).toHaveBeenCalled();
	});
});
