import { FRAME_ACCEPT_TYPES, FRAME_MAX_BYTES } from './constants';

export type FrameFileRejectReason =
	| 'Choose a PNG or WebP frame image.'
	| 'Frame image must be 10MB or smaller.';

export function validateFrameFile(file: File): FrameFileRejectReason | null {
	if (!(FRAME_ACCEPT_TYPES as readonly string[]).includes(file.type)) {
		return 'Choose a PNG or WebP frame image.';
	}
	if (file.size > FRAME_MAX_BYTES) {
		return 'Frame image must be 10MB or smaller.';
	}
	return null;
}
