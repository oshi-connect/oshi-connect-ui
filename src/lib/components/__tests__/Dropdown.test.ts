// @vitest-environment happy-dom
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Dropdown from '../Dropdown.svelte';

describe('Dropdown', () => {
	afterEach(() => cleanup());

	it('opens menu and exposes menu items', async () => {
		render(Dropdown, {
			props: {
				items: [
					{ value: 'a', label: 'Alpha' },
					{ value: 'b', label: 'Beta' }
				],
				open: true
			}
		});
		expect(screen.getByRole('menuitem', { name: 'Alpha' })).toBeTruthy();
		expect(screen.getByRole('menuitem', { name: 'Beta' })).toBeTruthy();
	});

	it('toggle button updates aria-expanded', async () => {
		render(Dropdown, {
			props: {
				items: [{ value: 'x', label: 'X' }],
				open: false
			}
		});
		const btn = screen.getByRole('button', { name: 'Open menu' });
		expect(btn.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.click(btn);
		expect(btn.getAttribute('aria-expanded')).toBe('true');
	});
});
