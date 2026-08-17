# Bluent Project Status

This file is the single source of truth for the Bluent relaunch work.

It tracks completed work, active work, upcoming work, and the working agreement for future project sessions.

## Current Phase

**Phase:** Reliable Examples and AI Readiness
**Current Sprint:** Sprint 4 DrawerContent naming-collision follow-up
**Status:** Ready for review
**Working Branch:** `codex/issue-397`
**Pull Request:** Not opened
**Tracking Issue:** [#397](https://github.com/vrassouli/Bluent/issues/397)

## Operational Files

- `.bluent/HANDOFF.md` — immediate continuation instructions for Codex and other coding agents.
- `.bluent/sprints/sprint-04.md` — active canonical examples and compilation plan.
- `.bluent/sprints/sprint-03.md` — completed Sprint 3 execution plan and acceptance criteria.
- `.bluent/QUALITY.md` — validation evidence and completion policy.
- `.bluent/BACKLOG.md` — current, next, later, and deferred project work.
- `docs/releasing/release-workflow-audit.md` — Sprint 3 release audit.
- `docs/releasing/stable-release-readiness.md` — current package evidence,
  approved version, risks, prerequisites, and validation status.
- `docs/quality/compiler-warning-baseline.md` — zero-warning baseline and triage record.
- `docs/compatibility/hosting-and-render-modes.md` — evidence-backed compatibility status.

## Package static-asset regression follow-up

- Release `1.0.368` prevents generated unminified stylesheets from being
  packed as consumer-owned `contentFiles` by `Bluent.UI` and
  `Bluent.UI.Diagrams`.
- The Release solution build, five-package build-without-rebuilding sequence,
  package-content validator, 19 application tests, and a two-Razor-library
  consumer reproduction pass locally on Windows with .NET SDK `10.0.300`.
- Consumers remaining on `1.0.367` can exclude the package's `contentFiles`
  assets as a workaround.

## Working Agreement

- Do not add new product features during the relaunch phase unless explicitly approved by the maintainer.
- Prioritize documentation, presentation, reliability, adoption, and AI readiness.
- Preserve API consistency across packages and components.
- Avoid breaking changes unless they are necessary, documented, and reviewed.
- Do not claim validation without recorded evidence defined in `.bluent/QUALITY.md`.
- Every completed project task must update this file and the relevant tracking issue.
- Use this file and `.bluent/HANDOFF.md` as the first references when resuming work.
- Complete existing sprint work before starting a new sprint.

## Product Positioning

**Product name:** Bluent
**Primary package:** `Bluent.UI`
**Positioning:** A Blazor-native toolkit for building modern business applications.
**Strategic objective:** Make Bluent AI-ready and AI-discoverable through accurate public knowledge and genuine adoption.
**License:** Apache License 2.0

## Sprint 0 — Repository Professionalization

### Completed

- [x] Review the repository, package structure, README, releases, issues, and pull requests.
- [x] Define the initial project positioning.
- [x] Create the `docs/project-relaunch` working branch.
- [x] Rewrite the repository README.
- [x] Select Apache License 2.0.
- [x] Add the repository-level `LICENSE` file.
- [x] Create the project status tracking file.
- [x] Verify all README installation instructions against the source code.
- [x] Add `VISION.md`.
- [x] Add `ROADMAP.md`.
- [x] Add `CONTRIBUTING.md`.
- [x] Add `CODE_OF_CONDUCT.md`.
- [x] Add `CHANGELOG.md`.
- [x] Document the versioning and release policy in `RELEASING.md`.
- [x] Fix and complete NuGet metadata for the five packable projects.
- [x] Add GitHub issue templates.
- [x] Add a pull request template.
- [x] Review all relaunch changes for consistency.
- [x] Open and merge the project relaunch pull request into `Dev` ([PR #364](https://github.com/vrassouli/Bluent/pull/364)).

### Completion Summary

- [PR #364](https://github.com/vrassouli/Bluent/pull/364) was merged into `Dev` on 2026-07-25.
- README setup instructions were verified against service registration, layout containers, and packaged stylesheet paths.
- NuGet metadata uses the Apache-2.0 license expression, valid project/repository URLs, focused descriptions and tags, and a packaged README.
- Repository documents and templates link to canonical project policies.
- No product features were added.

## Sprint 1 — Documentation Foundation

**Tracking:** [Issue #365](https://github.com/vrassouli/Bluent/issues/365)
**Branch:** `docs/sprint-1-foundation`
**Pull Request:** [PR #367](https://github.com/vrassouli/Bluent/pull/367) — merged

### Completed

- [x] Define the documentation information architecture.
- [x] Create a reliable getting-started guide.
- [x] Document package selection and package boundaries.
- [x] Document supported Blazor hosting models and render modes.
- [x] Create component documentation standards.
- [x] Add a compiled onboarding example for important components.
- [x] Document theming, localization, RTL, and JavaScript requirements.
- [x] Add migration and upgrade guidance.
- [x] Create a canonical component catalog for developers and coding agents.
- [x] Add repository instructions for coding agents.
- [x] Publish a machine-readable documentation index such as `llms.txt`.
- [x] Define 15 representative AI benchmark prompts.
- [x] Execute and publish the initial AI-readiness baseline.

### Completion Summary

- Canonical documentation architecture, Getting Started, package boundaries, hosting guidance, component standards, inventory, cross-cutting guidance, migration guidance, agent instructions, and `llms.txt` are published.
- A compiled onboarding example covers common inputs, actions, feedback, and dialog usage.
- The initial repository-context Codex baseline scored 99/150.
- GitHub Actions restored and built the full .NET 10 solution in Release configuration.
- All 17 existing tests passed.
- All five NuGet packages packed successfully and were uploaded as workflow artifacts.
- Local Markdown links passed validation.
- Build completed with 10 pre-existing compiler warnings and no errors.

## Sprint 2 — Demo and Visual Presentation

Detailed plan: `.bluent/sprints/sprint-02.md`

### Completed

- [x] Audit the current demo application, page structure, navigation, and component coverage.
- [x] Define the initial demo information architecture and visual direction.
- [x] Replace the default landing page with product positioning and calls to action.
- [x] Add an in-demo Getting Started destination.
- [x] Group navigation by purpose and support compact/expanded behavior.
- [x] Highlight themes, dark mode, RTL, Charts, and Diagrams.
- [x] Run initial restore, Release build, tests, package creation, and Markdown-link validation in GitHub Actions.
- [x] Add Codex handoff, backlog, quality policy, sprint plan, and scoped demo-agent instructions.
- [x] Add three runnable enterprise scenarios: customer profile, operations dashboard, and confirmation flow.
- [x] Apply a repeatable showcase header to Buttons, Fields, Data Grid, Data Pager, Dialogs, Toasts, Message Bars, Charts, and Diagrams.
- [x] Validate desktop/mobile navigation, responsive layout, light/dark themes, LTR/RTL direction, interactions, and browser console state.
- [x] Capture and document four current screenshots from the validated application.
- [x] Modernize the GitHub Pages workflow and validate a local Release publish.

### Completion Checklist

- [x] Add at least three runnable enterprise scenario pages.
- [x] Apply a repeatable component showcase structure to high-value pages.
- [x] Validate desktop and mobile navigation in a running browser.
- [x] Validate light/dark and LTR/RTL combinations.
- [x] Capture professional screenshots from the validated application.
- [x] Run clean GitHub Actions validation and validate the deployed Pages site at commit `f1c2748`.
- [x] Record final validation evidence and remaining risks.
- [x] Open the Sprint 2 completion pull request to `Dev` for review.
- [x] Merge the reviewed Sprint 2 pull request into `Dev`.

### Validation Summary

- Local browser validation covered 1440 × 1000 desktop and 390 × 844 mobile layouts, light/dark themes, LTR/RTL, a non-default brand color, all three enterprise scenarios, and the selected component showcases.
- Clean GitHub Actions validation passed on commit `f1c2748`: restore, Release build, 17/17 tests, five package builds, and Markdown links.
- GitHub Pages deployment passed on commit `f1c2748`; the live root, client-side routes, framework files, Bluent styles, and demo JavaScript were checked.
- The final live browser check confirmed the `/Bluent/` home links, operations chart, deployed root navigation, zero horizontal overflow, and a clean console.
- Ten pre-existing compiler warnings remained at Sprint 2 close; Sprint 3 later resolved all ten without suppression.

## Sprint 3 — Release Reliability and Compatibility

**Tracking:** [Issue #372](https://github.com/vrassouli/Bluent/issues/372) — completed
**Branch:** `release/sprint-3-reliability`
**Pull Request:** [PR #377](https://github.com/vrassouli/Bluent/pull/377) — merged
**Detailed plan:** `.bluent/sprints/sprint-03.md`

### Completed

- [x] Reconcile Sprint 2 and PRs #370 and #371 with the merged `Dev` state.
- [x] Audit release mechanics, version sources, packages, dependencies, tags, releases, environments, and publication risks.
- [x] Replace the legacy publication path with explicit, validated, artifact-first release automation.
- [x] Add an artifact-only dry-run path that cannot publish NuGet packages or create a GitHub Release from a PR.
- [x] Generate release notes deterministically from the versioned `CHANGELOG.md` section.
- [x] Fix all 10 pre-existing compiler warnings without suppression and enforce a zero-warning Release build.
- [x] Validate static SSR, Interactive Server, Interactive WebAssembly, Interactive Auto, and standalone WebAssembly representative scenarios.
- [x] Add durable Quality CI for build, tests, packages, metadata, links, workflow YAML, whitespace, and focused rendered accessibility.
- [x] Create contributor-ready Issues #374, #375, and #376 with `good first issue` labels.
- [x] Merge PR #377 into `Dev` and close Issue #372.

### Validation Summary

- The final PR head passed the Quality and Release packages workflows.
- Release build passed with zero warnings and zero errors.
- Application tests passed 19/19; release-tool tests passed 4/4.
- Exactly five aligned NuGet packages were packed and validated, including metadata, dependencies, and expected static assets.
- Release notes were generated deterministically from `CHANGELOG.md`.
- Browser runtime checks covered representative binding, callbacks, dialogs, toasts, charts, diagrams, navigation, disposal, and clean console behavior across the tested render modes.
- No real tag, GitHub Release, or NuGet publication was created.

### Remaining Operational Prerequisites

Before a real NuGet release:

1. Create and protect the `nuget-production` GitHub environment.
2. Add the `NUGET_API_KEY` environment secret.
3. Choose and document the exact release version.
4. Prepare the matching `v<version>` tag.
5. Explicitly authorize the production release run.

Known deferred compatibility work remains tracked in Issue #366, including transient Interactive Server reconnection and exact Interactive Auto renderer-transition instrumentation.

## Post-Sprint 3 Small Backlog Cleanup

**Issues:** [#374](https://github.com/vrassouli/Bluent/issues/374),
[#375](https://github.com/vrassouli/Bluent/issues/375), and
[#376](https://github.com/vrassouli/Bluent/issues/376)

**Branch:** `chore/close-small-open-issues`

### Completed on branch

- [x] Add source-verified canonical Badge and Checkbox references without
  changing either component or its public API.
- [x] Update the component index, coverage inventory, and `llms.txt` for both
  references.
- [x] Add temporary standard-library `.nupkg` fixtures covering a valid package
  set and five focused package-validator failures.

### Validation Summary

- Release-tool tests passed 13/13, including all six synthetic package
  scenarios.
- Markdown links passed across 36 maintained files.
- Solution restore passed.
- Release build passed with warnings treated as errors: 0 warnings, 0 errors.
- Application tests passed 19/19.
- The diff against `origin/Dev` passed `git diff --check`.
- No package, tag, GitHub Release, or product API was created or published.

## Post-Sprint 3 Render-Mode Follow-ups

**Issues:** [#387](https://github.com/vrassouli/Bluent/issues/387) and
[#388](https://github.com/vrassouli/Bluent/issues/388)

**Branch:** `test/render-mode-followups`

**Pull Request:** [#389](https://github.com/vrassouli/Bluent/pull/389) — merged

### Completed on branch

- [x] Reproduce a transient Interactive Server transport interruption without
  terminating the ASP.NET host.
- [x] Verify automatic circuit reconnection, preserved binding/callback state,
  post-reconnect dialog/toast services, and post-reconnect JavaScript-backed
  popover behavior.
- [x] Verify representative Drawer close/navigation/disposal, Popover
  placement/dismissal, Tooltip focus/cleanup, and DOM-measurement scenarios in
  Interactive Server, Interactive WebAssembly, and Interactive Auto.
- [x] Record the Interactive Auto renderer observed by the interactive
  component instance without claiming transition timing.
- [x] Reconfirm meaningful static SSR display-only output and document
  interactive behavior there as unsupported.
- [x] Update the canonical hosting/render-mode evidence with exact environment,
  steps, actual results, console/server findings, and limitations.

### Runtime evidence

- Runtime probe commit:
  `848a083e4341b26fbf4d394ffea123157b03aa6c`.
- The Interactive Server circuit automatically rejoined after the forwarding
  layer was unavailable for approximately 10 seconds; state was preserved and
  overlays plus JavaScript-backed placement worked after recovery.
- Drawer, Popover, Tooltip, focus movement, navigation, and disposal checks
  passed in all three interactive modes. Interactive Auto reported WebAssembly
  for the tested instance.
- Fresh matrix tabs had no browser-console warning or error. The reconnection
  tab recorded only the expected transport and retry failures during the
  simulated outage. The server remained alive and logged no circuit or
  component exception.
- Markdown links passed across 36 maintained files.
- Solution restore passed; the Release build passed with warnings treated as
  errors: 0 warnings, 0 errors; and application tests passed 19/19.
- The diff against `origin/Dev` passed `git diff --check`.
- The non-draft [PR #389](https://github.com/vrassouli/Bluent/pull/389)
  was merged into `Dev` on 2026-07-26.

## Stable Release 1.0.367

**Tracking:** [Issue #381](https://github.com/vrassouli/Bluent/issues/381)

**Branch:** `release/1.0.367`

**Preparation:** [Issue #379](https://github.com/vrassouli/Bluent/issues/379)
and [PR #380](https://github.com/vrassouli/Bluent/pull/380) — completed

**Status:** Ready for review

The maintainer approved stable version `1.0.367` dated 2026-07-26 and confirmed
that the protected `nuget-production` environment and its `NUGET_API_KEY`
secret are configured. The secret value is not inspected. Final validation is
underway without publishing packages or creating a release tag or GitHub
Release.

### Current findings

- PR #380 is merged, and the final release branch starts from `Dev` merge
  commit `f1cb349`.
- The five-package publication set remains `Bluent.UI.Core`, `Bluent.UI`,
  `Bluent.UI.Charts`, `Bluent.UI.Diagrams`, and `Bluent.UI.Utilities`.
- `Bluent.Core` references in Issue #381 are package-ID typos. No package
  rename, dependency-boundary change, or migration is included in `1.0.367`.
- Legacy `master`-push workflow run #366 published aligned stable `1.0.366`
  packages on 2026-07-25 before the protected workflow merged.
- Stable `1.0.367` is the approved successor. A patch is SemVer-correct because
  no incompatible public API, behavior, package-boundary, target-framework, or
  static-asset change was identified.
- No version-specific consumer migration is required.
- The changelog contains a dated `1.0.367` section and a fresh empty,
  category-complete `Unreleased` section.
- The packaged README now uses a NuGet.org-trusted, commit-pinned screenshot
  URL, and release validation rejects relative or untrusted image sources in
  each of the five packages.
- PR #380 commit `927dd20` passed Quality run #30189474232 and Release packages
  dry-run #30189474228. Downloaded artifact `bluent-0.0.0-ci.378` contained
  exactly five aligned packages, the validation report, and deterministic
  dry-run notes. Every packaged README recorded only the five expected trusted
  image sources; publication and GitHub Release jobs were skipped.

### Remaining work

- [x] Complete and record local build, test, exact pack, notes, documentation,
  workflow-YAML, and whitespace validation.
- [x] Validate a clean consumer against the five exact `1.0.367` packages.
- [x] Confirm all five `1.0.367` package ID/version pairs are absent on NuGet.
- [ ] Record clean Quality and exact `publish: false` Release packages runs.
- [ ] Inspect the uploaded `bluent-1.0.367` artifact.
- [ ] Open the final non-draft release pull request targeting `Dev`.

No publication, tag, or GitHub Release action is part of the active Sprint 4
examples workstream.

## Sprint 4 — Canonical Examples and Compilation

**Tracking:** [Issue #391](https://github.com/vrassouli/Bluent/issues/391) and
[Issue #392](https://github.com/vrassouli/Bluent/issues/392)

**Branch:** `codex/issues-391-392`

**Pull Request:** [#395](https://github.com/vrassouli/Bluent/pull/395) — merged

**Detailed plan:** `.bluent/sprints/sprint-04.md`

**Status:** Completed

### Implemented

- [x] Add ten task-oriented examples covering forms, validation, confirmation,
  feedback, DataGrid paging, navigation/layout, drawers/popovers, Charts,
  Diagrams, themes, dark mode, and RTL.
- [x] Back every example with complete source in a standalone WebAssembly
  consumer that does not reference demo projects.
- [x] Add the consumer to the solution with current UI, Charts, and Diagrams
  project references.
- [x] Add canonical task pages that link to compiled source and explicitly
  document package, namespace, setup, assets, behavior, mistakes, render modes,
  and evidence.
- [x] Add a focused build script and opt-in invalid-source negative control.
- [x] Integrate the focused validation into Quality CI.
- [x] Update maintained documentation indexes, `llms.txt`, contributor
  guidance, and the changelog.

### Remaining

- [x] Complete and record the repository-required local validation.
- [x] Update Issues #391 and #392 with exact local evidence and pending external
  validation.
- [x] Open draft PR #395 targeting `Dev`.

Issue #394 remains separate and is not included in this workstream.

### Local validation summary

- Focused task validation passed: the standalone consumer built with 0
  warnings and 0 errors, while the opt-in invalid source failed with `CS0234`
  and a diagnostic naming `InvalidTaskExample.cs.invalid`.
- Markdown links passed across 48 maintained files.
- Tool restore and solution restore passed.
- The Release solution build passed with warnings treated as errors: 0
  warnings and 0 errors.
- Application tests passed 19/19; release-tool tests passed 13/13.
- All three workflow YAML files parsed and `git diff --check` passed.
- Runtime, visual, deployment, package, and external CI validation were not
  run or claimed.

## Sprint 4 — Production-pattern Reference Application

**Tracking:** [Issue #393](https://github.com/vrassouli/Bluent/issues/393)

**Branch:** `codex/issue-393`

**Pull Request:** [#396](https://github.com/vrassouli/Bluent/pull/396) — merged

**Detailed plan:** `.bluent/sprints/sprint-04.md`

**Status:** Completed

### Implemented

- [x] Add the standalone `samples/Bluent.OrderDesk` Blazor WebAssembly
  application without demo-project references or external infrastructure.
- [x] Add a responsive layout and dashboard, customer list/detail/create/edit
  workflow, and representative order DataGrid.
- [x] Add data-annotation validation, archive confirmation, MessageBar and
  toast feedback, a filter drawer, fulfilled-revenue chart, and meaningful
  order-lifecycle diagram.
- [x] Add light/dark and LTR/RTL controls plus deliberate loading, empty,
  validation-error, archive, and save-success states.
- [x] Separate the in-memory customer/order repository and domain models from
  Bluent page composition.
- [x] Add the project to `Bluent.sln` and publish its canonical architecture,
  runbook, limitations, verification route, and documentation links.

### Current evidence

- The focused Release build passed with warnings treated as errors: 0 warnings
  and 0 errors.
- Source verification confirmed current public Bluent APIs, canonical
  registration/assets, and no demo-project dependency.
- Runtime verification passed for the customer create/edit/archive flow,
  validation, feedback, dialog, drawer filtering, DataGrid loading and empty
  states, chart, diagram, light/dark themes, and LTR/RTL direction.
- Desktop and mobile visual review passed with no rendered horizontal overflow.
- A final fresh tab kept the Blazor error UI hidden and recorded no browser
  console warning or error.
- Tool restore and full solution restore passed. An earlier focused restore was
  canceled after 112 seconds while its NuGet connection remained pending; the
  later full restore completed successfully.
- The zero-warning full Release build, 19/19 application tests, canonical
  example gate, 13/13 release-tool tests, 49-file Markdown link check, workflow
  YAML parsing, and `git diff --check` passed.
- Issue #393 records the implemented scope, exact local evidence, disclosed
  validation substitutions/failures, and pending external CI.

### Completion

- [x] Exercise the representative browser route at desktop and mobile sizes.
- [x] Verify light/dark and LTR/RTL presentation.
- [x] Verify dialog, toast, drawer, DataGrid, chart, validation, and state
  transitions at runtime.
- [x] Check a fresh-tab browser console for Bluent-related warnings or errors.
- [x] Run the complete repository validation and record exact results.
- [x] Open draft pull request #396 targeting `Dev`.
- [x] Merge PR #396 and close Issue #393.

External CI evidence was not added to the local project record before merge;
the recorded source, build, test, runtime, visual, and console evidence remains
explicitly scoped.

## Sprint 4 — AI-readiness Benchmark Rerun

**Tracking:** [Issue #394](https://github.com/vrassouli/Bluent/issues/394)

**Branch:** `codex/issue-394`

**Status:** Ready for review

### Implemented

- [x] Add a repeatable benchmark workspace, run template, and structural
  validator under `benchmarks/ai-readiness`.
- [x] Preserve all 15 existing prompts and the existing five-dimension rubric.
- [x] Execute one OpenAI Codex repository-context run without inferring an
  unexposed exact model identifier.
- [x] Preserve prompt responses, structured per-prompt scoring, and ten
  representative generated WebAssembly samples.
- [x] Compile nine samples unchanged and all ten after a documented repair to
  the only first-pass failure.
- [x] Publish the numerical baseline comparison and explicitly separate facts,
  interpretation, limitations, and untested assistants/modes.
- [x] Open focused follow-up
  [Issue #397](https://github.com/vrassouli/Bluent/issues/397) for the
  application `DrawerContent` naming collision.
- [x] Link the report from canonical documentation indexes and `llms.txt`.

### Current evidence

- The rerun scored 139/150 (92.7%), up 40 points from the committed 99/150
  (66.0%) repository-context baseline.
- Category changes were Discovery +4, Setup +3, API +12, Build +19, and
  Explanation +2. The baseline's printed API subtotal is arithmetically
  inconsistent; the comparison uses its row-derived 18/30 so category totals
  reconcile to 99/150.
- Unchanged generated-sample compilation was 9/10 (90%); cumulative compilation
  after one documented repair was 10/10 (100%).
- Hallucinated API frequency remained 0/15. The only code failure was a
  non-hallucinated application/public-type name collision.
- Context-free, repository-link-only, `llms.txt`-only, web-only,
  external-assistant, runtime, visual, deployment, and non-WebAssembly modes
  were not run or claimed.

### Remaining

- [x] Complete the full Issue #394 validation matrix.
- [x] Commit the focused changes and update Issue #394 with final evidence.

### Local validation summary

- Tool and solution restore passed.
- The full Release build passed with warnings treated as errors: 0 warnings
  and 0 errors.
- Application tests passed 19/19; canonical task-example validation passed;
  release-tool tests passed 13/13.
- Markdown links passed across 50 files; all three workflow YAML files parsed;
  and `git diff --check origin/Dev` passed.
- The benchmark record validator passed all 15 prompts, and the repaired
  ten-sample consumer built with 0 warnings and 0 errors.
- No runtime, visual, deployment, package, tag, release, external CI, or
  external-assistant validation is claimed.

## Sprint 4 — DrawerContent Naming-Collision Follow-up

**Tracking:** [Issue #397](https://github.com/vrassouli/Bluent/issues/397)

**Branch:** `codex/issue-397`

**Status:** In progress

### Implemented

- [x] Explain the collision between an application-owned `DrawerContent` and
  `Bluent.UI.Components.DrawerContent` in the canonical Drawer/Popover task
  guidance.
- [x] Recommend a distinctive application name such as `OrderFilterDrawer`
  and show fully qualified application type usage as the fallback for an
  existing collision.
- [x] Compile the positive `OrderFilterDrawer` pattern in the standalone task
  consumer.
- [x] Replace the generic invalid-reference check with a focused collision
  source that must fail with `CS0104`.
- [x] Keep existing public APIs and package boundaries unchanged.

### Remaining

- [x] Run and record the complete Issue #397 validation matrix.
- [x] Commit the focused changes with a clean worktree.

### Local validation summary

Run on 2026-07-26 on macOS 26.5.2, Apple Silicon, with .NET SDK
`10.0.300`:

- `dotnet tool restore` — passed.
- `dotnet restore Bluent.sln` — passed; all projects were up to date.
- `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror`
  — passed with 0 warnings and 0 errors.
- `dotnet test Bluent.sln --configuration Release --no-build` — passed 19/19.
- `bash scripts/quality/check_task_examples.sh` — passed. The positive
  consumer built with 0 warnings and 0 errors; the focused negative source
  failed as required with `CS0104` naming
  `DrawerContentCollision.cs.invalid` and both competing types.
- `python3 scripts/quality/check_markdown_links.py` — passed across 50
  Markdown files.
- `git diff --check origin/Dev` — passed.

No runtime, visual, deployment, package, tag, release, or external CI
validation was run or claimed. No package content changed, so packing was not
applicable.

## Accepted Decisions

### 2026-07-25 — Pause new features

**Decision:** No new components or product features during the relaunch work unless explicitly approved by the maintainer.
**Reason:** The current priority is adoption, documentation, presentation, project trust, and AI readiness.
**Status:** Accepted

### 2026-07-25 — Apache License 2.0

**Decision:** License Bluent under Apache License 2.0.
**Reason:** It is commercially friendly and includes an explicit patent grant suitable for enterprise adoption.
**Status:** Accepted

### 2026-07-25 — Brand and package naming

**Decision:** Use `Bluent` as the product and ecosystem name; use package names such as `Bluent.UI`, `Bluent.UI.Charts`, and `Bluent.UI.Diagrams` only when referring to NuGet packages or implementation projects.
**Reason:** This creates a consistent product identity without changing existing package names.
**Status:** Accepted

### 2026-07-25 — Repository-based project tracking

**Decision:** Track relaunch progress in `.bluent/PROJECT.md`, maintain immediate work in `.bluent/HANDOFF.md`, and keep detailed sprint execution under `.bluent/sprints/`.
**Reason:** Version-controlled project state enables reliable continuation by maintainers and coding agents without reconstructing context from chat history.
**Status:** Accepted

### 2026-07-25 — AI readiness and discoverability

**Decision:** Make Bluent understandable and usable by AI coding assistants, and improve its likelihood of being surfaced when it genuinely matches a developer's needs.
**Reason:** AI assistants increasingly influence library discovery and code generation. Bluent needs accurate, structured, public technical knowledge and verifiable examples.
**Guardrail:** Do not game model recommendations or manufacture popularity signals; earn discoverability through documentation, metadata, reliable releases, validation, and authentic adoption.
**Tracking:** [Issue #363](https://github.com/vrassouli/Bluent/issues/363)
**Status:** Accepted

## Session Resume Procedure

When resuming work on Bluent:

1. Read root `AGENTS.md`.
2. Read `.bluent/HANDOFF.md`, this file, and the most recent completed sprint plan.
3. Check open pull requests and issues before assuming project status.
4. Do not start a new sprint until the maintainer approves its scope.
5. Apply `.bluent/QUALITY.md` before claiming completion.
6. Update this file, the handoff, the tracking issue, and the pull request as work progresses.
7. Keep deferred compatibility work and AI-readiness work explicitly separated from release planning.
