import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fabric } from './fabric_loader';
import { createSketchEditor, type SketchEditorInstance } from './index';

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
	setLineDash() {},
	arc() {},
	translate() {},
	rotate() {}
});

let canvas: fabric.Canvas;
let editor: SketchEditorInstance;
let root: HTMLDivElement;

beforeEach(() => {
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
		() => context() as unknown as CanvasRenderingContext2D
	);
	const Canvas = fabric.Canvas;
	vi.spyOn(fabric, 'Canvas').mockImplementation((...args: ConstructorParameters<typeof Canvas>) => {
		canvas = new Canvas(...args);
		return canvas;
	});
	root = document.createElement('div');
	root.innerHTML = `
    <button data-editor-action="tool" data-tool="pencil"></button>
    <button data-editor-action="tool" data-tool="eraser"></button>
    <button data-editor-action="tool" data-tool="neon"></button>
    <button data-editor-action="color" data-color="#ff0000"></button>
    <div><canvas></canvas></div>`;
	document.body.append(root);
	vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ width: 700, height: 700 } as DOMRect);
	editor = createSketchEditor({
		container: root.querySelector('div')!,
		canvasEl: root.querySelector('canvas')!,
		editorRoot: root,
		mode: 'frame',
		uploadFrame: async () => new Response(),
		onClose() {}
	});
});

afterEach(() => {
	editor?.dispose();
	canvas?.dispose();
	root?.remove();
	vi.restoreAllMocks();
});

function click(selector: string) {
	root.querySelector<HTMLButtonElement>(selector)!.click();
}

describe('editor eraser', () => {
	it('sets the brush to white when eraser is selected', () => {
		click('[data-tool="eraser"]');
		expect(canvas.freeDrawingBrush?.color).toBe('#FFFFFF');
		expect(canvas.freeDrawingBrush?.shadow).toBeNull();
	});

	it('returns to pencil when a color is chosen while erasing', () => {
		click('[data-tool="eraser"]');
		expect(canvas.freeDrawingBrush?.color).toBe('#FFFFFF');
		click('[data-editor-action="color"]');
		expect(canvas.freeDrawingBrush?.color).toBe('#ff0000');
	});
});
