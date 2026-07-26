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

Use `[Package.Id]` at the start of an entry when a change affects only one or a
subset of packages. Ecosystem-wide entries do not need a package prefix.

Start a breaking entry with `**Breaking:**` and link it to migration guidance
under `docs/compatibility/`. A breaking change must never be inferred only from
a pull request title.

Contributors should update the changelog in the same pull request as a
user-visible component, behavior, static-asset, package, compatibility, or
release-process change. Pure tests, internal refactors, and typo-only
corrections do not require an entry unless they affect shipped behavior or
consumer guidance.

When releasing:

1. Create a version section from the relevant `Unreleased` entries.
2. Add the release date in `YYYY-MM-DD` format.
3. Leave a fresh empty `Unreleased` section.
4. Link the release section to the Git comparison when practical.

The release workflow extracts notes from the exact
`## [MAJOR.MINOR.PATCH] - YYYY-MM-DD` section. A publication run fails if that
section is missing or empty. Artifact-only dry runs may preview notes from
`Unreleased`. When a finalized release leaves `Unreleased` empty, pull-request
dry runs use the latest non-empty dated release section instead. Neither
preview can be used for a real GitHub Release.

## Automated release workflow

`.github/workflows/publish.yml` is the only supported package publication path.
Publication is manual by design. Pull requests to `Dev` also exercise the
artifact-only path with a synthetic `0.0.0-ci.<run>` version so the workflow
itself is proven before merge. The workflow's two dispatch modes are:

- `publish: false` builds and validates artifacts without creating a tag,
  GitHub Release, or NuGet publication.
- `publish: true` is accepted only when the workflow is dispatched from the
  existing annotated tag `v<version>`, publishes through the protected
  `nuget-production` environment, and then creates the GitHub Release.

Pull-request runs cannot enter either publication job.

The workflow:

1. Validates the explicit SemVer input.
2. Restores tools and dependencies.
3. Builds the full solution in Release configuration with warnings treated as
   errors.
4. Runs all tests.
5. Packs exactly `Bluent.UI.Core`, `Bluent.UI`, `Bluent.UI.Charts`,
   `Bluent.UI.Diagrams`, and `Bluent.UI.Utilities` at the requested aligned
   version.
6. Validates package IDs, versions, metadata, README, license, target
   framework, repository commit, and exact aligned internal dependencies.
7. Generates release notes from `CHANGELOG.md`.
8. Uploads packages, validation results, and notes as a 30-day workflow
   artifact.
9. For a publish run, checks that none of the five immutable ID/version pairs
   already exists on NuGet before requesting production approval.
10. Publishes in dependency order without `--skip-duplicate`.
11. Creates the GitHub Release from the validated tag and attaches the package
    artifacts and validation report.

NuGet does not offer an atomic transaction across five package IDs. The
all-package preflight and production approval substantially reduce risk, but an
external failure during sequential pushes can still create a partial release.
If that occurs, stop: do not reuse the version for different bits, record the
published subset, and coordinate recovery with the maintainer.

### Required repository configuration

Before the first real publication, a repository administrator must:

1. Create a GitHub Actions environment named `nuget-production`.
2. Require maintainer approval for that environment and restrict deployment to
   protected release tags where the repository plan permits.
3. Add an environment secret named `NUGET_API_KEY` containing a scoped NuGet
   API key authorized only for the five Bluent package IDs.
4. Keep the existing `github-pages` environment separate.

Secret values must never be committed, printed, copied into release notes, or
stored as repository variables.

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
- [ ] Convert `Unreleased` to a dated version section and create a fresh,
  category-complete `Unreleased` section.
- [ ] Run `Release packages` with `publish: false` from the release commit and
  inspect the uploaded packages, validation JSON, and release notes.

### Validate

At minimum, run:

```bash
dotnet tool restore
dotnet restore Bluent.sln
dotnet build Bluent.sln --configuration Release
dotnet test Bluent.sln --configuration Release --no-build
```

Package validation should include installation into a clean sample application before publishing a stable release.

For a safe dry run:

1. Open **Actions → Release packages → Run workflow**.
2. Select the release commit or branch.
3. Enter the candidate version without a `v` prefix.
4. Leave **Publish** disabled.
5. Confirm `Validate release artifacts` passes.
6. Download `bluent-<version>` and inspect all five packages,
   `package-validation.json`, and `release-notes.md`.

### Publish

- [ ] Create the release commit.
- [ ] Create and push an annotated `v<version>` tag pointing to the exact
  validated release commit.
- [ ] In **Actions → Release packages**, select that tag, enter the same version
  without `v`, enable **Publish**, and start the workflow.
- [ ] Review the validation job and production-environment approval request.
- [ ] Approve NuGet publication only when the tag, version, changelog, five
  packages, validation report, and migration guidance are correct.
- [ ] Confirm the workflow publishes the intended packages and creates the
  GitHub Release using the exact changelog section.
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
