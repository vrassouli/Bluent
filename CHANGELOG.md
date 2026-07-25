# Changelog

All notable changes to Bluent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) as described in [RELEASING.md](RELEASING.md).

## [Unreleased]

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

### Fixed

- Dialogs opened from another dialog now stack above the parent instead of closing it, and modal overlays close only their own top layer.
- Corrected invalid NuGet `RepositoryUrl` values.
- Corrected the `Bluent.UI.Utilities` package description, which previously referred to `Bluent.UI.MDI`.
- Cleared stale `TabList` link selection when navigation activates an item in another tab list.

## Release History

Historical releases predate the adoption of this changelog. Existing versions and release notes remain available through [GitHub Releases](https://github.com/vrassouli/Bluent/releases) and NuGet package history.

Future releases will add a dated section here and move the relevant entries from `Unreleased`.
