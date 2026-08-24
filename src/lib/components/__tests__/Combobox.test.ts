// @vitest-environment happy-dom
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Combobox from '../Combobox.svelte';

const ORGS = [
	{ value: 'org_holo', label: 'hololive production' },
	{ value: 'org_holo_en', label: 'hololive English' },
	{ value: 'org_niji', label: 'NIJISANJI' }
];

async function type(text: string) {
	const input = screen.getByRole('combobox');
	await fireEvent.focus(input);
	await fireEvent.input(input, { target: { value: text } });
	return input;
}

describe('Combobox', () => {
	afterEach(() => cleanup());

	// the timezone picker relies on this: a closed set, nothing invented
	describe('without allowCustom', () => {
		it('filters to matching options and offers nothing else', async () => {
			render(Combobox, { props: { options: ORGS, label: 'Org' } });
			await type('holo');

			expect(screen.getAllByRole('option')).toHaveLength(2);
			expect(screen.queryByText(/Use “/)).toBeNull();
		});

		it('reports no matches rather than offering the typed text', async () => {
			render(Combobox, { props: { options: ORGS, label: 'Org' } });
			await type('something else entirely');

			expect(screen.getByText('No matches')).toBeTruthy();
		});
	});

	describe('with allowCustom', () => {
		it('offers the typed text as a last resort', async () => {
			render(Combobox, { props: { options: ORGS, label: 'Org', allowCustom: true } });
			await type('Cover Corp');

			const options = screen.getAllByRole('option');
			expect(options).toHaveLength(1);
			expect(options[0]!.textContent).toContain('Cover Corp');
		});

		/**
		 * The duplicate guard. Offering "add hololive production" directly under
		 * the real hololive production is precisely how a roster acquires
		 * look-alikes, and the free entry would carry none of the real one's
		 * meaning -- no org id, no free access, no link.
		 */
		it('withholds the offer when the text already names an option', async () => {
			render(Combobox, { props: { options: ORGS, label: 'Org', allowCustom: true } });
			await type('hololive production');

			const options = screen.getAllByRole('option');
			expect(options).toHaveLength(1);
			expect(options[0]!.textContent).toBe('hololive production');
		});

		it('ignores case and surrounding space when deciding that', async () => {
			render(Combobox, { props: { options: ORGS, label: 'Org', allowCustom: true } });
			await type('  HOLOLIVE PRODUCTION  ');

			expect(screen.getAllByRole('option')).toHaveLength(1);
		});

		it('offers nothing while the field is empty', async () => {
			render(Combobox, { props: { options: ORGS, label: 'Org', allowCustom: true } });
			await type('');

			expect(screen.getAllByRole('option')).toHaveLength(ORGS.length);
		});

		it('uses the caller’s wording for the offer', async () => {
			render(Combobox, {
				props: {
					options: ORGS,
					label: 'Org',
					allowCustom: true,
					customLabel: (q: string) => `Add ${q} as a guest`
				}
			});
			await type('Cover Corp');

			expect(screen.getByText('Add Cover Corp as a guest')).toBeTruthy();
		});
	});
});
