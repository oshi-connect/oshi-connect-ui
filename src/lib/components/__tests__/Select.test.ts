// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Select from '../Select.svelte';

describe('Select', () => {
	afterEach(() => cleanup());

	it('renders options', () => {
		render(Select, {
			props: {
				label: 'Tier',
				options: [
					{ value: 'a', label: 'A' },
					{ value: 'b', label: 'B' }
				]
			}
		});
		expect(screen.getByRole('combobox')).toBeTruthy();
		expect(screen.getByRole('option', { name: 'A' })).toBeTruthy();
	});
});
