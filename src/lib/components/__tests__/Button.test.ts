// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import Button from '../Button.svelte';

describe('Button', () => {
	afterEach(() => cleanup());

	it('renders without errors', () => {
		render(Button, { props: {} });
		const button = screen.getByRole('button');
		expect(button).toBeTruthy();
	});

	it('applies primary surface styles', () => {
		render(Button, { props: { variant: 'primary' } });
		const button = screen.getByRole('button');
		expect(button.className).toContain('bg-ds-primary');
	});

	it('applies danger surface styles', () => {
		render(Button, { props: { variant: 'danger' } });
		const button = screen.getByRole('button');
		expect(button.className).toContain('bg-ds-error');
	});

	it('defaults to type button', () => {
		render(Button, { props: {} });
		const button = screen.getByRole('button');
		expect(button.getAttribute('type')).toBe('button');
	});

	it('can be disabled', () => {
		render(Button, { props: { disabled: true } });
		const button = screen.getByRole('button');
		expect((button as HTMLButtonElement).disabled).toBe(true);
	});

	it('sets aria-busy when loading', () => {
		render(Button, { props: { loading: true } });
		const button = screen.getByRole('button');
		expect(button.getAttribute('aria-busy')).toBe('true');
		expect((button as HTMLButtonElement).disabled).toBe(true);
	});

	it('renders a tooltip when tooltip text is set', () => {
		render(Button, { props: { tooltip: 'Assets' } });
		expect(screen.getByRole('tooltip').textContent).toBe('Assets');
	});

	it('omits native title when tooltip is set', () => {
		render(Button, { props: { tooltip: 'Assets', title: 'ignored' } });
		const button = screen.getByRole('button');
		expect(button.getAttribute('title')).toBeNull();
		expect(screen.getByRole('tooltip').textContent).toBe('Assets');
	});

	it('keeps native title when tooltip is absent', () => {
		render(Button, { props: { title: 'Assets' } });
		expect(screen.getByRole('button').getAttribute('title')).toBe('Assets');
		expect(screen.queryByRole('tooltip')).toBeNull();
	});
});
