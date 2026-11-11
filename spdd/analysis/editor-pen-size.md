# Editor pen size investigation

The size buttons update the selected toolbar size and brush width. At stroke start and movement, the pressure brush reads a second size value in `createSketchEditor`. That value stays at 10. This affects mouse, touch, and pen input in sketch and frame mode.

The source of truth is `oshi-connect-ui/src/lib/editor/index.ts`. `vcheki_live` ships a copy under `assets/vendor/oshi-connect-ui`. Fix the source first, then copy the changed build file to the app. Keep the existing unrelated app changes.

Reproduce by selecting size 4, drawing a stroke, selecting size 40, and drawing again. Check saved path widths as well as the selected button. Both paths currently have width 10 with mouse input.

## Verification — 2026-09-17

- Reproduced in Chrome with the app's vendored editor: size 4 and size 40 both produced width 10 before the fix.
- Added three regression tests with the real editor, toolbar, pressure brush, and Fabric paths. The test environment replaces only the missing 2D renderer. All three tests failed before the fix and passed after it.
- Tested default size, repeated size changes, pen pressure, mouse and touch input, color changes, neon, outline, and return to pencil.
- Shared UI suite: 45 tests passed. Package build passed.
- App asset build passed. `mix precommit`: 157 tests passed.
- Chrome checks with the rebuilt app editor package: sizes 4, 10, 20, and 40 produced saved path widths 4, 10, 20, and 40 in both sketch and frame mode.
- Browser checks used an isolated local editor page and a local image. They did not use a live event or test uploads. Pen pressure was tested with synthetic input, not physical pen hardware.
- The optional UI type check reports 30 errors and two warnings. A check against the unchanged source produced identical diagnostics after line numbers were removed. This fix adds no type errors.

## Delivery

Both repositories use `bugfix/editor-pen-size`. The shared UI source fix must be included when preparing the app's editor vendor package. Build the UI package first, then run the app's vendor sync and asset build. The vendor directory is ignored by Git. The app's tracked bundle contains the fix.

The app had unrelated local edits before this fix. Keep them out of the bugfix commits. The app bundle change must contain only the pen-size repair; preserve its existing minified format in Git. No production deployment is part of this change.

## CI investigation — 2026-09-17
Run 35206726756 failed in `pnpm/action-setup@v4`, before dependency installation. The action rejected `version: 9` because `package.json` already declares `pnpm@9.15.0`. Both jobs have this duplicate setting. Remove it from the workflow so package metadata controls the pnpm version. The failure is unrelated to the editor test assertions.
