// @vitest-environment happy-dom
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect, afterEach, vi } from 'vitest';
import Harness from './ColorPickerHarness.svelte';

function setup(props: { value?: string; disabled?: boolean } = {}) {
	const oninput = vi.fn();
	const onchange = vi.fn();
	render(Harness, { props: { label: 'Color', value: '#ff0000', oninput, onchange, ...props } });
	return {
		oninput,
		onchange,
		swatch: screen.getByRole('button', { name: 'Color' }),
		field: screen.getByRole('textbox') as HTMLInputElement,
		bound: () => screen.getByTestId('bound').textContent
	};
}

async function openPanel(swatch: HTMLElement) {
	await fireEvent.click(swatch);
	await tick();
	const area = screen.getAllByRole('slider').find((el) => el.hasAttribute('aria-valuetext'));
	const hue = screen.getAllByRole('slider').find((el) => el instanceof HTMLInputElement);
	if (!area || !hue) throw new Error('panel controls missing');
	return { area, hue: hue as HTMLInputElement };
}

describe('ColorPicker', () => {
	afterEach(() => cleanup());

	it('shows a closed swatch and the hex', () => {
		const { swatch, field } = setup();
		expect(swatch.getAttribute('aria-expanded')).toBe('false');
		expect(swatch.getAttribute('aria-haspopup')).toBe('dialog');
		expect(field.value).toBe('#ff0000');
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('shows black for an invalid value and calls nothing', () => {
		const { field, oninput, onchange } = setup({ value: 'red' });
		expect(field.value).toBe('#000000');
		expect(oninput).not.toHaveBeenCalled();
		expect(onchange).not.toHaveBeenCalled();
	});

	it('commits typed hex on Enter', async () => {
		const { field, onchange, oninput, bound } = setup();
		await fireEvent.focusIn(field);
		await fireEvent.input(field, { target: { value: '00FF00' } });
		await fireEvent.keyDown(field, { key: 'Enter' });
		await fireEvent.focusOut(field);
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith('#00ff00');
		expect(oninput).not.toHaveBeenCalled();
		expect(bound()).toBe('#00ff00');
		expect(field.value).toBe('#00ff00');
	});

	it('accepts the short form on blur', async () => {
		const { field, onchange } = setup();
		await fireEvent.focusIn(field);
		await fireEvent.input(field, { target: { value: '#0f0' } });
		await fireEvent.focusOut(field);
		expect(onchange).toHaveBeenCalledWith('#00ff00');
	});

	it('restores the value after invalid text on blur', async () => {
		const { field, onchange, bound } = setup();
		await fireEvent.focusIn(field);
		await fireEvent.input(field, { target: { value: 'xyz' } });
		await fireEvent.focusOut(field);
		expect(field.value).toBe('#ff0000');
		expect(onchange).not.toHaveBeenCalled();
		expect(bound()).toBe('#ff0000');
	});

	it('opens the panel from the swatch and focuses the area', async () => {
		const { swatch } = setup();
		const { area, hue } = await openPanel(swatch);
		expect(swatch.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByTestId('open').textContent).toBe('true');
		expect(area.getAttribute('aria-valuetext')).toBe('#ff0000');
		expect(hue.min).toBe('0');
		expect(hue.max).toBe('360');
		expect(document.activeElement).toBe(area);
		expect(screen.getByRole('dialog').textContent?.trim()).toBe('');
	});

	it('steps the area with arrow keys and ends the gesture on key up', async () => {
		const { swatch, oninput, onchange, bound } = setup({ value: '#804040' });
		const { area } = await openPanel(swatch);
		await fireEvent.keyDown(area, { key: 'ArrowRight' });
		expect(oninput).toHaveBeenCalledTimes(1);
		expect(onchange).not.toHaveBeenCalled();
		await fireEvent.keyDown(area, { key: 'ArrowRight', shiftKey: true });
		expect(oninput).toHaveBeenCalledTimes(2);
		await fireEvent.keyUp(area, { key: 'ArrowRight' });
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith(bound());
		expect(area.getAttribute('aria-valuetext')).toBe(bound());
	});

	it('drags the area with the pointer', async () => {
		const { swatch, oninput, onchange } = setup({ value: '#808080' });
		const { area } = await openPanel(swatch);
		area.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }) as DOMRect;
		await fireEvent.pointerDown(area, { clientX: 100, clientY: 0, pointerId: 1, button: 0 });
		await fireEvent.pointerMove(area, { clientX: 50, clientY: 0, pointerId: 1 });
		expect(oninput.mock.calls.map(([v]) => v)).toEqual(['#ff0000', '#ff8080']);
		await fireEvent.pointerUp(area, { clientX: 50, clientY: 0, pointerId: 1 });
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith('#ff8080');
	});

	it('changes the hue from the slider', async () => {
		const { swatch, oninput, onchange } = setup();
		const { hue } = await openPanel(swatch);
		await fireEvent.input(hue, { target: { value: '120' } });
		expect(oninput).toHaveBeenCalledWith('#00ff00');
		await fireEvent.change(hue);
		expect(onchange).toHaveBeenCalledWith('#00ff00');
	});

	it('keeps the hue through black', async () => {
		const { swatch, bound } = setup({ value: '#00ff00' });
		const { area } = await openPanel(swatch);
		for (let i = 0; i < 10; i++) await fireEvent.keyDown(area, { key: 'ArrowDown', shiftKey: true });
		expect(bound()).toBe('#000000');
		await fireEvent.keyDown(area, { key: 'ArrowUp', shiftKey: true });
		expect(bound()).toBe('#001a00');
	});

	it('closes on Escape and returns focus to the swatch', async () => {
		const { swatch } = setup();
		const { area } = await openPanel(swatch);
		await fireEvent.keyDown(area, { key: 'Escape' });
		expect(swatch.getAttribute('aria-expanded')).toBe('false');
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(swatch);
	});

	it('closes on a pointer down outside', async () => {
		const { swatch } = setup();
		await openPanel(swatch);
		await fireEvent.pointerDown(document.body);
		expect(swatch.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes on a second swatch click', async () => {
		const { swatch } = setup();
		await openPanel(swatch);
		await fireEvent.pointerDown(swatch);
		await fireEvent.click(swatch);
		expect(swatch.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(swatch);
	});

	it('does not open when disabled', async () => {
		const { swatch, field } = setup({ disabled: true });
		expect((swatch as HTMLButtonElement).disabled).toBe(true);
		expect(field.disabled).toBe(true);
		await fireEvent.click(swatch);
		expect(swatch.getAttribute('aria-expanded')).toBe('false');
	});

	it('places the panel under the root without the popover API', async () => {
		expect('showPopover' in HTMLElement.prototype).toBe(false);
		const { swatch } = setup();
		await openPanel(swatch);
		const panel = screen.getByRole('dialog');
		expect(panel.hasAttribute('popover')).toBe(false);
		expect(panel.classList.contains('absolute')).toBe(true);
	});

	describe('with the popover API', () => {
		const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
		afterEach(() => {
			delete proto.showPopover;
			delete proto.hidePopover;
		});

		it('shows a top-layer popover one time on open', async () => {
			const show = vi.fn();
			proto.showPopover = show;
			proto.hidePopover = vi.fn();
			const { swatch } = setup();
			await openPanel(swatch);
			const panel = screen.getByRole('dialog');
			expect(show).toHaveBeenCalledTimes(1);
			expect(panel.getAttribute('popover')).toBe('auto');
			expect(panel.classList.contains('fixed')).toBe(true);
		});

		it('follows the native light dismiss', async () => {
			proto.showPopover = vi.fn();
			proto.hidePopover = vi.fn();
			const { swatch } = setup();
			await openPanel(swatch);
			const event = new Event('beforetoggle');
			Object.assign(event, { oldState: 'open', newState: 'closed' });
			await fireEvent(screen.getByRole('dialog'), event);
			expect(swatch.getAttribute('aria-expanded')).toBe('false');
		});
	});
});
