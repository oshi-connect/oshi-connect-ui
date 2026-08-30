import { fabric } from '../fabric_loader';
import type { FabricObjectWithFrame, UploadFn } from '../types';

export function clearDrawings(canvas: fabric.Canvas, preserveFrame = true): void {
	canvas
		.getObjects()
		.filter((obj) => !preserveFrame || !(obj as FabricObjectWithFrame).isFrame)
		.forEach((obj) => canvas.remove(obj));
	canvas.renderAll();
}

export function undoLastStroke(canvas: fabric.Canvas): void {
	const objects = canvas
		.getObjects()
		.filter((obj) => !(obj as FabricObjectWithFrame).isFrame);
	if (objects.length > 0) {
		canvas.remove(objects[objects.length - 1]);
		canvas.renderAll();
	}
}

export function exportSketch(
	canvas: fabric.Canvas,
	img: HTMLImageElement,
	canvasW: number,
	upload: UploadFn
): Promise<Response> {
	return new Promise((resolve, reject) => {
		const exportCanvas = document.createElement('canvas');
		exportCanvas.width = img.width;
		exportCanvas.height = img.height;
		const exportCtx = exportCanvas.getContext('2d')!;
		exportCtx.drawImage(img, 0, 0);

		const savedBackgroundImage = canvas.backgroundImage;
		const savedBackgroundColor = canvas.backgroundColor;
		canvas.backgroundImage = null as unknown as fabric.Image;
		canvas.backgroundColor = null as unknown as string;
		const overlay = canvas.toCanvasElement(img.width / canvasW);
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
					resolve(await upload(blob, 'annotated.jpg'));
				} catch (err) {
					reject(err);
				}
			},
			'image/jpeg',
			0.92
		);
	});
}

export function exportFrame(
	canvas: fabric.Canvas,
	canvasW: number,
	frameWidth: number,
	upload: UploadFn
): Promise<Response | void> {
	const objects = canvas.getObjects();
	if (objects.length === 0) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		const savedBackgroundImage = canvas.backgroundImage;
		const savedBackgroundColor = canvas.backgroundColor;
		canvas.backgroundImage = null as unknown as fabric.Image;
		canvas.backgroundColor = null as unknown as string;
		const exportCanvas = canvas.toCanvasElement(frameWidth / canvasW);
		canvas.backgroundImage = savedBackgroundImage;
		canvas.backgroundColor = savedBackgroundColor;
		canvas.renderAll();

		exportCanvas.toBlob(async (blob) => {
			if (!blob) {
				reject(new Error('Failed to export frame'));
				return;
			}
			try {
				resolve(await upload(blob, 'frame.png'));
			} catch (err) {
				reject(err);
			}
		}, 'image/png');
	});
}
