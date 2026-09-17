# Package publishing failure

Main run 35208315604 passes install, build, and all 45 tests. The publish job then fails with EPRIVATE. The root package has `private: true`, which blocks registry publication. The README and workflow require publication to GitHub Packages.

A local `pnpm publish --dry-run --no-git-checks` succeeds even with this flag. A dry run alone cannot detect this failure. PR checks need an explicit package metadata check as well as the dry run.

Remove the root publication block and link the package to its GitHub repository. Keep the playground private. Keep the existing registry and version. Actual registry authentication and upload can only be verified by the main publish job after merge.
