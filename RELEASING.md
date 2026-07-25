# Versioning and Release Policy

This document defines how Bluent versions, prepares, and communicates releases.

## Versioning

Bluent follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR**: incompatible public API or behavior changes.
- **MINOR**: backward-compatible features and meaningful capability additions.
- **PATCH**: backward-compatible fixes, documentation corrections shipped with packages, and internal improvements.

While a package is below version `1.0.0`, minor versions may contain breaking changes. Any such change must still be deliberate, documented in the changelog and release notes, and accompanied by migration guidance.

Packages in the Bluent ecosystem should use aligned versions when they are released together. If independent package versioning is introduced later, that decision must be documented before use.

## Stability Expectations

- Public components, parameters, events, extension methods, CSS classes intended for consumers, static asset paths, and documented behavior are part of the compatibility surface.
- Accidental implementation details are not guaranteed APIs.
- Deprecation is preferred over immediate removal.
- A deprecated API should normally remain available for at least one minor release unless retaining it creates a security or correctness risk.
- Breaking changes require an explanation, migration steps, and explicit maintainer approval.

## Release Channels

- **Stable releases** use versions such as `1.4.2`.
- **Prereleases** use SemVer suffixes such as `2.0.0-preview.1`, `2.0.0-beta.1`, or `2.0.0-rc.1`.
- Prereleases are intended for validation and may change before the stable release.

## Branch and Tag Policy

- `Dev` is the primary integration branch.
- Focused branches are merged into `Dev` through pull requests.
- A stable release is represented by an annotated tag in the form `vMAJOR.MINOR.PATCH`.
- A prerelease tag includes the SemVer suffix, for example `v2.0.0-preview.1`.
- Tags must point to the exact commit used to build published packages.

## Changelog Policy

Every user-visible change should be added to the `Unreleased` section of [CHANGELOG.md](CHANGELOG.md) under one of:

- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

When releasing:

1. Create a version section from the relevant `Unreleased` entries.
2. Add the release date in `YYYY-MM-DD` format.
3. Leave a fresh empty `Unreleased` section.
4. Link the release section to the Git comparison when practical.

## Release Checklist

### Prepare

- [ ] Confirm the intended version and release scope.
- [ ] Ensure approved changes are merged into `Dev`.
- [ ] Restore tools and dependencies.
- [ ] Build the solution in Release configuration.
- [ ] Run all applicable tests.
- [ ] Pack every package intended for publication.
- [ ] Inspect package contents and metadata.
- [ ] Verify package dependencies and aligned versions.
- [ ] Verify installation and static asset instructions.
- [ ] Update `CHANGELOG.md`.
- [ ] Add migration guidance for breaking changes.
- [ ] Confirm the repository is clean and the release commit is identifiable.

### Validate

At minimum, run:

```bash
dotnet tool restore
dotnet restore Bluent.sln
dotnet build Bluent.sln --configuration Release
dotnet test Bluent.sln --configuration Release --no-build
```

Package validation should include installation into a clean sample application before publishing a stable release.

### Publish

- [ ] Create the release commit.
- [ ] Tag the exact release commit.
- [ ] Build packages from that tag or commit.
- [ ] Publish the intended packages to NuGet.
- [ ] Create a GitHub Release using the changelog as the basis for release notes.
- [ ] Include breaking changes, migrations, known issues, and package versions.
- [ ] Verify package pages, links, license, README, and symbols after publication.

### After Publishing

- [ ] Install the published packages into a clean sample.
- [ ] Verify the live demo where affected.
- [ ] Announce the release through maintained project channels.
- [ ] Open follow-up issues for deferred work or known problems.
- [ ] Re-run relevant AI-readiness benchmark prompts when documentation or public APIs changed.

## Security and Emergency Releases

Security-sensitive reports should not be disclosed in a public issue. Contact the maintainer privately using the contact information on the maintainer's GitHub profile.

A security or critical correctness release may use an abbreviated process, but the build, test, package inspection, changelog, tagging, and post-publication verification steps should still be completed as soon as safely possible.

## Release Ownership

Only the project maintainer or an explicitly authorized release manager may publish official Bluent packages and create official release tags.
