let seq = 0;

export function nextDomId(prefix: string): string {
	seq += 1;
	return `${prefix}-${seq}`;
}
