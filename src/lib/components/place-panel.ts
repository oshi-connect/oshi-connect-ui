type Rect = { top: number; bottom: number; left: number; right: number };
type Size = { width: number; height: number };

const GAP = 8;
const MARGIN = 8;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

/** Viewport position of a panel under its anchor; above when only that fits; always inside the viewport. */
export function placePanel(anchor: Rect, panel: Size, viewport: Size): { top: number; left: number } {
	const below = anchor.bottom + GAP;
	const above = anchor.top - GAP - panel.height;
	const maxTop = Math.max(MARGIN, viewport.height - panel.height - MARGIN);
	const top =
		below + panel.height <= viewport.height - MARGIN
			? below
			: above >= MARGIN
				? above
				: clamp(below, MARGIN, maxTop);
	const maxLeft = Math.max(MARGIN, viewport.width - panel.width - MARGIN);
	return { top, left: clamp(anchor.left, MARGIN, maxLeft) };
}
