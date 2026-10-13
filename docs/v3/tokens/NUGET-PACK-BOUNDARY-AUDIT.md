# #418 — local NuGet pack dependency and isolation evidence

**Checkpoint:** 2026-10-13. **Scope:** local draft task-branch packaging validation; no NuGet.org upload, no `Dev`/2.x merge, no stable release, no declaration that unapproved v3 public APIs are accepted.

Issue #418's acceptance gate requests compilation and package validation. Ran in the **`v3/issue-418-design-tokens`** worktree on Dev01:

```powershell
dotnet build Bluent.sln --configuration Release --no-restore --nologo --verbosity quiet
dotnet test Bluent.sln --configuration Release --no-restore --nologo --verbosity quiet
$localOut = Join-Path $env:TEMP 'bluent-v3-418-pack-validation'
dotnet pack src/Bluent.UI/Bluent.UI.csproj --configuration Release --no-build --no-restore --nologo --output $localOut
python scripts/quality/check_v3_nuget_boundary.py (Join-Path $localOut 'Bluent.UI.1.0.0.nupkg')
```

## Actual result

- **Release solution build:** succeeded, 0 warnings and 0 errors.
- **Solution tests:** the only test `.csproj` currently under `tests/` is `RegexSampleGeneratorTest`; `dotnet test` passed **60/60**. This is not a statement that all Blazor components have a full unit-test suite: interactive UI is separately verified by CDP tests.
- **Local NuGet pack:** succeeded; package `Bluent.UI.1.0.0.nupkg`, **47 ZIP entries**, stored only in a temporary output folder, **not published**. The package ID/version are current project metadata, not a v3 release declaration.
- **Read-only package boundary check:** `scripts/quality/check_v3_nuget_boundary.py` returned **pass=true, zero errors**, 10 legacy brand theme min.css files and components min.css present.

## Intentional opt-in Dialog JS vs unintended demo CSS

The local package **includes** `staticwebassets/v3/issue-418-dialog-focus.preview.js`. This is currently an intentional dependency of the *opt-in D5 Dialog prototype*, referenced by `Dialog.razor.cs` only under explicit `AccessibleName` and Modal/InitialFocus gating, and by `DialogContainer.razor.cs` only when a caller explicitly requested return focus. **Removing this file alone would break the prototype**. This asset's presence does NOT mean the draft feature is accepted or published in stable NuGet, only that a locally packed v3 library must contain the module its source imports.

The Styling Lab's generated `issue-418.opt-in.preview.css` and the various design-only token/portal previews belong to `Bluent.UI.Demo.Pages` or `docs/v3/tokens`, not to the public `Bluent.UI` package. The local package check verifies that **none of these CSS previews** or other unexpected `staticwebassets/v3/` assets cross the library boundary, and validates the guarded source import paths as written.

## Limits and gates

This package probe is a guardrail for the **isolated draft v3 branch**. It does not certify public API stability, prove the published package to be equivalent to NuGet.org, or replace a maintainer-approved version/migration review. If draft D5 Dialog features are rejected, their C#/JS opt-in implementation and package asset should be evaluated **together** and not partially disabled.

The `check_v3_nuget_boundary.py` script is deterministic, uses Python stdlib and does **not** build, publish, modify Git state, or require a NuGet API key.

## Repeatable negative controls and CI workflow

`python -m unittest discover -s scripts/quality -p test_v3_nuget_boundary.py -v` passed **5/5 tests** on Dev01. Tests create temporary ZIP fixtures and establish that missing Word theme CSS, missing opt-in Dialog JS, accidental design-only preview CSS, and unexpected draft v3 JS are all detected and rejected, while a fully valid local fixture passes.

New proposed **`.github/workflows/v3-local-pack-boundary.yml`** runs *only* as a v3 `bluent-v3` PR or manual workflow, with read-only repository permissions. The workflow builds one `Bluent.UI` package **locally inside its Windows GitHub runner temp folder**, runs the negative controls plus read-only package validator, and **has no NuGet publish/push, artifact upload, signing or release step**. Do not call the CI pass before its actual GitHub Actions verdict for the pushed commit.

The separate production-host published-SSR smoke also passed locally using `scripts/quality/probe_v3_ssr_publish.ps1`, with four HTTP 200 validations: `/v3/styling-lab`, `/_content/Bluent.UI/bluent.ui.components.min.css`, `/_content/Bluent.UI.Demo.Pages/v3/issue-418.opt-in.preview.css`, and `/_framework/blazor.web.js`. The smoke starts and stops its own temporary Production host and does not deploy.