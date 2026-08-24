// @vitest-environment happy-dom
import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Card from '../Card.svelte';

describe('Card', () => {
	afterEach(() => cleanup());

	it('renders as article', () => {
		const { container } = render(Card);
		expect(container.querySelector('article')).toBeTruthy();
	});
});
