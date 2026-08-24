// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { createThemePreference } from '../../theme';

describe('createThemePreference', () => {
	afterEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
	});

	it('uses the configured storage key', () => {
		const miruv = createThemePreference({ storageKey: 'miruv-theme' });
		const rainbow = createThemePreference({ storageKey: 'rainbow0-theme' });

		miruv.persistTheme('light');
		rainbow.persistTheme('dark');

		expect(localStorage.getItem('miruv-theme')).toBe('light');
		expect(localStorage.getItem('rainbow0-theme')).toBe('dark');
		expect(miruv.readStoredTheme()).toBe('light');
		expect(rainbow.readStoredTheme()).toBe('dark');
	});

	it('falls back to defaultMode when storage is empty', () => {
		const pref = createThemePreference({
			storageKey: 'test-theme',
			defaultMode: 'light'
		});
		expect(pref.initThemeFromStorage()).toBe('light');
		expect(document.documentElement.dataset.theme).toBe('light');
	});

	it('toggles theme and persists', () => {
		const pref = createThemePreference({ storageKey: 'test-theme', defaultMode: 'light' });
		pref.initThemeFromStorage();
		const next = pref.toggleTheme('light');
		expect(next).toBe('dark');
		expect(localStorage.getItem('test-theme')).toBe('dark');
	});
});
