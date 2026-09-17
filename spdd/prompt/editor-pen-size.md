# Editor pen size repair

## Requirements
Selected pen size must control each new stroke in sketch and frame mode. Pen pressure must scale the selected size. Tool and color changes must retain the selected size.

## Entities
Editor instance, toolbar state, pressure brush, and saved Fabric path.

## Approach
Read the current base size from toolbar state in the pressure brush callback. Remove the duplicate editor size state. Preserve the default size of 10.

## Structure
Change the shared editor source and add focused unit tests. Update the corresponding vendored build in `vcheki_live`. Use a separate `bugfix/editor-pen-size` branch per repository.

## Operations
1. Reproduce with a failing test against real editor and brush behavior.
2. Remove the stale size source.
3. Run editor tests and the shared package tests and build.
4. Update the app vendor file. Verify actual strokes in a browser using the app editor package.
5. Run the app asset build and `mix precommit`. Record any existing failures separately.

## Norms
Follow the ecosystem constitution and local agent instructions. Add no UI copy or styling. Change no storage, email, schema, or image delivery behavior. Use short prose. Preserve unrelated changes.

## Safeguards
Assert saved stroke widths, not just toolbar state. Cover size changes, pressure, and tool changes. Do not deploy, publish, or change production data.

## CI repair
The pnpm setup action must use the `packageManager` version in `package.json`. Remove the separate `version: 9` setting from both workflow jobs. CI must complete install, build, and tests on Node 22. Keep the package version and runtime behavior unchanged.
