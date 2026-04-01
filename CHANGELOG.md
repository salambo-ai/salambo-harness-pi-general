# Changelog

All notable changes to this template should be documented here.

## Unreleased

### Added

- Created a pi-based sibling template at `salambo-sandbox-pi-sdk`.
- Added a pi-backed sandbox runner and session registry adapter.
- Added project-local `PI_HOME` bootstrap and default pi settings/system prompt files.

### Changed

- Preserved the existing Salambo HTTP and event contract while switching the inner runtime to pi.
- Updated Docker/image materialization to install the pi CLI instead of Codex tooling.
- Rewrote the top-level docs to describe the pi template instead of the copied Codex template.
