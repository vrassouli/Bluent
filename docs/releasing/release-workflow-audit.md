# Release Workflow Audit

**Audit date:** 2026-07-25  
**Audited commit:** `864f0d308775e4fdebacc1c12504a098ad1cc73c`  
**Branch at audit start:** `Dev`  
**Environment:** macOS 26.5, Apple Silicon, .NET SDK 10.0.300  
**Tracking:** [Sprint 3 Issue #372](https://github.com/vrassouli/Bluent/issues/372)

## Summary

Bluent has five public NuGet packages and an existing publication workflow, but
the current process is not a safe basis for the next release.

The workflow calculates `1.0.<GitHub run number>` from repository variables,
can execute for a push to `master`, manual dispatch, or a published GitHub
Release, and proceeds directly from packing to sequential NuGet pushes. Its
test job is commented out. It does not validate the full solution, package
metadata, internal dependency versions, changelog release notes, the requested
version, or whether all five versions are available before publishing.

The repository currently has no Git tags and no GitHub Releases, while NuGet
contains historical packages through `1.0.365`. Those packages therefore
cannot be traced through the documented tag and GitHub Release policy.

## Evidence sources

- `.github/workflows/publish.yml`
- `.github/workflows/sprint-1-validation.yml`
- `.github/workflows/static.yml`
- the five packable project files under `src/`
- `RELEASING.md` and `CHANGELOG.md`
- `git ls-remote --tags origin`
- the public GitHub Releases, tags, and environments APIs
- the official NuGet V3 flat-container version indexes
- `dotnet sln Bluent.sln list`

No secret values were queried or recorded.

## Current version sources and behavior

The project files do not define `Version`, `VersionPrefix`,
`VersionSuffix`, or `PackageVersion`.

The publication workflow defines:

```yaml
Version: ${{ vars.VERSION_MAJOR }}.${{ vars.VERSION_MINOR }}.${{ github.run_number }}
```

and passes it to a solution-wide pack:

```text
dotnet pack --configuration Release --output <directory> /p:Version=<version>
```

Consequences:

- Repository variables `VERSION_MAJOR` and `VERSION_MINOR` supply the first
  two components. Their values are not stored in the repository.
- `github.run_number` supplies the patch component and increases per workflow,
  not per package or SemVer intent.
- A local pack with no explicit version uses the .NET SDK default package
  version behavior rather than the workflow version.
- The workflow comment mentions MinVer, but no MinVer package or configuration
  is present and the workflow supplies the version directly.
- The requested release version is not validated as SemVer.
- A Git tag does not currently determine the package version.
- The release/tag and package version can disagree.

## Packable projects and package IDs

The solution contains nine projects. The test project explicitly sets
`IsPackable` to `false`; the demo projects are application projects. The five
public library projects are:

| Project | NuGet package ID | Direct Bluent project dependency |
| --- | --- | --- |
| `src/Bluent.Core/Bluent.Core.csproj` | `Bluent.UI.Core` | None |
| `src/Bluent.UI/Bluent.UI.csproj` | `Bluent.UI` | `Bluent.UI.Core` |
| `src/Bluent.UI.Charts/Bluent.UI.Charts.csproj` | `Bluent.UI.Charts` | `Bluent.UI.Core` |
| `src/Bluent.UI.Diagrams/Bluent.UI.Diagrams.csproj` | `Bluent.UI.Diagrams` | `Bluent.UI.Core` |
| `src/Bluent.UI.Utilities/Bluent.UI.Utilities.csproj` | `Bluent.UI.Utilities` | `Bluent.UI` |

All five target `net10.0`, include the repository README, use the Apache-2.0
license expression, and identify the Git repository. The package projects do
not explicitly set `IsPackable`; the Razor SDK library default makes them
packable.

Project references become NuGet dependencies during packing. A reliable release
must verify that each internal dependency has the exact requested aligned
version.

## Current published packages

The official NuGet version indexes were checked on 2026-07-25:

| Package | First listed version | Latest listed version |
| --- | --- | --- |
| `Bluent.UI.Core` | `1.0.211` | `1.0.365` |
| `Bluent.UI` | `1.0.13` | `1.0.365` |
| `Bluent.UI.Charts` | `1.0.200` | `1.0.365` |
| `Bluent.UI.Diagrams` | `1.0.211` | `1.0.365` |
| `Bluent.UI.Utilities` | `1.0.281` | `1.0.365` |

The indexes contain gaps. This audit does not infer causes for missing numbers
or manufacture historical release notes.

## Tags and GitHub Releases

At the audited commit:

- `git tag` returned no local tags.
- `git ls-remote --tags origin` returned no remote tags.
- GitHub's public tags API returned an empty list.
- GitHub's public Releases API returned an empty list.

This conflicts with the documented future policy that an annotated
`vMAJOR.MINOR.PATCH` tag identifies the exact release commit and that a GitHub
Release communicates the release.

## Existing workflows

### `.github/workflows/publish.yml`

Triggers:

- manual `workflow_dispatch`
- every push to `master`
- a GitHub Release being published

Jobs:

1. `create-nuget` checks out full history, installs .NET 10, packs the solution
   with the calculated version, and uploads all `.nupkg` files.
2. `deploy` downloads the artifact and pushes files matching
   `Bluent.*<version>.nupkg` to NuGet.org with `--skip-duplicate`.

The former test job and release-only condition are commented out.

### `.github/workflows/sprint-1-validation.yml`

This workflow restores tools and the solution, builds Release, runs tests,
packs the five projects explicitly, checks local Markdown links, and uploads
packages. It is named for Sprint 1 and does not validate package metadata,
dependencies, warnings, release notes, or workflow YAML.

### `.github/workflows/static.yml`

This workflow deploys the WebAssembly demo to GitHub Pages from `Dev`. It is a
deployment workflow, not a package-release workflow, and was modernized and
validated during Sprint 2.

## Secrets, variables, permissions, and environments

Repository references found in the workflow:

- Secret name: `NUGET_APIKEY`
- Repository variables: `VERSION_MAJOR`, `VERSION_MINOR`, and unused
  `ENV_CONTEXT_VAR`

Values were not inspected.

The publish workflow does not declare a GitHub environment. The public
environments API reports only `github-pages`, with a branch policy. There is no
repository-visible NuGet production environment providing required-reviewer or
branch/tag protection for package publication.

The publish workflow also does not declare minimum `permissions`. A replacement
workflow should use least privilege, grant `contents: write` only to the job
that creates the GitHub Release, and isolate NuGet credentials in a protected
production environment.

## Current release steps

The current effective automation is:

1. A maintainer or repository event triggers `publish.yml`.
2. GitHub Actions combines two repository variables with the workflow run
   number.
3. The workflow packs the solution with that version.
4. It uploads matching `.nupkg` files as a seven-day artifact.
5. It downloads the artifact in a dependent job.
6. It sequentially pushes matching packages to NuGet.org.

The repository documentation separately asks a release owner to update the
changelog, create a release commit, tag it, publish packages, and create a
GitHub Release, but the workflow neither enforces nor implements that sequence.

## Duplicate and partial-publication risks

### Accidental publication

- A push to `master` can start package publication.
- Manual dispatch has no dry-run/publish distinction.
- The deploy job is not restricted to the `release` event.
- No production environment approval is required.

### Duplicate or inconsistent publication

- `--skip-duplicate` converts an already-published package into a successful
  no-op, so a rerun can appear successful even when artifacts differ from the
  immutable package already on NuGet.
- There is no preflight check that all five requested IDs/versions are absent.
- The version is coupled to the workflow run number rather than an explicit
  reviewed release version.

### Partial publication

- Packages are pushed sequentially and NuGet has no multi-package atomic
  transaction.
- A network, permission, validation, or service failure after one push can
  leave only part of the aligned package set published.
- The current workflow performs no full preflight before the first push.
- The current artifact glob does not prove that exactly the intended five
  packages are present.

### Traceability and release-note risks

- Published packages have no corresponding repository tags or GitHub Releases.
- Package `RepositoryCommit` is not checked.
- The workflow does not require a versioned changelog section.
- GitHub Release notes are not generated or validated deterministically.

## Required replacement controls

The Sprint 3 replacement should:

1. Use an explicit SemVer input for manual dry runs and a matching `v<SemVer>`
   tag for the authorized release path.
2. Refuse ordinary branch-push publication.
3. Run restore, full Release build, tests, and explicit five-project packing
   before any release mutation.
4. Validate exactly five package IDs and versions, metadata, contents,
   repository commit, and exact aligned internal dependencies.
5. Extract release notes from the exact versioned `CHANGELOG.md` section.
6. Upload packages, symbols where produced, validation reports, and release
   notes before publication.
7. Preflight all five IDs/versions against NuGet and fail if any exists.
8. Put the NuGet push job behind a protected `nuget-production` environment
   with the API key scoped to that environment.
9. Avoid `--skip-duplicate` so an unexpected duplicate is visible.
10. Create the GitHub Release only in the authorized path and only from the
    validated tag/artifacts.
11. Document that preflight and ordering reduce, but cannot make, NuGet's five
    independent pushes atomic.

## Audit disposition

The existing `publish.yml` should not be used to publish another stable release.
Sprint 3 may safely replace it with a dry-run-first workflow. Creating the
`nuget-production` environment, configuring its reviewers/branch policies, and
supplying its secret require maintainer or repository-administrator action.
