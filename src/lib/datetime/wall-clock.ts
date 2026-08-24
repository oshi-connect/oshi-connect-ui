/** True when the value looks like `YYYY-MM-DDTHH:mm`. */
export function isWallClockString(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value);
}

export function splitWallClock(value: string): { date: string; time: string } {
	if (!isWallClockString(value)) return { date: '', time: '' };
	const [date, time] = value.split('T');
	return { date: date!, time: time!.slice(0, 5) };
}

export function joinWallClock(date: string, time: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}/.test(time)) return '';
	return `${date}T${time.slice(0, 5)}`;
}
