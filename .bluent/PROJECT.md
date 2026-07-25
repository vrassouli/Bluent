# Bluent Project Status

This file is the single source of truth for the Bluent relaunch work.

It tracks completed work, active work, upcoming work, and the working agreement for future project sessions.

## Current Phase

**Phase:** Project Relaunch  
**Current Sprint:** Sprint 0 — Repository Professionalization  
**Status:** Complete — pull request pending  
**Working Branch:** `docs/project-relaunch`

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
- [ ] Open the project relaunch pull request into `Dev`.

### Review Summary

- The branch is based directly on `Dev` and was not behind it at final review.
- README setup instructions were verified against service registration, layout containers, and packaged stylesheet paths.
- NuGet metadata now uses the Apache-2.0 license expression, valid project/repository URLs, focused descriptions and tags, and a packaged README.
- Repository documents and templates link to canonical project policies.
- No product features were added.
- The existing GitHub Pages workflow still targets `master`, .NET 9, and Actions v3. Updating CI is deferred to a dedicated quality task because it is outside Sprint 0's documentation and repository-professionalization scope.
- A full solution build was not run through the GitHub connector; the pull request requires local or CI build/test validation before merge.

### Definition of Done

Sprint 0 is complete when:

- [x] The repository has a clear license and project identity.
- [x] README instructions have been verified against the implementation.
- [x] Contribution and community guidelines exist.
- [x] Release and versioning expectations are documented.
- [x] NuGet repository metadata is valid.
- [x] Issue and pull request templates are available.
- [ ] All changes are available in one reviewed pull request targeting `Dev`.

## Sprint 1 — Documentation Foundation

### Planned

- [ ] Define the documentation information architecture.
- [ ] Create a reliable getting-started guide.
- [ ] Document package selection and package boundaries.
- [ ] Create component documentation standards.
- [ ] Add runnable examples for the most important components.
- [ ] Document theming, localization, RTL, and JavaScript requirements.
- [ ] Add migration and upgrade guidance.
- [ ] Create a canonical component catalog for developers and coding agents.
- [ ] Publish a machine-readable documentation index such as `llms.txt`.
- [ ] Establish a baseline AI-readiness benchmark.

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
- Run the full build/test/package validation before merging the relaunch pull request.
- Start Sprint 1 only after the Sprint 0 pull request is reviewed and merged.

## Session Resume Procedure

When resuming work on Bluent:

1. Read this file.
2. Check the current branch and open pull requests.
3. Continue with the first unchecked task in the current sprint.
4. Update this file after completing or changing a task.
5. Do not start a later sprint while the current sprint's definition of done remains unmet.
