# Sprint 3 — Release Reliability and Compatibility

## Tracking

- **Branch:** `release/sprint-3-reliability`
- **Base:** `Dev`
- **Issue:** [#372](https://github.com/vrassouli/Bluent/issues/372)
- **Status:** In progress
- **Started:** 2026-07-25

## Objective

Make Bluent safely and predictably releasable before community outreach or new
product development begins.

## Scope

1. Audit the existing release workflow and publication history.
2. Replace the unsafe publication path with explicit, validated,
   artifact-first release automation.
3. Make changelog-derived release notes deterministic.
4. Inventory and triage all Release compiler warnings.
5. Complete or substantially progress the render-mode validation in
   [Issue #366](https://github.com/vrassouli/Bluent/issues/366).
6. Add practical, maintainable CI quality gates.
7. Create small contributor-ready issues after the reliability foundations
   are established.

## Non-goals

- New public components or unrelated product features.
- Breaking API changes or package-boundary changes without separate maintainer
  approval.
- Publishing a real stable NuGet release without explicit maintainer
  authorization.
- Community outreach, launch announcements, or Sprint 4 work.
- Expanding [Issue #363](https://github.com/vrassouli/Bluent/issues/363) unless
  a release or compatibility change requires a documentation correction.
- Claiming compatibility, accessibility, or release readiness without the
  evidence required by `.bluent/QUALITY.md`.

## Ordered workstreams

### 1. Release workflow audit

- [x] Identify current version sources and package-version behavior.
- [x] Inventory packable projects, package IDs, and package dependencies.
- [x] Inspect repository tags, GitHub Releases, and published NuGet versions.
- [x] Inspect existing release workflows, referenced secrets/variables, and
  environments without exposing values.
- [x] Document current manual steps and duplicate/partial-publication risks.
- [x] Publish the audit at
  `docs/releasing/release-workflow-audit.md`.

### 2. Predictable release automation

- [x] Require an explicit manual release action; require an exact matching tag
  for publication.
- [x] Validate the requested SemVer and require the tag/version to agree.
- [x] Restore tools and dependencies.
- [x] Build the full solution in Release configuration.
- [x] Run all tests.
- [x] Pack exactly the five public NuGet packages at one aligned version.
- [x] Validate package count, IDs, versions, metadata, contents, and internal
  dependencies.
- [x] Upload immutable package and release-note artifacts.
- [x] Add an artifact-only dry-run path.
- [x] Exercise that dry-run automatically on pull requests to `Dev` with a
  synthetic version so the release workflow is proven before merge.
- [x] Create a GitHub Release only after validation in the authorized path.
- [x] Publish to NuGet only after validation and production-environment
  approval.
- [x] Fail before publication when any requested package version already
  exists on NuGet.
- [x] Document the residual limitation that NuGet does not provide a
  multi-package atomic transaction.

### 3. Release notes and changelog policy

- [x] Give `Unreleased` the complete Keep a Changelog category structure.
- [x] Define package-impact notation without manufacturing history.
- [x] Require explicit breaking-change and migration entries.
- [x] Add deterministic extraction/validation of a versioned changelog section.
- [x] Document when contributors must update the changelog.

### 4. Compiler warning triage

- [x] Run a clean Release build and capture every warning.
- [x] Record warning code, project, location, cause, pre-existing status,
  recommended resolution, risk, and disposition.
- [x] Fix low-risk warnings that have clearly correct resolutions.
- [x] Keep any remaining warning only with a narrow, documented justification.
  No warning remained.
- [x] Establish a zero-warning baseline and reject unexpected additions.

### 5. Render-mode compatibility

- [x] Add or configure reproducible minimal consumers for WebAssembly,
  Interactive Server, Interactive WebAssembly, and Interactive Auto.
- [x] Validate applicable static SSR display-only behavior.
- [x] Verify registration, imports, styles, containers, DI scopes, prerender,
  JavaScript loading, callbacks, binding, navigation, dialogs, toasts,
  overlays, disposal, and console state where relevant. Transient circuit
  reconnection remains explicitly unverified.
- [x] Record commit, SDK, OS, browser, host, results, and limitations in
  `docs/compatibility/hosting-and-render-modes.md`.
- [x] Update Issue #366 with the committed evidence.

### 6. Quality gates

- [x] Consolidate or replace sprint-specific validation with durable CI.
- [x] Gate clean Release build, tests, five-package packing, package metadata,
  and internal dependencies.
- [x] Check Markdown links.
- [x] Reject unexpected compiler warnings.
- [x] Check workflow YAML and repository diff/format hygiene.
- [x] Add focused accessibility checks for selected demo pages when they can be
  run repeatably; do not claim complete WCAG compliance.

### 7. Contributor-ready work

- [x] Create several small issues only after foundations and remaining gaps are
  known.
- [x] Give each issue observable acceptance criteria and validation guidance.
- [x] Apply `good first issue` only to genuinely low-risk,
  independently-completable work.
- [x] Keep architectural changes and broad public API work out of beginner
  issues.
- [x] Update contribution guidance for the new gates.

Created issues:

- [#374](https://github.com/vrassouli/Bluent/issues/374) — Checkbox
  documentation.
- [#375](https://github.com/vrassouli/Bluent/issues/375) — synthetic package
  validator tests.
- [#376](https://github.com/vrassouli/Bluent/issues/376) — Badge
  documentation.

## Local validation evidence

On macOS 26.5, Apple Silicon, and .NET SDK 10.0.300:

- tool restore passed;
- solution restore passed earlier in the session; a later clean-gate retry was
  cancelled after prolonged NuGet network inactivity;
- clean Release build passed with warnings treated as errors: 0 warnings,
  0 errors;
- 19 of 19 .NET tests passed;
- 4 of 4 release-tool unit tests passed;
- all five `1.0.366-preview.1` dry-run packages packed and passed ID, version,
  metadata, repository commit, README, framework, asset, and aligned internal
  dependency validation;
- Unreleased release-note preview generation passed;
- Markdown links passed across 33 maintained files;
- all three workflow YAML files parsed;
- focused rendered accessibility checks passed for four compatibility routes;
- browser runtime checks passed for standalone WebAssembly, Interactive Server,
  Interactive WebAssembly, Interactive Auto, and static SSR display-only
  behavior;
- fresh console checks were clean for the tested interactive modes;
- no NuGet package, tag, or GitHub Release was published or created.

## GitHub Actions evidence

- [Quality run #4](https://github.com/vrassouli/Bluent/actions/runs/30159984912)
  passed every build, test, package, link, workflow, whitespace, and focused
  accessibility-smoke step.
- [Release packages run #367](https://github.com/vrassouli/Bluent/actions/runs/30159984921)
  passed its artifact-only path.
- The downloaded `bluent-0.0.0-ci.367` artifact contained exactly five aligned
  packages, `package-validation.json`, and deterministic `release-notes.md`.
- NuGet preflight/publication and GitHub Release creation were skipped as
  designed; no external release state changed.

## Dependencies

- Sprint 2 and PRs
  [#370](https://github.com/vrassouli/Bluent/pull/370) and
  [#371](https://github.com/vrassouli/Bluent/pull/371) are merged into `Dev`.
- A maintainer-controlled NuGet API key is required for real publication.
- A protected production environment and maintainer approval are required
  before enabling the publish job.
- The maintainer must select the exact stable release version and authorize any
  real stable publication.
- Runtime/browser access is required for render-mode evidence.

## Acceptance criteria

- The current and replacement release processes are documented precisely.
- A safe artifact-only release dry run passes from a clean GitHub Actions run.
- All five packages have an aligned requested version and validated metadata,
  dependencies, README, license, and expected static assets.
- Publication cannot start from an ordinary branch push or unvalidated
  artifact, and pre-existing versions are rejected before the first push.
- Release notes come from one exact versioned `CHANGELOG.md` section.
- Every current compiler warning is fixed or formally triaged.
- CI rejects unexpected new warnings.
- Issue #366 contains reproducible, evidence-backed compatibility results.
- Practical quality gates pass without claiming unmeasured coverage.
- Contributor-ready issues have clear scope and acceptance criteria.
- `.bluent/PROJECT.md`, `.bluent/HANDOFF.md`, Issue #372, and the completion PR
  report the same state.

## Validation requirements

At minimum:

```bash
dotnet tool restore
dotnet restore Bluent.sln
dotnet build Bluent.sln --configuration Release
dotnet test Bluent.sln --configuration Release --no-build
```

Also required:

- Pack and inspect all five public packages.
- Run the release workflow in artifact-only/dry-run mode.
- Inspect generated package and release-note artifacts.
- Validate local Markdown links and changed workflow YAML.
- Build and run relevant render-mode consumers.
- Record browser console state and runtime limitations.
- Use clean GitHub Actions runs as final evidence.
- Record every failed, skipped, or unavailable validation step.

## Known risks

- Historical NuGet versions were generated from repository variables and
  workflow run numbers without corresponding repository tags or GitHub
  Releases.
- The legacy workflow can publish from `master` pushes or manual dispatch
  without full build/test gates.
- `--skip-duplicate` can hide inconsistent reruns.
- NuGet has no atomic multi-package publish operation; prevention and
  preflight checks reduce but cannot eliminate partial publication after an
  external failure.
- Interactive render modes may expose prerender, hydration, circuit,
  reconnection, JavaScript lifecycle, or disposal defects.
- Some warnings may require a justified baseline if a low-risk source fix is
  not available.

## Definition of Done

- [x] A documented, predictable release process exists.
- [x] Release automation has passed a safe dry run.
- [x] All five packages are validated as release artifacts.
- [x] Accidental and partial publication risks are protected against as far as
  the NuGet service permits.
- [x] Changelog and release-note generation are deterministic.
- [x] Existing compiler warnings are fixed or formally triaged.
- [x] CI prevents unexpected new warnings.
- [x] Issue #366 has evidence-backed compatibility results.
- [x] Required render-mode documentation is current.
- [x] Practical quality gates pass.
- [x] Contributor-ready issues exist.
- [x] Project tracking and handoff files reflect the final state.
- [x] The completion PR targets `Dev` and is ready for maintainer review.
- [x] The final PR is not self-merged without explicit maintainer
  authorization.
