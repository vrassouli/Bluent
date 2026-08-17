# Stable release readiness

**Audit date:** 2026-07-26

**Release branch:** `release/1.0.367`

**Base commit:** `f1cb349`

**Tracking:** [Issue #381](https://github.com/vrassouli/Bluent/issues/381)

**Preparation:** [Issue #379](https://github.com/vrassouli/Bluent/issues/379)
and [PR #380](https://github.com/vrassouli/Bluent/pull/380) — completed

## Decision status

The maintainer approved a stable release through the protected Sprint 3
workflow.

**Approved version and date:** `1.0.367` — 2026-07-26

The existing five-package set is unchanged. `Bluent.Core` references in Issue
#381 are package-ID typos; the published Core package remains
`Bluent.UI.Core`. No package rename or migration change is part of this
release.

No package, tag, or GitHub Release is created by this finalization work.

## Repository reconciliation

- PR [#377](https://github.com/vrassouli/Bluent/pull/377) merged into `Dev` on
  2026-07-25.
- PR [#378](https://github.com/vrassouli/Bluent/pull/378) merged into `Dev` on
  2026-07-25.
- PR [#380](https://github.com/vrassouli/Bluent/pull/380) merged into `Dev` on
  2026-07-26.
- `Dev` resolved to merge commit `f1cb349` before the final release branch was
  created.
- The publication set remains exactly five packages:
  `Bluent.UI.Core`, `Bluent.UI`, `Bluent.UI.Charts`,
  `Bluent.UI.Diagrams`, and `Bluent.UI.Utilities`.

## Published package evidence

NuGet's official V3 flat-container endpoints were queried for each exact
package and version.

| Package | Latest verified version | Published (UTC) | Direct Bluent dependency |
| --- | --- | --- | --- |
| `Bluent.UI.Core` | `1.0.366` | 2026-07-25 13:05:56 | None |
| `Bluent.UI` | `1.0.366` | 2026-07-25 13:05:56 | `Bluent.UI.Core` `1.0.366` |
| `Bluent.UI.Charts` | `1.0.366` | 2026-07-25 13:05:56 | `Bluent.UI.Core` `1.0.366` |
| `Bluent.UI.Diagrams` | `1.0.366` | 2026-07-25 13:05:57 | `Bluent.UI.Core` `1.0.366` |
| `Bluent.UI.Utilities` | `1.0.366` | 2026-07-25 13:05:57 | `Bluent.UI` `1.0.366` |

GitHub Actions run
[#30159062898](https://github.com/vrassouli/Bluent/actions/runs/30159062898)
was legacy publish workflow run number 366. It was triggered by a push to
`master` at commit `9056d1c5b3b9f0d714854da0a1712efa55fd3ed8` and completed
successfully immediately before Sprint 3 replaced that workflow. The commit's
tree is identical to Sprint 3's starting `Dev` commit
`864f0d308775e4fdebacc1c12504a098ad1cc73c`.

Consequences:

- `1.0.366` is immutable and cannot be the candidate version.
- It was published before the protected workflow existed.
- It has no repository tag or GitHub Release.
- Its already-shipped changes are now recorded in the dated `1.0.366`
  changelog section instead of being attributed to the next release.

## Approved version

### Exact version

`1.0.367`, approved by the maintainer for 2026-07-26.

### SemVer justification

- All five packages are already on the stable `1.0.x` line.
- `1.0.366` is the highest verified published version for every package.
- Changes since the `1.0.366` package tree add release and quality
  infrastructure, compatibility evidence, and warning fixes intended to
  preserve existing behavior.
- There is no approved incompatible public API, behavior, package-boundary,
  target-framework, or static-asset change.

A patch increment to `1.0.367` is therefore the smallest SemVer-correct
successor. A minor or major increment would overstate the compatibility impact.

### Why stable rather than preview

- The maintainer explicitly selected the stable channel.
- Consumers already use stable `1.0.x` packages; a preview suffix would move
  the release onto a less stable channel without a corresponding experimental
  API or compatibility change.
- Sprint 3 established a zero-warning build, full tests, aligned package
  validation, deterministic notes, and an artifact-only dry-run path.

### Migration impact

No version-specific consumer migration is required by the audited changes.
Consumers should update directly installed Bluent packages together to keep
their versions aligned. The canonical setup, namespaces, service registration,
container, and asset paths remain unchanged.

### Risks

- This will be the first production use of the replacement workflow.
- The maintainer reports that the protected `nuget-production` environment
  exists and its `NUGET_API_KEY` secret is configured. The secret value is not
  inspected; the protected production workflow will prove the configuration
  only after separate publication authorization.
- NuGet cannot publish five packages atomically. Preflight and dependency-order
  publication reduce, but cannot eliminate, partial-publication risk.
- The already-published `1.0.366` package README cannot be edited in place, so
  its unsupported-image warning remains until a corrected version is
  published.

## Package and metadata audit

Current source and the release validator agree on these exact relationships:

| Package | Internal dependency required at the exact release version |
| --- | --- |
| `Bluent.UI.Core` | None |
| `Bluent.UI` | `Bluent.UI.Core` |
| `Bluent.UI.Charts` | `Bluent.UI.Core` |
| `Bluent.UI.Diagrams` | `Bluent.UI.Core` |
| `Bluent.UI.Utilities` | `Bluent.UI` |

All five projects target `net10.0`, identify the Git repository, use the
Apache-2.0 license expression, and package the repository README. The release
workflow overrides all five package versions together and validates exact
internal dependency versions. Applications normally install feature packages
and allow NuGet to resolve Core transitively.

The root README, canonical Getting Started guide, package guidance, migration
guidance, project metadata, and release workflow agree on package names and
setup. This preparation adds the missing NuGet link for
`Bluent.UI.Utilities` in the root README.

The README packed into all five `1.0.366` packages contains a relative landing
screenshot path. NuGet.org does not render relative images and reports an
owner-visible unsupported-image warning. This preparation replaces that source
with an HTTPS `raw.githubusercontent.com` URL pinned to commit
`56812a0f324a47df51c50e5030cbe696ea3a3e92`, where the verified screenshot is
immutable. The existing `img.shields.io` badges already use a trusted host.

The package validator now reads the actual README from each of the five
archives, records its image sources, and rejects relative paths, non-HTTPS
sources, and hosts outside NuGet.org's documented allowlist. The published
`1.0.366` packages are immutable; the package-page warning can disappear only
after a corrected new version is published.

## Changelog and migration audit

The previous `Unreleased` section mixed changes already shipped in `1.0.366`
with post-`1.0.366` work. It was not suitable as `1.0.367` release notes.

The preparation and finalization work:

- moves the already-shipped entries into a dated `1.0.366` section;
- records the absence of a corresponding tag and GitHub Release;
- moves the approved post-`1.0.366` release, quality, and compatibility work
  into the dated `1.0.367` section;
- creates a fresh empty, category-complete `Unreleased` section;
- records that no version-specific consumer migration is required.

No breaking entry or version-specific migration guide is required.

## Workflow and repository prerequisites

The package validator required one additional release-safety check for
NuGet.org-compatible README images. With that check added, the replacement
workflow:

- accepts an explicit SemVer;
- prevents pull-request publication;
- requires an exact matching `v<version>` tag for publishing;
- builds and tests before packing;
- validates exactly five aligned packages and their metadata;
- validates every packaged README image against NuGet.org's trusted sources;
- generates deterministic changelog notes;
- preflights all five immutable NuGet versions;
- publishes through `nuget-production`;
- creates a GitHub Release only after NuGet publication.

The maintainer confirmed that `nuget-production` exists and the scoped
`NUGET_API_KEY` environment secret is configured. Secret contents were not
inspected. Before any production action, the maintainer still must:

- [ ] Review and merge the final release pull request.
- [ ] Review the five exact dry-run packages, validation report, and notes.
- [ ] Authorize the matching annotated `v1.0.367` tag on the exact merged
  release commit.
- [ ] Authorize the production workflow run from that tag with version
  `1.0.367` and `publish: true`.
- [ ] Approve the protected `nuget-production` deployment when prompted.

## Preparation validation record

Local environment: macOS 26.5, Apple Silicon, .NET SDK 10.0.300, and .NET
runtime 10.0.8.

| Check | Result |
| --- | --- |
| `dotnet tool restore` | Passed |
| `dotnet restore Bluent.sln` | Canceled after prolonged NuGet network inactivity; no restore completion is claimed |
| Release build with `--no-restore -warnaserror` | Passed with 0 warnings and 0 errors using the previously restored assets |
| Full solution tests | Passed 19/19 |
| Release-tool tests | Passed 6/6, including trusted and rejected README image sources |
| Five-package pack | Passed at non-publish version `1.0.367-validation.2` |
| Package validation | Passed IDs, aligned versions, metadata, README, trusted README image sources, license, `net10.0`, static assets, repository commit, and exact internal dependencies |
| Deterministic notes | Passed from `Unreleased`, with the required dry-run notice |
| Clean Blazor WebAssembly consumer | Passed restore and zero-warning Release build with `Bluent.UI`, Charts, Diagrams, and Utilities directly referenced; Core resolved transitively |
| Markdown links | Passed across 34 maintained files |
| Workflow YAML | All three workflow files parsed |
| Focused rendered accessibility | Passed four compatibility routes; not a WCAG conformance claim |
| Whitespace | `git diff --check origin/Dev` passed |
| Candidate availability | Official NuGet V2 endpoints returned HTTP 404 for `1.0.367` on all five package IDs |

The first clean-consumer attempt used `/tmp`, which is a symlink to
`/private/tmp` on this Mac. Razor source generation failed to resolve the
template's own `Layout` namespace. An otherwise package-free control template
failed identically, proving the failure was not introduced by Bluent. Repeating
the control and Bluent consumers using the canonical `/private/tmp` path
passed. Both the failed attempt and the controlled result are retained here.

The package validation report and generated notes were inspected in the
temporary validation directory. Each of the five package records contains the
four `img.shields.io` badges and the commit-pinned `raw.githubusercontent.com`
screenshot, with no relative or unsupported image source. No package was
pushed to NuGet.

## Preparation GitHub Actions evidence

PR #380 head `927dd201638ba812c021ee42748fad61dd87ad3d` produced:

- [Quality run #30189474232](https://github.com/vrassouli/Bluent/actions/runs/30189474232),
  which passed the build, tests, five-package inspection, links, workflow YAML,
  whitespace, and focused accessibility smoke.
- [Release packages run #30189474228](https://github.com/vrassouli/Bluent/actions/runs/30189474228),
  whose artifact-validation job passed. The NuGet publication and GitHub
  Release jobs were skipped as designed.

The downloaded `bluent-0.0.0-ci.378` artifact contained exactly five packages,
`release/package-validation.json`, and `release/release-notes.md`. The report
records the pull-request merge ref commit
`0a79c805d9be8d934d078103ee985e7ffff51114`, aligned version
`0.0.0-ci.378`, the expected internal dependency graph, expected static assets,
and the same five trusted README image sources for every package. Each package
nuspec contains that same repository commit. Direct inspection of all five
archived README files passed the trusted-source validator. The notes are a
deterministic `Unreleased` preview with the required dry-run warning and the
then-proposed `1.0.367` recommendation.

No publication job ran, and no external release state changed.

## Final `1.0.367` validation

Local environment: macOS 26.5, Apple Silicon, .NET SDK 10.0.300, and .NET
runtime 10.0.8.

| Check | Result |
| --- | --- |
| `dotnet tool restore` | Passed |
| `dotnet restore Bluent.sln` | Passed |
| Release build with `--no-restore -warnaserror` | Passed with 0 warnings and 0 errors |
| Full solution tests | Passed 19/19 |
| Release-tool tests | Passed 7/7 |
| Exact five-package pack | Passed at `1.0.367` |
| Package validation | Passed IDs, aligned versions, exact internal dependencies, repository commit, license, `net10.0`, README, trusted README image sources, and expected static assets |
| Deterministic notes | Passed from the dated `1.0.367` section |
| Clean Blazor WebAssembly consumer | Passed restore and zero-warning Release build with `Bluent.UI`, Charts, Diagrams, and Utilities directly referenced; `Bluent.UI.Core` resolved transitively |
| Markdown links | Passed across 34 maintained files |
| Workflow YAML | All three workflow files parsed |
| Focused rendered accessibility | Passed four compatibility routes; not a WCAG conformance claim |
| Whitespace | `git diff --check origin/Dev` passed |
| Candidate availability | Official NuGet V3 flat-container preflight confirmed `1.0.367` is unused for all five package IDs |

Exact package metadata, dependency, README, clean-consumer, repository-commit,
Quality workflow, artifact-only Release workflow, and downloaded-artifact
evidence is recorded in the final release pull request so recording the
evidence does not mutate the exact validated candidate afterward.

The final pull request exposed and corrected one additional dry-run edge case:
after release finalization creates an empty `Unreleased` section, synthetic
pull-request package versions now use the latest non-empty dated release
section for deterministic preview notes. Exact-version artifact and publication
runs still require their matching dated changelog section.
