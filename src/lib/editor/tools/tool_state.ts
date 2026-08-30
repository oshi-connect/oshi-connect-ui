import { fabric } from '../fabric_loader';
import { DEFAULT_ACTIVE_CLASSES, DEFAULT_COLOR } from '../constants';
import type { ActiveClassSet, EditorTool } from '../types';

export type ToolStateVariant = 'sketch' | 'signature';

export interface ToolStateOptions {
	root: ParentNode;
	canvas: fabric.Canvas;
	brush: fabric.PencilBrush;
	variant?: ToolStateVariant;
	defaultTool?: EditorTool;
	defaultColor?: string;
	defaultSize?: number;
	activeClasses?: ActiveClassSet;
	onToolChange?: (tool: EditorTool) => void;
	debugLog?: (...args: unknown[]) => void;
}

export function bindToolState(options: ToolStateOptions) {
	const {
		root,
		canvas,
		brush,
		variant = 'sketch',
		defaultTool = 'pencil',
		defaultColor = DEFAULT_COLOR,
		defaultSize = variant === 'signature' ? 4 : 10,
		activeClasses = DEFAULT_ACTIVE_CLASSES,
		onToolChange,
		debugLog
	} = options;

	let currentTool: EditorTool = defaultTool;
	let currentColor = defaultColor;
	let baseBrushSize = defaultSize;

	const toolButtons = Array.from(
		root.querySelectorAll<HTMLElement>('[data-editor-action="tool"]')
	);
	const colorButtons = Array.from(
		root.querySelectorAll<HTMLElement>('[data-editor-action="color"]')
	);
	const sizeButtons = Array.from(
		root.querySelectorAll<HTMLElement>('[data-editor-action="size"]')
	);

	const applyBrushStyle = () => {
		brush.width = baseBrushSize;
		brush.color = currentColor;
		brush.shadow =
			currentTool === 'neon'
				? new fabric.Shadow({ color: currentColor, blur: 16, offsetX: 0, offsetY: 0 })
				: null;
		debugLog?.('brush-style', { tool: currentTool, baseBrushSize, color: currentColor });
	};

	const setActiveTool = (tool: EditorTool) => {
		currentTool = tool;
		toolButtons.forEach((btn) => {
			const isActive = btn.dataset.tool === tool;
			activeClasses.active.forEach((c) => btn.classList.toggle(c, isActive));
			activeClasses.inactive.forEach((c) => btn.classList.toggle(c, !isActive));
		});
		debugLog?.('tool-changed', { tool });
		onToolChange?.(tool);
		applyBrushStyle();
	};

	const setActiveColor = (color: string) => {
		currentColor = color;
		const ring = activeClasses.ringActive ?? ['ring-2', 'ring-ds-primary', 'ring-offset-1'];
		colorButtons.forEach((btn) => {
			const isActive = btn.dataset.color === color;
			ring.forEach((c) => btn.classList.toggle(c, isActive));
		});
		debugLog?.('color-changed', { color });
		applyBrushStyle();
	};

	const setActiveSize = (size: number) => {
		baseBrushSize = size;
		const ring = activeClasses.ringActive ?? ['ring-2', 'ring-ds-primary', 'ring-offset-1'];
		const labelActive = activeClasses.sizeLabelActive ?? ['text-ds-primary', 'font-semibold'];
		const labelInactive =
			activeClasses.sizeLabelInactive ?? ['text-ds-text-muted', 'font-medium'];
		sizeButtons.forEach((btn) => {
			const isActive = parseInt(btn.dataset.size || '0', 10) === size;
			btn.classList.toggle('bg-ds-surface', isActive);
			ring.forEach((c) => btn.classList.toggle(c, isActive));
			if (variant === 'signature') {
				labelActive.forEach((c) => btn.classList.toggle(c, isActive));
				labelInactive.forEach((c) => btn.classList.toggle(c, !isActive));
			} else {
				const label = btn.querySelector('.size-btn-label');
				if (label) {
					labelActive.forEach((c) => label.classList.toggle(c, isActive));
					labelInactive.forEach((c) => label.classList.toggle(c, !isActive));
				}
			}
		});
		debugLog?.('size-changed', { size });
		applyBrushStyle();
	};

	toolButtons.forEach((btn) => {
		btn.onclick = () => {
			canvas.isDrawingMode = true;
			setActiveTool(btn.dataset.tool as EditorTool);
		};
	});

	colorButtons.forEach((btn) => {
		btn.onclick = () => setActiveColor(btn.dataset.color!);
	});

	sizeButtons.forEach((btn) => {
		btn.onclick = () => setActiveSize(parseInt(btn.dataset.size!, 10));
	});

	setActiveTool(defaultTool);
	setActiveSize(defaultSize);
	setActiveColor(defaultColor);

	return {
		getTool: () => currentTool,
		getColor: () => currentColor,
		getBaseSize: () => baseBrushSize,
		setActiveTool,
		applyBrushStyle
	};
}

export function bindActionButtons(
	root: ParentNode,
	actions: Record<string, () => void>
): void {
	Object.entries(actions).forEach(([action, handler]) => {
		root.querySelectorAll<HTMLElement>(`[data-editor-action="${action}"]`).forEach((btn) => {
			btn.onclick = handler;
		});
	});
}
