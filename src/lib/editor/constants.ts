/** Kit primary (`--ds-color-primary`). */
export const DEFAULT_COLOR = '#e85d9a';

export const FRAME_WIDTH = 600;
export const FRAME_HEIGHT = 800;
export const FRAME_EXPORT_WIDTH = 2160;
export const FRAME_MAX_BYTES = 10_000_000;
export const FRAME_ACCEPT_TYPES = ['image/png', 'image/webp'] as const;

export const PALETTE_COLORS = [
	{ hex: '#e85d9a', title: 'Primary' },
	{ hex: '#b388ff', title: 'Accent' },
	{ hex: '#F97316', title: 'Orange' },
	{ hex: '#ffe65e', title: 'Yellow' },
	{ hex: '#7eb5e8', title: 'Secondary' },
	{ hex: '#22C55E', title: 'Emerald' },
	{ hex: '#ffffff', title: 'White' },
	{ hex: '#000000', title: 'Black' }
] as const;

export const SKETCH_SIZES = [
	{ size: 4, label: 'Thin' },
	{ size: 10, label: 'Med' },
	{ size: 20, label: 'Thick' },
	{ size: 40, label: 'X-Large' }
] as const;

export const SIGNATURE_SIZES = [
	{ size: 2, label: 'Thin' },
	{ size: 4, label: 'Medium' },
	{ size: 8, label: 'Thick' },
	{ size: 14, label: 'Extra thick' }
] as const;

export const DEFAULT_ACTIVE_CLASSES = {
	active: ['bg-ds-primary', 'text-ds-on-primary'],
	inactive: ['text-ds-text-muted', 'hover:bg-ds-surface', 'hover:border-ds-border'],
	ringActive: ['ring-2', 'ring-ds-primary', 'ring-offset-1'],
	sizeLabelActive: ['text-ds-primary', 'font-semibold'],
	sizeLabelInactive: ['text-ds-text-muted', 'font-medium']
} as const;
