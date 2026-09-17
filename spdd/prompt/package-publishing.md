# Package publishing repair

## Requirements
Allow the UI package to use the existing GitHub Packages publish job. Detect a private root package during PR checks.

## Entities
Root package metadata, playground metadata, and the CI test job.

## Approach
Remove `private: true` from the root package. Set its repository URL. Add an explicit metadata assertion before a publish dry run in the test job. npm dry runs do not enforce the private flag.

## Structure
Change `package.json` and `.github/workflows/ci.yml`. Keep the playground private.

## Operations
1. Confirm EPRIVATE in the main log and reproduce the failing metadata assertion.
2. Correct the package metadata.
3. Add the assertion and dry run to PR checks.
4. Run the metadata check, build, tests, and publish dry run. Open a bugfix PR and inspect its CI result.

## Norms
Follow the ecosystem constitution. Use short prose. Do not change product behavior or add UI text. Use a smoke check for static package configuration.

## Safeguards
Keep the version and GitHub registry unchanged. Do not upload a package or merge as part of local verification. A dry run does not verify registry write access. Report this limit. Later releases require a new package version.
