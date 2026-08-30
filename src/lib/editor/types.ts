export type EditorMode = 'sketch' | 'frame' | 'signature';
export type EditorTool = 'pencil' | 'neon' | 'outline';

export type UploadFn = (blob: Blob, filename: string) => Promise<Response>;

export interface ActiveClassSet {
	active: string[];
	inactive: string[];
	ringActive?: string[];
	sizeLabelActive?: string[];
	sizeLabelInactive?: string[];
}

export interface PointerSample {
	pointerType: string;
	pressure: number | null;
	type?: string;
}

export interface FabricObjectWithFrame {
	isFrame?: boolean;
}
