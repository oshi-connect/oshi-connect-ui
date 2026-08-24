export type ThemeMode = 'light' | 'dark';

export type ThemePreferenceOptions = {
	storageKey: string;
	defaultMode?: ThemeMode;
};

const storageAvailable = (): boolean =>
	typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';

export const createThemePreference = (options: ThemePreferenceOptions) => {
	const { storageKey, defaultMode = 'dark' } = options;

	const readStoredTheme = (): ThemeMode | null => {
		if (!storageAvailable()) return null;
		const v = localStorage.getItem(storageKey);
		if (v === 'light' || v === 'dark') return v;
		return null;
	};

	const applyTheme = (mode: ThemeMode): void => {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.theme = mode;
	};

	const persistTheme = (mode: ThemeMode): void => {
		if (!storageAvailable()) return;
		localStorage.setItem(storageKey, mode);
	};

	const initThemeFromStorage = (): ThemeMode => {
		const stored = readStoredTheme();
		const mode = stored ?? defaultMode;
		applyTheme(mode);
		return mode;
	};

	const toggleTheme = (current: ThemeMode): ThemeMode => {
		const next: ThemeMode = current === 'light' ? 'dark' : 'light';
		applyTheme(next);
		try {
			persistTheme(next);
		} catch {
			// private / restricted storage — theme still applies for this session
		}
		return next;
	};

	return {
		readStoredTheme,
		applyTheme,
		persistTheme,
		initThemeFromStorage,
		toggleTheme
	};
};
