/** Join truthy class fragments (no tailwind-merge — avoid duplicate utilities in variant maps). */
export function cn(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}
