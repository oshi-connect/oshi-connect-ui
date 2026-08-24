// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Spinner from '../Spinner.svelte';

describe('Spinner', () => {
	afterEach(() => cleanup());

	it('exposes accessible name by default', () => {
		render(Spinner, { props: {} });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeTruthy();
	});

	it('can be hidden from a11y tree', () => {
		render(Spinner, { props: { 'aria-hidden': true } });
		expect(screen.queryByRole('img')).toBeNull();
	});
});
