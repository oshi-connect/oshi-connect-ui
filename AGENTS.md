# Oshi Connect UI — agent instructions

Shared Svelte 5 component kit (`@oshi-connect/ui`).

## Stack

- Svelte 5, `@sveltejs/package`
- Tailwind CSS v4 tokens in `src/lib/theme.css`
- Vitest + Testing Library for unit tests
- Playground app in `playground/`

## Design source

- `docs/design-system.pen` — visual source of truth (use Pencil MCP, not raw file reads)
- Align code with pen tokens and Figma MiruV design system

## Shell commands

Never use `cd path && command` or `git -C`. Verify `pwd`, then `cd` as a separate step if needed.

## Verify

```bash
pnpm install
pnpm build
pnpm test
pnpm dev   # playground
```
