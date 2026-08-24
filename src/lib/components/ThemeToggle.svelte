<script lang="ts">
	import { onMount } from 'svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { cn } from './cn';
	import { createThemePreference, type ThemeMode } from '../theme';

	interface Props {
		storageKey: string;
		defaultMode?: ThemeMode;
		class?: string;
	}

	let { storageKey, defaultMode = 'dark', class: className }: Props = $props();

	const key = storageKey;
	const modeDefault = defaultMode;
	const theme = createThemePreference({ storageKey: key, defaultMode: modeDefault });
	let themeMode = $state<ThemeMode>(modeDefault);

	function onThemeToggle() {
		themeMode = theme.toggleTheme(themeMode);
	}

	onMount(() => {
		themeMode = theme.initThemeFromStorage();
	});
</script>

<button
	type="button"
	class={cn(
		'inline-flex size-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ds-text shadow-none hover:opacity-80 active:opacity-70 outline-none focus-visible:outline-none md:size-12',
		className
	)}
	aria-label={themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
	onclick={onThemeToggle}
>
	{#if themeMode === 'dark'}
		<Sun class="h-5 w-5 shrink-0 md:h-6 md:w-6" aria-hidden="true" />
	{:else}
		<Moon class="h-5 w-5 shrink-0 md:h-6 md:w-6" aria-hidden="true" />
	{/if}
</button>
