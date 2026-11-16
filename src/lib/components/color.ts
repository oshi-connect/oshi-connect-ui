/** Hue 0–360, saturation and brightness 0–1. */
export type Hsv = { h: number; s: number; v: number };

const SHORT = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const LONG = /^#?([0-9a-f]{6})$/i;

/** `#rgb` or `#rrggbb`, `#` optional, any case, trimmed; gives lowercase `#rrggbb` or null. */
export function parseHex(text: string): string | null {
	const trimmed = text.trim();
	const short = SHORT.exec(trimmed);
	if (short) return `#${short.slice(1, 4).map((c) => c + c).join('')}`.toLowerCase();
	const long = LONG.exec(trimmed);
	return long ? `#${long[1]}`.toLowerCase() : null;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function hexToHsv(hex: string): Hsv {
	const n = Number.parseInt(hex.slice(1), 16);
	const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
	const max = Math.max(r, g, b);
	const d = max - Math.min(r, g, b);
	const s = max === 0 ? 0 : d / max;
	if (d === 0) return { h: 0, s, v: max };
	const sector = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return { h: sector * 60, s, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
	const channel = (k: number) => {
		const p = (k + (((h % 360) + 360) % 360) / 60) % 6;
		const c = v - v * s * Math.max(0, Math.min(p, 4 - p, 1));
		return Math.round(clamp01(c) * 255)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${channel(5)}${channel(3)}${channel(1)}`;
}

/** The state for a new hex. Black keeps hue and saturation; gray keeps the hue. */
export function withHex(hsv: Hsv, hex: string): Hsv {
	const next = hexToHsv(hex);
	if (next.v === 0) return { h: hsv.h, s: hsv.s, v: 0 };
	if (next.s === 0) return { h: hsv.h, s: 0, v: next.v };
	return next;
}

const AREA_KEYS: Record<string, { axis: 's' | 'v'; sign: 1 | -1 }> = {
	ArrowRight: { axis: 's', sign: 1 },
	ArrowLeft: { axis: 's', sign: -1 },
	ArrowUp: { axis: 'v', sign: 1 },
	ArrowDown: { axis: 'v', sign: -1 }
};

/** One arrow-key step on the saturation and brightness area, or null for another key. */
export function stepArea(hsv: Hsv, key: string, shift: boolean): Hsv | null {
	const move = AREA_KEYS[key];
	if (!move) return null;
	const next = hsv[move.axis] + move.sign * (shift ? 0.1 : 0.01);
	return { ...hsv, [move.axis]: clamp01(Math.round(next * 1e4) / 1e4) };
}
