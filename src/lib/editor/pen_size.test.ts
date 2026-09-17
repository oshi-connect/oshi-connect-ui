import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fabric } from './fabric_loader';
import { createSketchEditor, type SketchEditorInstance } from './index';

// happy-dom has no 2D renderer. Keep the real Fabric canvas, brush, and paths.
const context = () => ({
  scale() {}, clearRect() {}, save() {}, restore() {}, transform() {},
  setTransform() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
  quadraticCurveTo() {}, bezierCurveTo() {}, stroke() {}, fill() {},
  fillRect() {}, setLineDash() {}, arc() {}, translate() {}, rotate() {}
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
    <button data-editor-action="size" data-size="4"></button>
    <button data-editor-action="size" data-size="20"></button>
    <button data-editor-action="size" data-size="40"></button>
    <button data-editor-action="tool" data-tool="pencil"></button>
    <button data-editor-action="tool" data-tool="neon"></button>
    <button data-editor-action="tool" data-tool="outline"></button>
    <button data-editor-action="color" data-color="#ff0000"></button>
    <div><canvas></canvas></div>`;
  document.body.append(root);
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ width: 700, height: 700 } as DOMRect);
  editor = createSketchEditor({
    container: root.querySelector('div')!, canvasEl: root.querySelector('canvas')!,
    editorRoot: root, mode: 'frame', uploadFrame: async () => new Response(), onClose() {}
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

function draw(pointerType: string, pressure: number) {
  // Fabric 5 exposes these methods at runtime but omits them from its brush types.
  const brush = canvas.freeDrawingBrush as fabric.PencilBrush & {
    onMouseDown(point: fabric.Point, event: { e: MouseEvent }): void;
    onMouseMove(point: fabric.Point, event: { e: MouseEvent }): void;
    onMouseUp(event: { e: MouseEvent }): void;
  };
  const event = { e: new PointerEvent('pointerdown', { pointerType, pressure, isPrimary: true }) };
  brush.onMouseDown(new fabric.Point(30, 30), event);
  brush.onMouseMove(new fabric.Point(130, 80), event);
  brush.onMouseUp({ e: new MouseEvent('mouseup') });
  return canvas.getObjects().at(-1)!;
}

describe('editor pen size', () => {
  it('uses each selected size for saved mouse strokes', () => {
    expect(draw('mouse', 0.5).strokeWidth).toBe(10);
    for (const size of [4, 40, 20, 4]) {
      click(`[data-size="${size}"]`);
      expect(draw('mouse', 0.5).strokeWidth).toBe(size);
    }
  });

  it('scales the selected size with pen pressure', () => {
    click('[data-size="20"]');
    expect(draw('pen', 0.5).strokeWidth).toBeCloseTo(22);
    click('[data-size="40"]');
    expect(draw('pen', 1).strokeWidth).toBeCloseTo(74);
  });

  it('keeps the selected size through tool and color changes', () => {
    click('[data-size="40"]');
    click('[data-tool="neon"]');
    click('[data-editor-action="color"]');
    const neon = draw('touch', 0);
    expect(neon.strokeWidth).toBe(40);
    expect(neon.stroke).toBe('#ff0000');
    click('[data-tool="outline"]');
    const outline = draw('mouse', 0.5) as fabric.Group;
    expect(outline.getObjects()[1].strokeWidth).toBe(40);
    click('[data-tool="pencil"]');
    expect(draw('mouse', 0.5).strokeWidth).toBe(40);
  });
});
