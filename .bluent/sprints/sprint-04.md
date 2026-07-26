# Sprint 4 — Canonical Examples and AI Readiness

## Tracking

- **Base branch:** `Dev`
- **Working branch:** `codex/issues-391-392`
- **Pull request:** [#395](https://github.com/vrassouli/Bluent/pull/395) — draft
- **Issues in this workstream:**
  [#391](https://github.com/vrassouli/Bluent/issues/391) and
  [#392](https://github.com/vrassouli/Bluent/issues/392)
- **Status:** In progress
- **Started:** 2026-07-26

Issues #393 and #394 are related Sprint 4 work but are not silently included
in this workstream.

## Objective

Publish at least ten reusable task-oriented examples and make their runnable
source a durable compiler-validated quality gate.

## Scope

1. Add complete examples for inputs, validation, confirmation, feedback,
   data-grid operations, navigation/layout, drawers/popovers, charts, diagrams,
   themes, dark mode, and RTL.
2. Keep each example in a standalone consumer rather than relying on demo-only
   imports, registration, services, or assets.
3. Link documentation directly to the compiled source rather than maintaining
   divergent Markdown copies.
4. Build the consumer in normal Quality CI.
5. Demonstrate that an intentionally invalid API reference fails with a
   diagnostic identifying the affected source.
6. Document the contributor workflow and update maintained indexes.

## Non-goals

- New Bluent product components or public APIs.
- Redesigning the demo.
- Completing the reference application in Issue #393.
- Re-running the AI benchmark in Issue #394.
- Publishing packages, tags, or releases.
- Claiming runtime or visual evidence from compilation alone.

## Workstreams

### Canonical task sources

- [x] Add a clean standalone Blazor WebAssembly consumer.
- [x] Add current project references for `Bluent.UI`,
  `Bluent.UI.Charts`, and `Bluent.UI.Diagrams`.
- [x] Include explicit imports, `AddBluentUI()`, shared containers, and static
  assets.
- [x] Add ten focused task sources with complete Razor/C#.

### Documentation

- [x] Add a predictable task index under `docs/examples/tasks`.
- [x] Document packages, namespaces, registration, assets, expected behavior,
  common mistakes, render-mode notes, and evidence for every task.
- [x] Link each page to its canonical compiled source.
- [x] Update the documentation index, examples index, contributor guide, and
  `llms.txt`.

### Validation

- [x] Add the task consumer to `Bluent.sln`.
- [x] Add a focused validation script that builds with warnings as errors.
- [x] Add an opt-in invalid source as a negative control.
- [x] Integrate task validation into the Quality workflow.
- [x] Run tool restore and solution restore.
- [x] Run the focused task-example validation.
- [x] Run Markdown link validation.
- [x] Run the Release solution build with zero warnings.
- [x] Run all tests without rebuilding.
- [x] Parse workflow YAML and run `git diff --check`.

## Acceptance criteria

- All Issue #391 and #392 acceptance criteria are satisfied independently.
- Every runnable task page links to complete source compiled in normal CI.
- The consumer does not reference demo projects.
- Validation output names the deliberately invalid source.
- Documentation distinguishes source/build evidence from runtime evidence.
- Project tracking and the two issues accurately report completed and skipped
  validation.

## Local validation evidence

Run on 2026-07-26 on macOS 26.5.2, Apple Silicon, with .NET SDK
`10.0.300`:

- `dotnet tool restore` — passed.
- `dotnet restore Bluent.sln` — passed; all projects were up to date.
- `bash scripts/quality/check_task_examples.sh` — passed. The valid consumer
  built with 0 warnings and 0 errors. The negative control failed as required
  with `CS0234` and named
  `Validation/InvalidTaskExample.cs.invalid`.
- `python3 scripts/quality/check_markdown_links.py` — passed across 48
  Markdown files.
- `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror`
  — passed with 0 warnings and 0 errors.
- `dotnet test Bluent.sln --configuration Release --no-build` — passed 19/19.
- `python3 -m unittest -v scripts/release/test_release_tools.py` — passed
  13/13.
- All three workflow YAML files parsed successfully.
- `git diff --check` — passed.

No browser interaction, visual review, deployment, package creation, tag,
release, or external CI run is claimed by this local evidence. Quality and
release-package workflow results remain pending until GitHub Actions completes
for PR #395.
