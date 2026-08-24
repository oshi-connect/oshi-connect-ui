// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Textarea from '../Textarea.svelte';

describe('Textarea', () => {
	afterEach(() => cleanup());

	it('shows character count when enabled', () => {
		render(Textarea, {
			props: { label: 'Msg', value: 'ab', maxlength: 10, showCount: true }
		});
		expect(screen.getByText('2 / 10')).toBeTruthy();
	});
});
