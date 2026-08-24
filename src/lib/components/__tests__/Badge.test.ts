// @vitest-environment happy-dom
import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Badge from '../Badge.svelte';

describe('Badge', () => {
	afterEach(() => cleanup());

	it('applies variant styles', () => {
		const { container } = render(Badge, { props: { variant: 'error' } });
		const span = container.querySelector('span');
		expect(span?.className).toContain('bg-ds-error');
	});
});
