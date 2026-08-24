// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Avatar from '../Avatar.svelte';

describe('Avatar', () => {
	afterEach(() => cleanup());

	it('renders initials fallback with accessible name', () => {
		render(Avatar, { props: { initials: 'MV', alt: 'Miruv' } });
		const el = screen.getByRole('img', { name: 'Miruv' });
		expect(el.textContent).toContain('MV');
	});
});
