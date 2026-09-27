import { fabric } from './fabric_loader';
import type { FabricObjectWithFrame } from './types';

export type Composite = 'source-over' | 'destination-out';

export type PathCommand = ReadonlyArray<string | number>;

export type SketchStroke =
	| {
			kind: 'path';
			path: PathCommand[];
			left: number;
			top: number;
			scaleX: number;
			scaleY: number;
			stroke: string;
			strokeWidth: number;
			composite: Composite;
			shadow: { color: string; blur: number } | null;
	  }
	| {
			kind: 'group';
			objects: SketchStroke[];
			left: number;
			top: number;
			scaleX: number;
			scaleY: number;
	  };

export type SketchDocument = {
	version: 1;
	space: { width: number; height: number };
	strokes: SketchStroke[];
};

export type SketchSubmission = {
	image: Blob;
	sketch: SketchDocument;
};

export type SketchUpload = (submission: SketchSubmission) => Promise<Response>;

const emptyDocument = (): SketchDocument => ({
	version: 1,
	space: { width: 0, height: 0 },
	strokes: []
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
	value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;

const field = (record: Record<string, unknown>, keys: string[]): unknown => {
	for (const key of keys) {
		if (key in record) return record[key];
	}
	return undefined;
};

const num = (value: unknown, fallback: number): number =>
	typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const scalePart = (part: string | number, scale: number): string | number =>
	typeof part === 'number' ? part * scale : part;

const scaleCommand = (command: PathCommand, sx: number, sy: number): PathCommand => {
	const op = command[0];
	if (typeof op !== 'string') return command;
	const kind = op.toUpperCase();
	const rest = command.slice(1);
	if (kind === 'Z') return [op];
	if (kind === 'H') return [op, ...rest.map((part) => scalePart(part, sx))];
	if (kind === 'V') return [op, ...rest.map((part) => scalePart(part, sy))];
	if (kind === 'A') {
		return [
			op,
			scalePart(rest[0] ?? 0, sx),
			scalePart(rest[1] ?? 0, sy),
			rest[2] ?? 0,
			rest[3] ?? 0,
			rest[4] ?? 0,
			scalePart(rest[5] ?? 0, sx),
			scalePart(rest[6] ?? 0, sy)
		];
	}
	const scaled: Array<string | number> = [op];
	rest.forEach((part, index) => {
		scaled.push(typeof part === 'number' ? part * (index % 2 === 0 ? sx : sy) : part);
	});
	return scaled;
};

const scalePath = (path: PathCommand[], sx: number, sy: number): PathCommand[] =>
	path.map((command) => scaleCommand(command, sx, sy));

const readPath = (value: unknown): PathCommand[] => {
	if (!Array.isArray(value)) return [];
	return value.flatMap((command) => {
		if (!Array.isArray(command) || typeof command[0] !== 'string') return [];
		const parts = command.map((part) =>
			typeof part === 'number' || typeof part === 'string' ? part : null
		);
		if (parts.some((part) => part === null)) return [];
		return [parts as PathCommand];
	});
};

const readShadow = (value: unknown): { color: string; blur: number } | null => {
	const record = asRecord(value);
	if (!record || typeof record.color !== 'string' || typeof record.blur !== 'number') return null;
	return { color: record.color, blur: record.blur };
};

const normalizeStroke = (value: unknown): SketchStroke | null => {
	const record = asRecord(value);
	if (!record) return null;
	const kind = field(record, ['kind']);
	if (kind === 'group') {
		const objects = Array.isArray(record.objects)
			? record.objects.flatMap((child) => {
					const stroke = normalizeStroke(child);
					return stroke ? [stroke] : [];
				})
			: [];
		return {
			kind: 'group',
			objects,
			left: num(field(record, ['left']), 0),
			top: num(field(record, ['top']), 0),
			scaleX: num(field(record, ['scaleX', 'scale_x']), 1),
			scaleY: num(field(record, ['scaleY', 'scale_y']), 1)
		};
	}
	if (kind !== 'path') return null;
	const composite = field(record, ['composite']);
	return {
		kind: 'path',
		path: readPath(field(record, ['path'])),
		left: num(field(record, ['left']), 0),
		top: num(field(record, ['top']), 0),
		scaleX: num(field(record, ['scaleX', 'scale_x']), 1),
		scaleY: num(field(record, ['scaleY', 'scale_y']), 1),
		stroke: typeof field(record, ['stroke']) === 'string' ? (field(record, ['stroke']) as string) : '#000000',
		strokeWidth: num(field(record, ['strokeWidth', 'stroke_width']), 1),
		composite: composite === 'destination-out' ? 'destination-out' : 'source-over',
		shadow: readShadow(field(record, ['shadow']))
	};
};

export function sketchDocumentFromJson(json: string | null | undefined): SketchDocument {
	if (!json) return emptyDocument();
	try {
		const raw = asRecord(JSON.parse(json));
		if (!raw || raw.version !== 1) return emptyDocument();
		const space = asRecord(raw.space);
		const strokes = Array.isArray(raw.strokes)
			? raw.strokes.flatMap((stroke) => {
					const parsed = normalizeStroke(stroke);
					return parsed ? [parsed] : [];
				})
			: [];
		return {
			version: 1,
			space: {
				width: num(space?.width, 0),
				height: num(space?.height, 0)
			},
			strokes
		};
	} catch {
		return emptyDocument();
	}
}

const shadowOf = (
	shadow: fabric.Shadow | string | null | undefined,
	sx: number
): { color: string; blur: number } | null => {
	if (!shadow || typeof shadow === 'string') return null;
	return { color: shadow.color ?? '#000000', blur: (shadow.blur ?? 0) * sx };
};

const captureObject = (obj: fabric.Object, sx: number, sy: number): SketchStroke | null => {
	if ((obj as FabricObjectWithFrame).isFrame) return null;
	if (obj.type === 'group') {
		const objects = (obj as fabric.Group).getObjects().flatMap((child) => {
			const stroke = captureObject(child, sx, sy);
			return stroke ? [stroke] : [];
		});
		return {
			kind: 'group',
			objects,
			left: (obj.left ?? 0) * sx,
			top: (obj.top ?? 0) * sy,
			scaleX: obj.scaleX ?? 1,
			scaleY: obj.scaleY ?? 1
		};
	}
	if (obj.type !== 'path') return null;
	const pathObj = obj as fabric.Path;
	const commands = ((pathObj.path ?? []) as unknown as PathCommand[]).map((command) =>
		scaleCommand(command, sx, sy)
	);
	return {
		kind: 'path',
		path: commands,
		left: (obj.left ?? 0) * sx,
		top: (obj.top ?? 0) * sy,
		scaleX: obj.scaleX ?? 1,
		scaleY: obj.scaleY ?? 1,
		stroke: typeof pathObj.stroke === 'string' ? pathObj.stroke : '#000000',
		strokeWidth: (pathObj.strokeWidth ?? 1) * sx,
		composite: pathObj.globalCompositeOperation === 'destination-out' ? 'destination-out' : 'source-over',
		shadow: shadowOf(pathObj.shadow, sx)
	};
};

export function captureSketch(
	canvas: fabric.Canvas,
	canvasWidth: number,
	canvasHeight: number,
	photoWidth: number,
	photoHeight: number
): SketchDocument {
	const sx = photoWidth / canvasWidth;
	const sy = photoHeight / canvasHeight;
	const strokes = canvas.getObjects().flatMap((obj) => {
		const stroke = captureObject(obj, sx, sy);
		return stroke ? [stroke] : [];
	});
	return { version: 1, space: { width: photoWidth, height: photoHeight }, strokes };
}

// fabric 5 accepts command arrays at runtime. The published types only list SVG strings.
const pathFromCommands = (commands: PathCommand[], options: fabric.IPathOptions): fabric.Path =>
	new fabric.Path(commands as unknown as string, options);

const buildObject = (stroke: SketchStroke, sx: number, sy: number): fabric.Object => {
	if (stroke.kind === 'group') {
		const children = stroke.objects.map((child) => buildObject(child, sx, sy));
		return new fabric.Group(
			children,
			{
				left: stroke.left / sx,
				top: stroke.top / sy,
				scaleX: stroke.scaleX,
				scaleY: stroke.scaleY,
				originX: 'left',
				originY: 'top',
				objectCaching: false
			},
			true
		);
	}
	const path = pathFromCommands(scalePath(stroke.path, 1 / sx, 1 / sy), {
		fill: undefined,
		stroke: stroke.stroke,
		strokeWidth: stroke.strokeWidth / sx,
		left: stroke.left / sx,
		top: stroke.top / sy,
		scaleX: stroke.scaleX,
		scaleY: stroke.scaleY,
		originX: 'left',
		originY: 'top',
		objectCaching: stroke.composite !== 'destination-out',
		globalCompositeOperation: stroke.composite
	});
	if (stroke.composite === 'destination-out') {
		path.objectCaching = false;
		path.globalCompositeOperation = 'destination-out';
	}
	if (stroke.shadow) {
		path.set(
			'shadow',
			new fabric.Shadow({
				color: stroke.shadow.color,
				blur: stroke.shadow.blur / sx,
				offsetX: 0,
				offsetY: 0
			})
		);
	}
	return path;
};

export function applySketch(
	canvas: fabric.Canvas,
	document: SketchDocument,
	canvasWidth: number,
	canvasHeight: number
): void {
	if (document.strokes.length === 0 || document.space.width === 0 || document.space.height === 0) return;
	const sx = document.space.width / canvasWidth;
	const sy = document.space.height / canvasHeight;
	document.strokes.forEach((stroke) => {
		canvas.add(buildObject(stroke, sx, sy));
	});
	canvas.renderAll();
}

export function stampEraserPath(path: fabric.Path): void {
	// The live brush is translucent so the stroke shows on contextTop.
	// destination-out uses stroke alpha, so the committed path is opaque.
	path.set({
		globalCompositeOperation: 'destination-out',
		objectCaching: false,
		stroke: '#000000'
	});
}

export function submitSketch(input: {
	canvas: fabric.Canvas;
	photo: HTMLImageElement;
	canvasWidth: number;
	upload: SketchUpload;
}): Promise<Response> {
	const { canvas, photo, canvasWidth, upload } = input;
	const photoWidth = photo.naturalWidth || photo.width;
	const photoHeight = photo.naturalHeight || photo.height;
	const sketch = captureSketch(canvas, canvasWidth, canvas.getHeight(), photoWidth, photoHeight);

	return new Promise((resolve, reject) => {
		const exportCanvas = document.createElement('canvas');
		exportCanvas.width = photoWidth;
		exportCanvas.height = photoHeight;
		const exportCtx = exportCanvas.getContext('2d');
		if (!exportCtx) {
			reject(new Error('Failed to export sketch'));
			return;
		}
		exportCtx.drawImage(photo, 0, 0);

		const savedBackgroundImage = canvas.backgroundImage;
		const savedBackgroundColor = canvas.backgroundColor;
		canvas.backgroundImage = null as unknown as fabric.Image;
		canvas.backgroundColor = null as unknown as string;
		const overlay = canvas.toCanvasElement(photoWidth / canvasWidth);
		canvas.backgroundImage = savedBackgroundImage;
		canvas.backgroundColor = savedBackgroundColor;
		canvas.renderAll();
		exportCtx.drawImage(overlay, 0, 0);

		exportCanvas.toBlob(
			async (blob) => {
				if (!blob) {
					reject(new Error('Failed to export sketch'));
					return;
				}
				try {
					resolve(await upload({ image: blob, sketch }));
				} catch (err) {
					reject(err);
				}
			},
			'image/jpeg',
			0.92
		);
	});
}
