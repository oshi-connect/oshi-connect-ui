# @oshi-connect/ui

Shared Svelte 5 UI kit for Oshi Connect products. Tokens and primitives extracted from MiruV.

## Stack

- Svelte 5
- Tailwind CSS 4
- Lucide icons (peer)

## Install

### GitHub Packages

Add to `.npmrc`:

```
@oshi-connect:registry=https://npm.pkg.github.com
```

Install (CI needs `packages: read` on the org registry):

```bash
pnpm add @oshi-connect/ui
```

### Local sibling

```json
"@oshi-connect/ui": "link:../oshi-connect-ui"
```

Build the package before consuming:

```bash
pnpm --filter @oshi-connect/ui build
```

## Consume CSS

In your app CSS (Tailwind v4):

```css
@import 'tailwindcss';
@import '@oshi-connect/ui/theme.css';
@source "../node_modules/@oshi-connect/ui/dist";
```

In `app.html`:

- Set `data-theme="light"` or `data-theme="dark"` on `<html>`
- Load Nunito from Google Fonts

Override tokens after the import if needed:

```css
:root {
  --ds-color-primary: #your-color;
}
```

## Components

```ts
import {
  Button,
  Input,
  Modal,
  cn,
  createThemePreference,
  ThemeToggle
} from '@oshi-connect/ui';

const theme = createThemePreference({ storageKey: 'my-app-theme' });
```

```svelte
<ThemeToggle storageKey="my-app-theme" defaultMode="light" />
```

## Editor (headless)

Session sketch/frame engine for hosts that are not Svelte (for example Phoenix LiveView hooks). Install `fabric` in the host when you import this entry.

```ts
import {
  createSketchEditor,
  disposeSketchEditor,
  bindToolState,
  undoLastStroke,
  clearDrawings,
  type UploadFn
} from '@oshi-connect/ui/editor';

const uploadSketch: UploadFn = async (blob, filename) => {
  const body = new FormData();
  body.append('image', blob, filename);
  return fetch(`/api/chekis/${chekiId}/annotated`, { method: 'PUT', body });
};

const instance = createSketchEditor({
  container,
  canvasEl,
  editorRoot,
  mode: 'sketch',
  imageUrl,
  uploadSketch,
  onClose: () => {},
  onReject: (reason) => alert(reason)
});

disposeSketchEditor(instance);
```

The host must supply `UploadFn`. The kit does not call product API paths.

## Develop

```bash
pnpm install
pnpm build
pnpm test
pnpm dev   # playground catalog
```

## Design source

- `docs/design-system.pen` — Pencil source of truth
- [MiruV Figma](https://www.figma.com/design/3GERzf0pqogzTG7xb2KSY5/MiruV?node-id=24-5)
