# Changelog

All notable changes to Bluent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) as described in [RELEASING.md](RELEASING.md).

## [Unreleased]

Entries should identify affected packages when a change is not ecosystem-wide,
for example `[Bluent.UI.Charts]`. Breaking changes must start with
`**Breaking:**` and link to migration guidance.

### Added

- A standalone OrderDesk production-pattern reference application with
  customer and order workflows, validation, confirmation, feedback, filtering,
  charting, a lifecycle diagram, light/dark themes, and RTL.
- Ten canonical, task-oriented Bluent examples backed by a standalone
  compilable WebAssembly consumer.
- CI validation that builds documentation examples and proves invalid sample
  references produce a focused compiler failure.
- A repeatable AI-readiness benchmark workspace with preserved prompts and
  responses, structured scoring, ten compiled generated samples, and a dated
  Sprint 4 comparison report.

### Changed

- Expanded canonical Drawer guidance and compiler validation to prevent
  application-owned `DrawerContent` naming collisions.

### Deprecated

- None.

### Removed

- None.

### Fixed

- None.

### Security

- None.

## [1.0.367] - 2026-07-26

No version-specific consumer migration is required. Applications should
continue to update directly installed Bluent packages together to keep their
versions aligned.

### Added

- Deterministic, artifact-first release validation with protected NuGet
  publication and changelog-derived release notes.
- Reproducible Interactive Server, Interactive WebAssembly, Interactive Auto,
  and static SSR compatibility probes.

### Changed

- Replaced run-number-based package publication with an explicit SemVer release
  workflow and an artifact-only dry-run path.
- Established a zero-warning Release build baseline and durable package,
  documentation, workflow, and focused accessibility quality gates.
- Updated render-mode guidance with build and runtime evidence instead of
  unverified compatibility placeholders.

### Deprecated

- None.

### Removed

- None.

### Fixed

- Corrected the packaged README screenshot URL for NuGet.org and added release
  validation that rejects relative or untrusted README image sources.
- Kept pull-request artifact dry runs deterministic after release finalization
  by using the latest dated release notes when `Unreleased` is empty.

### Security

- None.

## [1.0.366] - 2026-07-25

This version was published by the legacy `master`-push workflow before the
protected release workflow was merged. It has no corresponding repository tag
or GitHub Release.

### Added

- Enterprise demo scenarios for customer profiles, operations dashboards, and confirmation workflows.
- Demo showcase context and a verified screenshot gallery for high-value component pages.
- Project vision and outcome-based public roadmap.
- Apache License 2.0 at the repository level.
- Contribution guide, code of conduct, changelog, and release policy.
- GitHub issue and pull request templates.
- Repository-based project relaunch tracking.
- AI readiness and discoverability initiative tracked in Issue #363.

### Changed

- Improved demo navigation, responsive drawer behavior, theme and RTL presentation, and GitHub Pages deployment.
- Repositioned Bluent as a Blazor-native toolkit for modern business applications.
- Rewrote and verified the repository README.
- Improved NuGet package descriptions, tags, repository links, project links, license metadata, and package README metadata.

### Deprecated

- None.

### Removed

- None.

### Fixed

- Dialogs opened from another dialog now stack above the parent instead of closing it, and modal overlays close only their own top layer.
- Corrected invalid NuGet `RepositoryUrl` values.
- Corrected the `Bluent.UI.Utilities` package description, which previously referred to `Bluent.UI.MDI`.
- Cleared stale `TabList` link selection when navigation activates an item in another tab list.

### Security

- None.

## Release History

Versions before `1.0.366` predate the adoption of this changelog. Their package
history remains available on NuGet, but the repository has no historical tags
or GitHub Releases from which complete release notes can be reconstructed.

Future releases will add a dated section here and move the relevant entries from `Unreleased`.

[Unreleased]: https://github.com/vrassouli/Bluent/compare/v1.0.367...Dev
[1.0.367]: https://github.com/vrassouli/Bluent/compare/9056d1c5b3b9f0d714854da0a1712efa55fd3ed8...v1.0.367
