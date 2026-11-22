<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		Card,
		ColorPicker,
		Input,
		Modal,
		Select,
		ThemeToggle,
		ToastRegion,
		toasts
	} from '@oshi-connect/ui';

	let modalOpen = $state(false);
	let color = $state('#e85d9a');
	let scaledColor = $state('#7eb5e8');

	const selectOptions = [
		{ value: 'a', label: 'Option A' },
		{ value: 'b', label: 'Option B' }
	];
</script>

<ToastRegion />

<main class="mx-auto max-w-4xl space-y-10 p-8">
	<header class="flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-ds-text">Oshi Connect UI</h1>
			<p class="text-sm text-ds-text-muted">Component catalog</p>
		</div>
		<ThemeToggle storageKey="playground-theme" defaultMode="light" />
	</header>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Button</h2>
		<div class="flex flex-wrap gap-3">
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
			<Button loading>Loading</Button>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Badge</h2>
		<div class="flex flex-wrap gap-2">
			<Badge variant="primary">Primary</Badge>
			<Badge variant="success">Success</Badge>
			<Badge variant="warning">Warning</Badge>
			<Badge variant="error">Error</Badge>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Avatar</h2>
		<div class="flex gap-3">
			<Avatar size="sm" initials="OC" />
			<Avatar size="md" initials="UI" />
			<Avatar size="lg" initials="DS" />
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Form</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<Input label="Name" placeholder="Enter name" />
			<Select label="Choice" options={selectOptions} value="a" />
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">ColorPicker</h2>
		<div class="grid gap-4 sm:grid-cols-3">
			<ColorPicker label="Color" bind:value={color} />
			<!-- the panel is in the top layer, so it is not scaled or clipped by this box -->
			<div
				class="origin-top-left overflow-hidden rounded-ds-md border-2 border-ds-border p-3"
				style="transform: scale(0.75)"
			>
				<ColorPicker label="Scaled" bind:value={scaledColor} />
			</div>
			<ColorPicker label="Disabled" value="#3db88c" disabled />
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Card</h2>
		<Card elevation="md" class="p-4">
			<p class="font-semibold">Elevated card</p>
			<p class="text-sm text-ds-text-muted">Soft elevation on ds tokens.</p>
		</Card>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Modal & Toast</h2>
		<div class="flex flex-wrap gap-3">
			<Button onclick={() => (modalOpen = true)}>Open modal</Button>
			<Button
				variant="secondary"
				onclick={() => toasts.push({ variant: 'success', message: 'Saved' }, 0)}
			>
				Success
			</Button>
			<Button
				variant="secondary"
				onclick={() => toasts.push({ variant: 'error', message: 'Could not save' }, 0)}
			>
				Error
			</Button>
			<Button
				variant="ghost"
				onclick={() => toasts.push({ variant: 'info', message: 'Connected' }, 0)}
			>
				Info
			</Button>
		</div>
		<Modal open={modalOpen} title="Dialog" onclose={() => (modalOpen = false)}>
			<p class="text-sm text-ds-text-muted">Modal content on shared tokens.</p>
		</Modal>
	</section>
</main>
