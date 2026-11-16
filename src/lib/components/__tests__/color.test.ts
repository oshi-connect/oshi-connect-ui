import { describe, it, expect } from 'vitest';
import { hexToHsv, hsvToHex, parseHex, stepArea, withHex } from '../color';

describe('parseHex', () => {
	it.each([
		['#abc', '#aabbcc'],
		['abc', '#aabbcc'],
		['#AABBCC', '#aabbcc'],
		['aabbcc', '#aabbcc'],
		[' #aabbcc ', '#aabbcc'],
		['#F0a', '#ff00aa']
	])('reads %j as %s', (text, hex) => {
		expect(parseHex(text)).toBe(hex);
	});

	it.each(['#abcd', '#gggggg', '', '#', '##abc', 'aabbccdd', '#aabbc'])('rejects %j', (text) => {
		expect(parseHex(text)).toBeNull();
	});
});

describe('hexToHsv and hsvToHex', () => {
	const colors = [
		'#000000',
		'#ffffff',
		'#808080',
		'#ff0000',
		'#00ff00',
		'#0000ff',
		'#e85d9a',
		'#7eb5e8',
		'#3db88c',
		'#123456',
		'#fedcba',
		'#010203'
	];

	it.each(colors)('keeps each byte of %s', (hex) => {
		expect(hsvToHex(hexToHsv(hex))).toBe(hex);
	});

	it('gives no saturation to black and gray', () => {
		expect(hexToHsv('#000000').s).toBe(0);
		expect(hexToHsv('#808080').s).toBe(0);
	});

	it('reads the hue of pure colors', () => {
		expect(hexToHsv('#ff0000').h).toBe(0);
		expect(hexToHsv('#00ff00').h).toBe(120);
		expect(hexToHsv('#0000ff').h).toBe(240);
	});

	it('treats hue 360 as hue 0', () => {
		expect(hsvToHex({ h: 360, s: 1, v: 1 })).toBe('#ff0000');
	});
});

describe('withHex', () => {
	const red = { h: 0, s: 1, v: 1 };
	const teal = { h: 180, s: 0.6, v: 0.8 };

	it('keeps hue and saturation for black', () => {
		expect(withHex(teal, '#000000')).toEqual({ h: 180, s: 0.6, v: 0 });
	});

	it('keeps the hue for gray', () => {
		const gray = withHex(teal, '#808080');
		expect(gray.h).toBe(180);
		expect(gray.s).toBe(0);
		expect(hsvToHex(gray)).toBe('#808080');
	});

	it('takes the hue of a colored hex', () => {
		expect(withHex(red, '#0000ff')).toEqual({ h: 240, s: 1, v: 1 });
	});
});

describe('stepArea', () => {
	const mid = { h: 30, s: 0.5, v: 0.5 };

	it('moves saturation with left and right', () => {
		expect(stepArea(mid, 'ArrowRight', false)).toEqual({ h: 30, s: 0.51, v: 0.5 });
		expect(stepArea(mid, 'ArrowLeft', true)).toEqual({ h: 30, s: 0.4, v: 0.5 });
	});

	it('moves brightness with up and down', () => {
		expect(stepArea(mid, 'ArrowUp', true)).toEqual({ h: 30, s: 0.5, v: 0.6 });
		expect(stepArea(mid, 'ArrowDown', false)).toEqual({ h: 30, s: 0.5, v: 0.49 });
	});

	it('stops at 0 and 1', () => {
		expect(stepArea({ h: 0, s: 0.95, v: 0.05 }, 'ArrowRight', true)?.s).toBe(1);
		expect(stepArea({ h: 0, s: 0.95, v: 0.05 }, 'ArrowDown', true)?.v).toBe(0);
		expect(stepArea({ h: 0, s: 0, v: 1 }, 'ArrowLeft', false)?.s).toBe(0);
		expect(stepArea({ h: 0, s: 0, v: 1 }, 'ArrowUp', false)?.v).toBe(1);
	});

	it('ignores other keys', () => {
		expect(stepArea(mid, 'Enter', false)).toBeNull();
	});
});
