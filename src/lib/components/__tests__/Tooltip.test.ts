// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Tooltip from '../Tooltip.svelte';
import { createRawSnippet } from 'svelte';

const trigger = createRawSnippet(() => ({
	render: () => '<button type="button" disabled>Fill empty slots</button>'
}));

describe('Tooltip', () => {
	afterEach(() => cleanup());

	it('exposes the text to assistive tech, not just on hover', () => {
		render(Tooltip, { props: { text: 'Becomes available once submissions close.', children: trigger } });
		expect(screen.getByRole('tooltip').textContent).toContain('submissions close');
	});

	/**
	 * The whole reason this component wraps instead of decorating: the control it
	 * explains is usually disabled, and a disabled element gets no pointer
	 * events -- anything hung on it would never show.
	 */
	it('wraps the trigger rather than sitting on it', () => {
		const { container } = render(Tooltip, { props: { text: 'why', children: trigger } });
		const wrapper = container.querySelector('[aria-describedby]');
		expect(wrapper).not.toBeNull();
		expect(wrapper!.querySelector('button')).not.toBeNull();
	});

	it('ties the description to the wrapper by id', () => {
		const { container } = render(Tooltip, { props: { text: 'why', children: trigger } });
		const wrapper = container.querySelector('[aria-describedby]')!;
		expect(screen.getByRole('tooltip').id).toBe(wrapper.getAttribute('aria-describedby'));
	});

	it('opens on focus as well as hover', () => {
		render(Tooltip, { props: { text: 'why', children: trigger } });
		const cls = screen.getByRole('tooltip').className;
		expect(cls).toContain('group-hover:opacity-100');
		expect(cls).toContain('group-focus-within:opacity-100');
	});

	// an enabled button needs no explanation, and an empty bubble is worse than none
	it('renders nothing extra when there is no text', () => {
		const { container } = render(Tooltip, { props: { children: trigger } });
		expect(screen.queryByRole('tooltip')).toBeNull();
		expect(container.querySelector('button')).not.toBeNull();
	});
});
