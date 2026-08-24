/**
 * Typing a date and a time by hand, in a stated format.
 *
 * The native `<input type="date">` opens a calendar and renders in the
 * browser's own locale, which means the same field reads 12/31/2026 for one
 * person and 31/12/2026 for the next, with nothing on screen saying which. A
 * plain text box with `DD.MM.YYYY` printed next to it says it once, to
 * everyone, and never disagrees with itself.
 *
 * Storage stays ISO (`YYYY-MM-DD`, `HH:mm`). Only what is on screen is dotted.
 */

export const DATE_PLACEHOLDER = 'DD.MM.YYYY';
export const TIME_PLACEHOLDER = 'HH:MM';

export interface WallClockParts {
	/** ISO `YYYY-MM-DD`, or '' */
	date: string;
	/** ISO `HH:mm`, or '' */
	time: string;
}

/** `2026-12-31` -> `31.12.2026`. Anything else comes back untouched. */
export function formatDateForDisplay(iso: string): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return '';
	return `${match[3]}.${match[2]}.${match[1]}`;
}

/**
 * `31.12.2026` -> `2026-12-31`, and '' for anything that is not a real date.
 *
 * Separators are interchangeable on the way in (a dot, a slash and a dash all
 * mean the same thing to someone typing quickly), and the day/month order is
 * fixed -- that is the whole point of printing the pattern.
 */
export function parseDisplayDate(text: string): string {
	const match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(text.trim());
	if (!match) return '';

	const day = Number(match[1]);
	const month = Number(match[2]);
	const year = Number(match[3]);
	const pad = (n: number) => String(n).padStart(2, '0');
	const iso = `${year}-${pad(month)}-${pad(day)}`;

	// round-trip through Date to reject 31.02 and friends, which the regex
	// happily accepts and which would otherwise silently become 03.03
	const probe = new Date(`${iso}T00:00:00.000Z`);
	if (Number.isNaN(probe.getTime())) return '';
	if (probe.getUTCFullYear() !== year || probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) {
		return '';
	}
	return iso;
}

/** `18:30` -> `18:30`; `1830` and `8:5` are accepted too. '' if it isn't a time. */
export function parseDisplayTime(text: string): string {
	const trimmed = text.trim();
	const digits = /^(\d{3,4})$/.exec(trimmed);
	const parts = digits
		? [digits[1]!.slice(0, -2), digits[1]!.slice(-2)]
		: (/^(\d{1,2}):(\d{2})$/.exec(trimmed)?.slice(1) ?? null);
	if (!parts) return '';

	const hour = Number(parts[0]);
	const minute = Number(parts[1]);
	if (!Number.isInteger(hour) || !Number.isInteger(minute)) return '';
	if (hour > 23 || minute > 59) return '';
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * What the date box shows while it is being typed in.
 *
 * The separators appear on their own as the digits arrive, so nobody has to
 * reach for the dot key -- but nothing is rejected or reordered mid-word, which
 * is what makes hand-editing an existing value bearable.
 */
export function maskDateInput(text: string): string {
	const digits = text.replace(/\D/g, '').slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
	return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

/** The same, for `HH:MM`. */
export function maskTimeInput(text: string): string {
	const digits = text.replace(/\D/g, '').slice(0, 4);
	if (digits.length <= 2) return digits;
	return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Raises a pair of parts to a floor, part by part.
 *
 * "Ends at" is seeded from "Starts at" as you type it: the date appears as soon
 * as the start has one, the time as soon as the start has one. It is a floor,
 * not a copy -- a value already later than the floor is left exactly as typed,
 * because the point is to save retyping the date, not to overrule the person
 * setting the end.
 */
export function raiseToFloor(parts: WallClockParts, floor: WallClockParts): WallClockParts {
	const date = floor.date && (!parts.date || parts.date < floor.date) ? floor.date : parts.date;

	// the time floor only bites on the floor's own day; on a later date any
	// hour is later than the floor by definition
	const sameDay = date.length > 0 && date === floor.date;
	const time =
		floor.time && sameDay && (!parts.time || parts.time < floor.time) ? floor.time : parts.time;

	return { date, time };
}

/**
 * True while a date/time box has digits that are not a finished value yet
 * (`19`, `31.12.`). `raiseToFloor` treats parse failures as empty and would
 * fill them from the floor -- which makes the field fight every keystroke.
 */
export function isIncompleteWallClockText(dateText: string, timeText: string): boolean {
	if (dateText.length > 0 && parseDisplayDate(dateText) === '') return true;
	if (timeText.length > 0 && parseDisplayTime(timeText) === '') return true;
	return false;
}
