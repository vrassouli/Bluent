# Bluent Project Status

This file is the single source of truth for the Bluent relaunch work.

It tracks completed work, active work, upcoming work, and the working agreement for future project sessions.

## Current Phase

**Phase:** Project Relaunch  
**Current Sprint:** Sprint 1 — Documentation Foundation  
**Status:** Complete — validated in [PR #367](https://github.com/vrassouli/Bluent/pull/367)  
**Working Branch:** `docs/sprint-1-foundation`

## Working Agreement

- Do not add new product features during the relaunch phase unless explicitly approved by the maintainer.
- Prioritize documentation, presentation, reliability, adoption, and AI readiness.
- Preserve API consistency across packages and components.
- Avoid breaking changes unless they are necessary, documented, and reviewed.
- Every completed project task must update this file.
- Use this file as the first reference when resuming work.
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
- [x] Open the project relaunch pull request into `Dev` ([PR #364](https://github.com/vrassouli/Bluent/pull/364)).

### Completion Summary

- [PR #364](https://github.com/vrassouli/Bluent/pull/364) was merged into `Dev` on 2026-07-25.
- The branch was based directly on `Dev` and was not behind it at final review.
- README setup instructions were verified against service registration, layout containers, and packaged stylesheet paths.
- NuGet metadata now uses the Apache-2.0 license expression, valid project/repository URLs, focused descriptions and tags, and a packaged README.
- Repository documents and templates link to canonical project policies.
- No product features were added.
- The existing GitHub Pages workflow still targets `master`, .NET 9, and Actions v3. Updating CI is deferred to a dedicated quality task because it is outside Sprint 0's documentation and repository-professionalization scope.
- A full solution build/test/package validation was not recorded before merge; this remains a quality follow-up and must be completed before the next package release.

### Definition of Done

Sprint 0 is complete when:

- [x] The repository has a clear license and project identity.
- [x] README instructions have been verified against the implementation.
- [x] Contribution and community guidelines exist.
- [x] Release and versioning expectations are documented.
- [x] NuGet repository metadata is valid.
- [x] Issue and pull request templates are available.
- [x] All changes are available in one pull request targeting `Dev` ([PR #364](https://github.com/vrassouli/Bluent/pull/364)).

## Sprint 1 — Documentation Foundation

**Tracking:** [Issue #365](https://github.com/vrassouli/Bluent/issues/365)  
**Branch:** `docs/sprint-1-foundation`

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

### Sprint 1 Completion Summary

- Canonical documentation architecture, Getting Started, package boundaries, hosting guidance, component standards, inventory, cross-cutting guidance, migration guidance, agent instructions, and `llms.txt` are published.
- A compiled onboarding example covers common inputs, actions, feedback, and dialog usage.
- The initial repository-context Codex baseline scored 99/150; generated consumer samples received no Build points because they were not compiled independently.
- GitHub Actions restored and built the full .NET 10 solution in Release configuration.
- All 17 existing tests passed.
- All five NuGet packages packed successfully and were uploaded as workflow artifacts.
- Local Markdown links passed validation.
- Build completed with 10 pre-existing compiler warnings and no errors.
- Multi-model/context-free benchmarking and additional render-mode validation remain follow-up work, not hidden completion claims.

### Definition of Done

- [x] Installation and setup have one canonical, source-verified guide.
- [x] Package boundaries and hosting/render-mode evidence are explicit.
- [x] Component documentation has a repeatable template and coverage inventory.
- [x] Coding agents have repository instructions and a maintained documentation index.
- [x] A dated AI-readiness baseline records accuracy, gaps, and build limitations.
- [x] The solution builds, tests pass, packages pack, and local documentation links resolve.

## Sprint 2 — Demo and Visual Presentation

### Planned

- [ ] Redesign the demo landing page.
- [ ] Build a structured component showcase.
- [ ] Capture professional screenshots.
- [ ] Produce short usage GIFs or videos.
- [ ] Improve mobile and desktop demo navigation.
- [ ] Make the project's strongest differentiators immediately visible.

## Sprint 3 — Release and Community Readiness

### Planned

- [ ] Define a predictable release workflow.
- [ ] Improve release notes.
- [ ] Create contributor-friendly issues.
- [ ] Identify and label good first issues.
- [ ] Review automated builds and tests.
- [ ] Add accessibility and quality checks where practical.

## Backlog

These items are intentionally deferred until the relaunch foundation is complete.

- Update and validate the GitHub Pages workflow.
- Documentation website or GitHub Pages redesign.
- Brand guide and visual identity refinement.
- Public component coverage matrix.
- Automated API documentation.
- Community outreach and launch announcement.
- Showcase of applications built with Bluent.
- Package naming and boundary review.
- Release cadence review.
- Evaluate a Bluent MCP or generated AI context bundle only after canonical static documentation exists.

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

**Decision:** Track relaunch progress in `.bluent/PROJECT.md`.  
**Reason:** The file is version-controlled, readable by contributors, and can be used to resume future work without reconstructing project state from chat history.  
**Status:** Accepted

### 2026-07-25 — AI readiness and discoverability

**Decision:** Make Bluent understandable and usable by AI coding assistants, and improve its likelihood of being surfaced when it genuinely matches a developer's needs.  
**Reason:** AI assistants increasingly influence library discovery and code generation. Bluent needs accurate, structured, public technical knowledge and verifiable examples.  
**Guardrail:** Do not game model recommendations or manufacture popularity signals; earn discoverability through documentation, metadata, reliable releases, validation, and authentic adoption.  
**Tracking:** [Issue #363](https://github.com/vrassouli/Bluent/issues/363)  
**Status:** Accepted

## Known Follow-up Work

- Modernize and validate `.github/workflows/static.yml`.
- Resolve or triage the 10 existing compiler warnings before the next stable release.
- Expand the AI benchmark to context-free and multiple-model runs.
- Validate additional Blazor Web App render modes through [Issue #366](https://github.com/vrassouli/Bluent/issues/366).

## Session Resume Procedure

When resuming work on Bluent:

1. Read this file.
2. Check the current branch and open pull requests.
3. Continue with the first unchecked task in the current sprint.
4. Update this file after completing or changing a task.
5. Do not start a later sprint while the current sprint's definition of done remains unmet.
