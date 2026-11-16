# Color picker

OpenSekai needs one color control for its Blueprint editor and its Inspector. The Blueprint editor gets a Color value type (OpenSekai bundle B38, issue danirukun/opensekai#80). Node inputs, node settings, and variable defaults need a color editor. The Inspector already edits light colors, the FPS counter color, and the grading tint.

The kit has no color control. `Input` accepts the types text, email, password, number, and datetime-local only. OpenSekai now uses `ColorField.svelte`: a kit `Input` for the hex text and a native `<input type="color">`. The native control opens the system color panel. That panel is outside the editor theme, and its behavior is different on each platform. The constitution (rule 9) requires product UI from this kit. A second picker in the product is not permitted when the kit can have the control.

The kit has no general popover. `Dropdown` and `Combobox` put their lists in an `absolute` box under their root and close on a document click. That box is clipped by an `overflow: hidden` parent and is scaled by a `transform` parent. The Blueprint canvas has both. A top-layer popover (`popover="auto"`, `showPopover()`) is not clipped or scaled. WKWebView supports it from Safari 17. happy-dom 20 has no `showPopover`, so the component needs a fallback, and the tests use it.

All saved OpenSekai colors are lowercase `#rrggbb`. The picker uses that form only and has no alpha.

The picker keeps its color state in HSV. A hex value for black or gray has no hue. If the picker reads its state from the hex after each change, the hue is lost when the user moves the brightness to zero. The picker keeps hue and saturation while the hex has none.

A host can save on each change or at the end of a gesture. The picker gives `oninput` for each change and `onchange` one time at the end of a pointer drag or a key repeat. The host decides about throttling.

## Not in scope

- Alpha, color spaces, named colors, and a palette of saved colors.
- Changes to `docs/design-system.pen`. That file changes only through the Pencil MCP, and the MCP was not available for this change. A follow-up adds the picker to the design file.
- The OpenSekai change to `ColorField.svelte`. OpenSekai B38 PR 2 does it after this release.
