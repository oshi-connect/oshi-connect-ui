# Color picker

## Requirements

R1. The kit exports `ColorPicker`.
- Props: `value` (bindable, lowercase `#rrggbb`), `label` (string or snippet, optional), `id`, `disabled`, `class`, `open` (bindable), `oninput(value)`, `onchange(value)`.
- No alpha.
- An invalid `value` shows `#000000` and does not call a callback.

R2. The closed control shows two parts.
- A swatch button. Its accessible name is the label. It has `aria-haspopup="dialog"` and `aria-expanded`.
- A hex text field (the kit `Input`).
- A typed value commits on Enter or blur only when it is `#rgb` or `#rrggbb`. The `#` is optional, case does not matter, and the text is trimmed. The value is stored as lowercase `#rrggbb` and calls `onchange`.
- Invalid text goes back to the current value on blur.

R3. The swatch opens a panel with two controls.
- A saturation and brightness area: pointer drag, and arrow keys (1 % a step, 10 % with Shift). Left and right change the saturation. Up and down change the brightness. It has `role="slider"` with `aria-valuetext` (the hex).
- A hue slider (`input type="range"`, 0–360).
- Each change during a drag or a key repeat calls `oninput`. The end of a gesture (pointer up, or key up) calls `onchange` one time. A gesture that does not change the hex calls no callback.
- The panel keeps hue and saturation while it is open, so black and gray do not lose the hue.

R4. The panel is a top-layer popover (`popover="auto"`, with `showPopover()`).
- It goes below the swatch, from `getBoundingClientRect`. It flips above when it does not fit, and it stays in the viewport. It moves again on a window resize and on a scroll.
- It closes on Escape, on a pointer down outside it, and on a second swatch click.
- Focus goes to the area on open. It goes back to the swatch on Escape and on a swatch click. A pointer down outside does not move the focus.
- Without `showPopover`, the panel uses `absolute` placement under the root.

R5. The control uses only the tokens in `theme.css` and the `ds-` classes. No new token. No text in the panel. The area and hue gradients show the color data; they are not decoration.

R6. The kit version goes to `0.2.0`. Unit tests and a playground section cover R1–R4.

## Entities

- `ColorPicker.svelte`: the component.
- `Hsv = { h: number; s: number; v: number }`: hue 0–360, saturation and brightness 0–1.
- `color.ts` (pure functions): `parseHex(text)`, `hexToHsv(hex)`, `hsvToHex(hsv)`, `withHex(hsv, hex)`, `stepArea(hsv, key, shift)`.
- `place-panel.ts` (pure function): `placePanel(anchor, panel, viewport)` gives the panel `top` and `left`.

## Approach

- The component keeps one `Hsv` state. A new `value` from outside replaces it only when its hex is different. `withHex` keeps the hue for gray and black, and also the saturation for black.
- The hex field is the kit `Input` without its own label. The component renders the label one time. The swatch and the field both use it as the accessible name.
- The panel renders only while it is open. When `showPopover` is present, the component calls it one time on open and sets `position: fixed` with the computed `top` and `left`. The native light dismiss and the Escape close request give a `beforetoggle` event, and the component reads `open` from it.
- A swatch press while the panel is open closes the panel. The component records the open state at `pointerdown`, because the native light dismiss closes the panel before the `click`.
- The component does not throttle. The host decides.

## Structure

- Add `src/lib/components/ColorPicker.svelte`, `color.ts`, and `place-panel.ts`.
- Add `src/lib/components/__tests__/color.test.ts`, `place-panel.test.ts`, `ColorPicker.test.ts`, and a binding harness `ColorPickerHarness.svelte`.
- Export `ColorPicker` and the type `Hsv` in `src/lib/index.ts`.
- Add a `ColorPicker` section to `playground/src/routes/+page.svelte`. One case is in a box with `transform: scale(0.75)` and `overflow: hidden`.
- Set `package.json` version `0.2.0`.

## Operations

1. Add this spec.
2. Write the `color.ts` tests, see them fail, and write the functions.
3. Write the component tests, see them fail, and write the component and the placement function.
4. Export the component. Run build, test, check, and lint. Make sure that `dist/components/ColorPicker.svelte.d.ts` exists.
5. Add the playground section. Look at the open panel in each case, in the light and the dark theme.
6. Set the version and run the publish dry run.

## Norms

- Follow the constitution and `AGENTS.md`. Svelte 5 runes, functional TypeScript, and no new dependency.
- Unit tests for the pure color and placement functions. Component tests in happy-dom for the behavior of R1–R4. A playground check in a browser for the look and the top-layer placement.
- No UI text other than the label that the host gives.

## Safeguards

- Do not add alpha or a new token.
- Do not add a second primitive kit or a third-party picker.
- Do not change `docs/design-system.pen` without the Pencil MCP.
- Do not publish from a local machine. The CI publish job on `main` publishes `0.2.0`.
