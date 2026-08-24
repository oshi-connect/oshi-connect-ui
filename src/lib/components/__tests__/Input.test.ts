// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Input from '../Input.svelte';

describe('Input', () => {
	afterEach(() => cleanup());

	it('associates label with control', () => {
		render(Input, { props: { label: 'Email', id: 'e1' } });
		expect(screen.getByLabelText('Email')).toBeTruthy();
	});

	it('marks invalid when state is error', () => {
		render(Input, { props: { label: 'x', state: 'error', helperText: 'Bad' } });
		expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
		expect(screen.getByRole('alert').textContent).toBe('Bad');
	});
});
