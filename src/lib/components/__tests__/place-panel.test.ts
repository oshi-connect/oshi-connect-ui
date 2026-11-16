import { describe, it, expect } from 'vitest';
import { placePanel } from '../place-panel';

const viewport = { width: 800, height: 600 };
const panel = { width: 240, height: 200 };
const anchor = (top: number, left: number) => ({ top, left, bottom: top + 30, right: left + 36 });

describe('placePanel', () => {
	it('puts the panel below the anchor when it fits', () => {
		expect(placePanel(anchor(100, 50), panel, viewport)).toEqual({ top: 138, left: 50 });
	});

	it('flips above when below does not fit', () => {
		expect(placePanel(anchor(500, 50), panel, viewport)).toEqual({ top: 292, left: 50 });
	});

	it('stays in the viewport when neither side fits', () => {
		const small = { width: 800, height: 260 };
		expect(placePanel(anchor(120, 50), panel, small)).toEqual({ top: 52, left: 50 });
	});

	it('moves left at the right edge and right at the left edge', () => {
		expect(placePanel(anchor(100, 700), panel, viewport).left).toBe(552);
		expect(placePanel(anchor(100, -20), panel, viewport).left).toBe(8);
	});
});
