import { afterEach, describe, expect, it, vi } from 'vitest';
import { fabric } from './fabric_loader';
import { applySketch, captureSketch } from './sketch_document';

const context = () => ({
	scale() {},
	clearRect() {},
	save() {},
	restore() {},
	transform() {},
	setTransform() {},
	beginPath() {},
	closePath() {},
	moveTo() {},
	lineTo() {},
	quadraticCurveTo() {},
	bezierCurveTo() {},
	stroke() {},
	fill() {},
	fillRect() {},
	drawImage() {},
	setLineDash() {},
	arc() {},
	translate() {},
	rotate() {}
});

describe('sketch document', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('round-trips path order, photo-pixel positions, and destination-out', () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
			() => context() as unknown as CanvasRenderingContext2D
		);
		const canvas = new fabric.Canvas(document.createElement('canvas'), { width: 100, height: 50 });
		const ink = new fabric.Path('M 0 0 L 10 0', {
			fill: '',
			stroke: '#ff0000',
			strokeWidth: 4,
			originX: 'left',
			originY: 'top',
			scaleX: 1,
			scaleY: 1,
			objectCaching: false,
			globalCompositeOperation: 'source-over'
		});
		ink.set({ left: 10, top: 20 });
		const eraser = new fabric.Path('M 0 0 L 5 5', {
			fill: '',
			stroke: '#000000',
			strokeWidth: 6,
			originX: 'left',
			originY: 'top',
			scaleX: 1,
			scaleY: 1,
			objectCaching: false,
			globalCompositeOperation: 'destination-out'
		});
		eraser.set({ left: 30, top: 10 });
		canvas.add(ink);
		canvas.add(eraser);

		const doc = captureSketch(canvas, 100, 50, 200, 100);

		expect(doc.strokes.map((stroke) => (stroke.kind === 'path' ? stroke.composite : stroke.kind))).toEqual([
			'source-over',
			'destination-out'
		]);
		expect(doc.strokes[0]).toMatchObject({
			kind: 'path',
			left: 20,
			top: 40,
			strokeWidth: 8,
			stroke: '#ff0000',
			composite: 'source-over'
		});
		expect(doc.strokes[1]).toMatchObject({
			kind: 'path',
			left: 60,
			top: 20,
			composite: 'destination-out'
		});

		canvas.getObjects().slice().forEach((obj) => canvas.remove(obj));
		applySketch(canvas, doc, 100, 50);
		const restored = canvas.getObjects();
		expect(restored.map((obj) => obj.globalCompositeOperation)).toEqual(['source-over', 'destination-out']);
		expect(restored[0]?.left).toBe(10);
		expect(restored[0]?.top).toBe(20);
		expect(restored[1]?.left).toBe(30);
		expect(restored[1]?.top).toBe(10);
		expect(restored[1]?.objectCaching).toBe(false);
		canvas.dispose();
	});
});
