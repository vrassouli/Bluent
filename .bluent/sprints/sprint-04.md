# Sprint 4 — Canonical Examples and AI Readiness

## Tracking

- **Base branch:** `Dev`
- **Completed examples branch:** `codex/issues-391-392`
- **Completed examples pull request:**
  [#395](https://github.com/vrassouli/Bluent/pull/395) — merged
- **Completed example issues:**
  [#391](https://github.com/vrassouli/Bluent/issues/391) and
  [#392](https://github.com/vrassouli/Bluent/issues/392)
- **Active reference-app branch:** `codex/issue-393`
- **Completed reference-app issue:** [#393](https://github.com/vrassouli/Bluent/issues/393)
- **Active reference-app pull request:**
  [#396](https://github.com/vrassouli/Bluent/pull/396) — merged
- **Active benchmark branch:** `codex/issue-394`
- **Active benchmark issue:**
  [#394](https://github.com/vrassouli/Bluent/issues/394)
- **Status:** Ready for review
- **Started:** 2026-07-26

## Objective

Publish at least ten reusable task-oriented examples, keep their runnable
source behind a durable compiler gate, and compose those patterns in a small
production-oriented reference application.

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

## Reference application workstream

### Scope

- [x] Add a standalone in-memory WebAssembly customer/order application.
- [x] Add responsive layout, navigation, dashboard, and list/detail/create/edit
  workflows.
- [x] Compose DataGrid, form validation, dialog confirmation, toast and
  MessageBar feedback, a filter drawer, chart, and meaningful diagram.
- [x] Add light/dark and LTR/RTL controls.
- [x] Make loading, empty, validation-error, archive, and success states
  reachable.
- [x] Separate application/domain code from Bluent component composition.
- [x] Add the project to the solution and link canonical docs plus `llms.txt`.

### Acceptance criteria

- The application builds from a clean checkout and its run commands are
  maintained.
- The complete customer workflow, validation, confirmation, feedback, overlay,
  chart, theme, and RTL routes are runtime verified.
- Desktop and mobile presentation are visually reviewed.
- A fresh-tab console has no Bluent-related warning or error in the tested
  route.
- The full zero-warning Release build, existing tests, documentation links,
  workflow YAML, and whitespace checks pass.
- Project tracking, Issue #393, and any pull request record exact evidence and
  remaining limitations.

### Current evidence

- `dotnet build samples/Bluent.OrderDesk/Bluent.OrderDesk.csproj
  --configuration Release --no-restore -warnaserror` passed with 0 warnings
  and 0 errors.
- Source review confirmed the application uses current public APIs and has no
  demo-project dependency.
- Browser runtime and visual checks passed for the documented desktop/mobile,
  customer/order, state, theme, direction, overlay, feedback, chart, diagram,
  and clean-console route.
- Tool and solution restore passed. The full Release solution build passed with
  0 warnings and 0 errors; application tests passed 19/19; the canonical
  task-example gate passed; release-tool tests passed 13/13; all 49 maintained
  Markdown files passed link validation; workflow YAML and `git diff --check`
  passed.
- External CI, deployment, package, and non-WebAssembly render-mode evidence
  are pending and are not claimed.

## AI-readiness benchmark workstream

### Scope

- [x] Preserve the 15 existing prompts and five-dimension scoring rubric.
- [x] Add a repeatable run structure under `benchmarks/ai-readiness`.
- [x] Record provider/model exposure, date, context and access modes, exact
  prompts, first responses, package/setup/API review, hallucinations,
  compilation, canonical links, score, and rationale.
- [x] Materialize ten representative generated samples in a standalone
  WebAssembly consumer.
- [x] Compare total, category, compilation, setup, API, hallucination, and
  recurring-failure results with the committed baseline.
- [x] Separate measured facts, interpretation, limitations, and untested
  assistants or modes.
- [x] Convert the actionable generated-code failure into
  [Issue #397](https://github.com/vrassouli/Bluent/issues/397).
- [x] Link the report from canonical documentation indexes and `llms.txt`.

### Current evidence

- One OpenAI Codex repository-context run was executed. The exact model
  identifier was not exposed and was not inferred.
- The rerun scored 139/150 (92.7%), compared with the committed baseline's
  99/150 (66.0%).
- Nine generated samples compiled unchanged. The first-pass drawer sample
  failed with `CS0104` because its application-owned `DrawerContent` name
  collided with `Bluent.UI.Components.DrawerContent`; all ten compiled with
  zero warnings after a documented fully qualified repair.
- No hallucinated Bluent API was recorded. Context-free, link-only,
  `llms.txt`-only, web-only, external-assistant, runtime, and visual modes were
  not tested or claimed.
- The repeatable record passed
  `benchmarks/ai-readiness/scripts/validate_run.py`.

### Remaining

- [x] Run and record the complete Issue #394 repository validation.
- [x] Commit the focused branch with a clean worktree.
- [x] Update Issue #394 with the final local evidence.

### Local validation evidence

Run on 2026-07-26 on macOS 26.5.2, Apple Silicon, with .NET SDK
`10.0.300`:

- Tool restore and full solution restore passed.
- The Release solution build passed with warnings treated as errors: 0
  warnings and 0 errors.
- Application tests passed 19/19.
- The canonical task-example gate passed, including the intentional `CS0234`
  negative control.
- Release-tool tests passed 13/13.
- Markdown links passed across 50 maintained files.
- All three workflow YAML files parsed successfully.
- `git diff --check origin/Dev` passed.
- The benchmark record validator passed all 15 rows.
- The repaired ten-sample Release build passed with 0 warnings and 0 errors.

Runtime, visual, deployment, package, tag, release, external CI, and
external-assistant validation were not run or claimed.
