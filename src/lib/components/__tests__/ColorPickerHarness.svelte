<script lang="ts">
	import { untrack } from 'svelte';
	import ColorPicker from '../ColorPicker.svelte';

	// Test-only wrapper: exposes the two-way bound value and open state.
	interface HarnessProps {
		value?: string;
		label?: string;
		disabled?: boolean;
		oninput?: (value: string) => void;
		onchange?: (value: string) => void;
	}

	let { value: initial = '#ff0000', label, disabled, oninput, onchange }: HarnessProps = $props();
	let value = $state(untrack(() => initial));
	let open = $state(false);
</script>

<div>
	<ColorPicker bind:value bind:open {label} {disabled} {oninput} {onchange} />
	<span data-testid="bound">{value}</span>
	<span data-testid="open">{open}</span>
</div>
