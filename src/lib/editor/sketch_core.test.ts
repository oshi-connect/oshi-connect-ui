import { describe, expect, it, vi } from 'vitest';
import type { fabric } from './fabric_loader';
import { clearDrawings, undoLastStroke } from './export/sketch_export';
import { createSketchEditor } from './index';
import { validateFrameFile } from './validate_frame';

const mockCanvas = (objects: { isFrame?: boolean }[]) => {
	const removed: unknown[] = [];
	let rendered = false;
	const canvas = {
		getObjects: () => objects,
		remove: (object: unknown) => removed.push(object),
		renderAll: () => {
			rendered = true;
		}
	} as unknown as fabric.Canvas;
	return { canvas, removed, rendered: () => rendered };
};

describe('clearDrawings', () => {
	it('keeps frame objects when preserveFrame is true', () => {
		const frame = { isFrame: true };
		const stroke = { isFrame: false };
		const { canvas, removed, rendered } = mockCanvas([frame, stroke]);
		clearDrawings(canvas, true);
		expect(removed).toEqual([stroke]);
		expect(rendered()).toBe(true);
	});

	it('removes frame objects when preserveFrame is false', () => {
		const frame = { isFrame: true };
		const stroke = { isFrame: false };
		const { canvas, removed, rendered } = mockCanvas([frame, stroke]);
		clearDrawings(canvas, false);
		expect(removed).toEqual([frame, stroke]);
		expect(rendered()).toBe(true);
	});
});

describe('undoLastStroke', () => {
	it('removes only the last non-frame object', () => {
		const frame = { isFrame: true };
		const a = { isFrame: false };
		const b = { isFrame: false };
		const { canvas, removed, rendered } = mockCanvas([frame, a, b]);
		undoLastStroke(canvas);
		expect(removed).toEqual([b]);
		expect(rendered()).toBe(true);
	});
});

describe('validateFrameFile', () => {
	it('rejects non PNG/WebP', () => {
		const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
		expect(validateFrameFile(file)).toBe('Choose a PNG or WebP frame image.');
	});

	it('rejects oversized files', () => {
		const file = new File([new Uint8Array(10_000_001)], 'a.png', { type: 'image/png' });
		expect(validateFrameFile(file)).toBe('Frame image must be 10MB or smaller.');
	});

	it('accepts PNG under limit', () => {
		const file = new File(['x'], 'a.png', { type: 'image/png' });
		expect(validateFrameFile(file)).toBeNull();
	});
});

describe('createSketchEditor validation', () => {
	it('rejects sketch mode without imageUrl', () => {
		const onReject = vi.fn();
		const canvasEl = document.createElement('canvas');
		const container = document.createElement('div');
		container.appendChild(canvasEl);
		const parent = document.createElement('div');
		parent.appendChild(container);

		const instance = createSketchEditor({
			container,
			canvasEl,
			editorRoot: document,
			mode: 'sketch',
			uploadSketch: async () => new Response(null, { status: 200 }),
			onClose: () => {},
			onReject
		});

		expect(onReject).toHaveBeenCalledWith('Cheki image required.');
		expect(instance.resizeObserver).toBeNull();
	});
});
