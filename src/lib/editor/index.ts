import { fabric } from './fabric_loader';
import { applyOutlineBrush } from './brushes/outline_brush';
import {
	createPressurePencilBrush,
	PRESSURE_DEBUG_INFO
} from './brushes/pressure_pencil';
import { FRAME_EXPORT_WIDTH, FRAME_HEIGHT, FRAME_WIDTH } from './constants';
import { clearDrawings, exportFrame, exportSketch, undoLastStroke } from './export/sketch_export';
import { loadFrameImageOntoCanvas } from './frame_image';
import { loadSvgOntoCanvas } from './svg/signature';
import { bindActionButtons, bindToolState } from './tools/tool_state';
import type {
	FabricObjectWithFrame,
	PointerSample,
	UploadFn
} from './types';
import { validateFrameFile } from './validate_frame';

export type {
	ActiveClassSet,
	EditorMode,
	EditorTool,
	FabricObjectWithFrame,
	UploadFn
} from './types';
export { DEFAULT_COLOR, DEFAULT_ACTIVE_CLASSES, PALETTE_COLORS, SKETCH_SIZES } from './constants';
export { clearDrawings, undoLastStroke, exportSketch, exportFrame } from './export/sketch_export';
export { bindToolState, bindActionButtons } from './tools/tool_state';
export type { ToolStateOptions, ToolStateVariant } from './tools/tool_state';
export { validateFrameFile } from './validate_frame';
export type { FrameFileRejectReason } from './validate_frame';

export interface SketchEditorConfig {
	container: HTMLElement;
	canvasEl: HTMLCanvasElement;
	editorRoot: ParentNode;
	mode: 'sketch' | 'frame';
	imageUrl?: string;
	chekiId?: string;
	sessionId?: string;
	frameUrl?: string;
	referenceUrl?: string;
	uploadSketch?: UploadFn;
	uploadFrame?: UploadFn;
	onClose: () => void;
	onReject?: (reason: string) => void;
}

export interface SketchEditorInstance {
	resizeObserver: ResizeObserver | null;
	dispose: () => void;
}

const noopInstance = (): SketchEditorInstance => ({
	resizeObserver: null,
	dispose() {}
});

export function createSketchEditor(config: SketchEditorConfig): SketchEditorInstance {
	const {
		container,
		canvasEl,
		editorRoot,
		mode,
		imageUrl,
		chekiId,
		sessionId,
		frameUrl,
		referenceUrl,
		uploadSketch,
		uploadFrame,
		onClose,
		onReject
	} = config;

	const reject = (reason: string) => {
		onReject?.(reason);
	};

	if (mode === 'sketch' && !imageUrl) {
		reject('Cheki image required.');
		return noopInstance();
	}

	if (mode === 'sketch' && !uploadSketch) {
		reject('Upload handler required.');
		return noopInstance();
	}

	if (mode === 'frame' && !uploadFrame) {
		reject('Upload handler required.');
		return noopInstance();
	}

	const debugLog = (...args: unknown[]) => console.log('[SketchPressureDebug]', ...args);

	const instance: SketchEditorInstance = {
		resizeObserver: null,
		dispose() {
			this.resizeObserver?.disconnect();
			this.resizeObserver = null;
		}
	};

	const setupEditor = (logicalW: number, logicalH: number, img: HTMLImageElement | null) => {
		const fitSize = () => {
			const containerRect = container.parentElement!.getBoundingClientRect();
			const maxW = containerRect.width - 32;
			const maxH = containerRect.height - 32;
			const scale = Math.min(maxW / logicalW, maxH / logicalH, 1);
			return {
				w: Math.max(1, Math.round(logicalW * scale)),
				h: Math.max(1, Math.round(logicalH * scale))
			};
		};

		let { w: canvasW, h: canvasH } = fitSize();

		const canvas = new fabric.Canvas(canvasEl, {
			isDrawingMode: true,
			width: canvasW,
			height: canvasH
		});

		let lastPointerSample: PointerSample | null = null;

		const brush = createPressurePencilBrush(
			canvas,
			() => toolState.getBaseSize(),
			() => lastPointerSample,
			debugLog
		);
		canvas.freeDrawingBrush = brush;

		const updatePointerSample = (e: PointerEvent) => {
			lastPointerSample = {
				pointerType: e.pointerType || 'unknown',
				pressure: typeof e.pressure === 'number' ? e.pressure : null,
				type: e.type
			};
		};

		canvas.upperCanvasEl.addEventListener('pointerdown', updatePointerSample, { passive: true });
		canvas.upperCanvasEl.addEventListener('pointermove', updatePointerSample, { passive: true });

		const toolState = bindToolState({
			root: editorRoot,
			canvas,
			brush,
			variant: 'sketch',
			defaultTool: 'pencil',
			onToolChange: (tool) => {
				applyOutlineBrush(brush, () => tool === 'outline');
			},
			debugLog
		});

		debugLog('brush-initialized', {
			hasPointerEvent: typeof window.PointerEvent !== 'undefined',
			hasOnPointerDown: 'onpointerdown' in window,
			...PRESSURE_DEBUG_INFO,
			baseBrushSize: toolState.getBaseSize()
		});

		applyOutlineBrush(brush, () => toolState.getTool() === 'outline');

		if (img) {
			const fabricImg = new fabric.Image(img);
			fabricImg.scaleToWidth(canvasW);
			canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas), {
				originX: 'left',
				originY: 'top'
			});
		} else {
			canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
		}

		if (mode === 'sketch' && frameUrl) {
			const frameImg = new Image();
			frameImg.crossOrigin = 'anonymous';
			frameImg.onload = () => {
				const frameLayer = new fabric.Image(frameImg, {
					left: 0,
					top: 0,
					scaleX: canvasW / frameImg.width,
					scaleY: canvasH / frameImg.height,
					selectable: false,
					evented: false
				}) as FabricObjectWithFrame;
				frameLayer.isFrame = true;
				canvas.add(frameLayer);
				canvas.sendToBack(frameLayer);
				canvas.renderAll();
			};
			frameImg.onerror = () =>
				console.error('[SketchEditor] Failed to load session frame:', frameUrl);
			frameImg.src = frameUrl;
		}

		const upperCanvas = canvas.upperCanvasEl;

		if (mode === 'frame') {
			const guide = container.querySelector<HTMLElement>('[data-role="frame-guide"]');
			const hideGuide = () => {
				if (guide) guide.style.opacity = '0';
			};

			if (referenceUrl) {
				const referenceImg = new Image();
				referenceImg.crossOrigin = 'anonymous';
				referenceImg.onload = () => {
					const reference = new fabric.Image(referenceImg, {
						opacity: 0.35,
						scaleX: canvasW / referenceImg.width,
						scaleY: canvasH / referenceImg.height
					});
					canvas.setBackgroundImage(reference, canvas.renderAll.bind(canvas));
				};
				referenceImg.onerror = () =>
					console.error('[SketchEditor] Failed to load reference cheki:', referenceUrl);
				referenceImg.src = referenceUrl;
			}

			if (frameUrl) {
				const existingImg = new Image();
				existingImg.crossOrigin = 'anonymous';
				existingImg.onload = () => {
					loadFrameImageOntoCanvas(canvas, existingImg, {
						fitRatio: 1,
						selectable: true
					});
					hideGuide();
				};
				existingImg.onerror = () =>
					console.error('[SketchEditor] Failed to load existing frame:', frameUrl);
				existingImg.src = frameUrl;
			}

			const uploadInput = editorRoot.querySelector<HTMLInputElement>(
				'[data-role="frame-upload-input"]'
			);
			const loadFrameFile = (file: File) => {
				const reason = validateFrameFile(file);
				if (reason) {
					reject(reason);
					return;
				}

				const reader = new FileReader();
				reader.onload = () => {
					const uploadedImg = new Image();
					uploadedImg.onload = () => {
						loadFrameImageOntoCanvas(canvas, uploadedImg);
						hideGuide();
					};
					uploadedImg.onerror = () => reject('Could not load that frame image.');
					uploadedImg.src = reader.result as string;
				};
				reader.onerror = () => reject('Could not read that frame image.');
				reader.readAsDataURL(file);
			};

			editorRoot
				.querySelectorAll<HTMLElement>('[data-editor-action="upload-frame"]')
				.forEach((button) => {
					button.addEventListener('click', () => uploadInput?.click());
				});
			uploadInput?.addEventListener('change', () => {
				const file = uploadInput.files?.[0];
				if (file) loadFrameFile(file);
				uploadInput.value = '';
			});

			upperCanvas.addEventListener('drop', (event) => {
				const file = event.dataTransfer?.files[0];
				if (!file) return;
				event.preventDefault();
				loadFrameFile(file);
			});

			canvas.on('path:created', hideGuide);
		}

		canvas.on('selection:created', () => {
			canvas.isDrawingMode = false;
		});
		canvas.on('selection:updated', () => {
			canvas.isDrawingMode = false;
		});
		canvas.on('selection:cleared', () => {
			canvas.isDrawingMode = true;
		});

		const signatureDragSource = editorRoot.querySelector('[data-role="signature-drag-source"]');
		if (signatureDragSource) {
			signatureDragSource.addEventListener('dragstart', (e) => {
				const event = e as DragEvent;
				event.dataTransfer!.setData('application/x-vcheki-signature', '1');
				event.dataTransfer!.effectAllowed = 'copy';
			});
		}

		upperCanvas.addEventListener('dragover', (e) => {
			e.preventDefault();
			(e as DragEvent).dataTransfer!.dropEffect = 'copy';
		});

		upperCanvas.addEventListener('drop', (e) => {
			const event = e as DragEvent;
			if (event.dataTransfer!.getData('application/x-vcheki-signature') !== '1') return;
			event.preventDefault();

			const signatureCard = editorRoot.querySelector('#signature-card');
			const svgTemplate = signatureCard?.querySelector('[data-role="signature-svg-template"]');
			const signatureSvg = svgTemplate?.innerHTML?.trim();
			if (!signatureSvg) return;

			const rect = upperCanvas.getBoundingClientRect();
			const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };

			loadSvgOntoCanvas(
				canvas,
				signatureSvg,
				signatureCard?.getAttribute('data-signature-color') || undefined,
				{
					left: point.x,
					top: point.y,
					originX: 'center',
					originY: 'center',
					selectable: true,
					evented: true,
					scaleToWidth: canvas.getWidth() * 0.25,
					onAdded: (group) => {
						canvas.setActiveObject(group);
						canvas.isDrawingMode = false;
					}
				}
			);
		});

		bindActionButtons(editorRoot, {
			undo: () => undoLastStroke(canvas),
			clear: () => clearDrawings(canvas, mode !== 'frame'),
			submit: async () => {
				try {
					if (mode === 'frame') {
						if (canvas.getObjects().length === 0) {
							reject('Upload or draw a frame before saving.');
							return;
						}
						const response = await exportFrame(
							canvas,
							canvasW,
							FRAME_EXPORT_WIDTH,
							uploadFrame!
						);
						if (response && response.ok) onClose();
						else if (response) reject('Failed to save frame');
					} else if (img && uploadSketch) {
						const response = await exportSketch(canvas, img, canvasW, uploadSketch);
						if (response.ok) onClose();
						else reject('Failed to upload');
					}
				} catch (err) {
					console.error(err);
					reject(mode === 'frame' ? 'Error saving frame' : 'Error uploading');
				}
			}
		});

		const refit = () => {
			const { w: newW, h: newH } = fitSize();
			if (newW === canvasW && newH === canvasH) return;

			const ratio = newW / canvasW;
			canvas.setDimensions({ width: newW, height: newH });
			if (canvas.backgroundImage) {
				canvas.backgroundImage.set({
					scaleX: canvas.backgroundImage.scaleX! * ratio,
					scaleY: canvas.backgroundImage.scaleY! * ratio
				});
			}
			canvas.getObjects().forEach((obj) => {
				obj.set({
					left: obj.left! * ratio,
					top: obj.top! * ratio,
					scaleX: obj.scaleX! * ratio,
					scaleY: obj.scaleY! * ratio
				});
				obj.setCoords();
			});
			canvasW = newW;
			canvasH = newH;
			canvas.renderAll();
		};

		instance.resizeObserver = new ResizeObserver(() => refit());
		instance.resizeObserver.observe(container.parentElement!);
	};

	if (mode === 'frame') {
		setupEditor(FRAME_WIDTH, FRAME_HEIGHT, null);
	} else {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => setupEditor(img.width, img.height, img);
		img.onerror = () => reject('Failed to load cheki image.');
		img.src = imageUrl!;
	}

	return instance;
}

export function disposeSketchEditor(instance: SketchEditorInstance | null): void {
	instance?.dispose();
}
