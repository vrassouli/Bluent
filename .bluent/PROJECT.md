# Bluent Project Status

This file is the single source of truth for the Bluent relaunch work.

It tracks completed work, active work, upcoming work, and the working agreement for future project sessions.

## Current Phase

**Phase:** Project Relaunch  
**Current Sprint:** Sprint 3 — Release Reliability and Compatibility  
**Status:** Completed  
**Working Branch:** `Dev`  
**Pull Request:** [#377](https://github.com/vrassouli/Bluent/pull/377) — merged  
**Tracking Issue:** [#372](https://github.com/vrassouli/Bluent/issues/372) — completed

## Operational Files

- `.bluent/HANDOFF.md` — immediate continuation instructions for Codex and other coding agents.
- `.bluent/sprints/sprint-03.md` — completed Sprint 3 execution plan and acceptance criteria.
- `.bluent/QUALITY.md` — validation evidence and completion policy.
- `.bluent/BACKLOG.md` — current, next, later, and deferred project work.
- `docs/releasing/release-workflow-audit.md` — Sprint 3 release audit.
- `docs/quality/compiler-warning-baseline.md` — zero-warning baseline and triage record.
- `docs/compatibility/hosting-and-render-modes.md` — evidence-backed compatibility status.

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

## Next Phase — Release Planning

No new sprint is active.

The next maintainer decision is to select the first release through the new process:

- choose the exact version and whether it is preview or stable;
- confirm the five-package publication set;
- configure the protected production environment and secret;
- review the versioned changelog section and migration impact;
- perform an authorized release dry run or production publication.

Community outreach, new product features, and Sprint 4 remain unstarted until this release decision is made.

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
