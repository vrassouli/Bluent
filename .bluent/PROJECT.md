# Bluent Project Status

This file is the single source of truth for the Bluent relaunch work.

It tracks completed work, active work, upcoming work, and the working agreement for future project sessions.

## Current Phase

**Phase:** Project Relaunch  
**Current Sprint:** Sprint 0 — Repository Professionalization  
**Status:** In Progress  
**Working Branch:** `docs/project-relaunch`

## Working Agreement

- Do not add new product features during the relaunch phase.
- Prioritize documentation, presentation, reliability, and adoption.
- Preserve API consistency across packages and components.
- Avoid breaking changes unless they are necessary, documented, and reviewed.
- Every completed project task must update this file.
- Use this file as the first reference when resuming work.
- Complete existing sprint work before starting a new sprint.

## Product Positioning

**Product name:** Bluent  
**Primary package:** `Bluent.UI`  
**Positioning:** A Blazor-native toolkit for building modern business applications.  
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

### In Progress

- [ ] Verify all README installation instructions against the source code.
- [ ] Add `VISION.md`.
- [ ] Add `ROADMAP.md`.
- [ ] Add `CONTRIBUTING.md`.
- [ ] Add `CODE_OF_CONDUCT.md`.
- [ ] Add `CHANGELOG.md`.
- [ ] Document the versioning and release policy.
- [ ] Fix NuGet package metadata, including the invalid `RepositoryUrl`.
- [ ] Add GitHub issue templates.
- [ ] Add a pull request template.
- [ ] Review all relaunch changes for consistency.
- [ ] Open the project relaunch pull request into `Dev`.

### Definition of Done

Sprint 0 is complete when:

- The repository has a clear license and project identity.
- README instructions have been verified against the implementation.
- Contribution and community guidelines exist.
- Release and versioning expectations are documented.
- NuGet repository metadata is valid.
- Issue and pull request templates are available.
- All changes are reviewed in one clean pull request targeting `Dev`.

## Sprint 1 — Documentation Foundation

### Planned

- [ ] Define the documentation information architecture.
- [ ] Create a reliable getting-started guide.
- [ ] Document package selection and package boundaries.
- [ ] Create component documentation standards.
- [ ] Add runnable examples for the most important components.
- [ ] Document theming, localization, RTL, and JavaScript requirements.
- [ ] Add migration and upgrade guidance.

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

- Documentation website or GitHub Pages redesign.
- Brand guide and visual identity refinement.
- Public component coverage matrix.
- Automated API documentation.
- Community outreach and launch announcement.
- Showcase of applications built with Bluent.
- Package naming and boundary review.
- Release cadence review.

## Accepted Decisions

### 2026-07-25 — Pause new features

**Decision:** No new components or product features during the relaunch work.  
**Reason:** The current priority is adoption, documentation, presentation, and project trust.  
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

## Known Issues Found During Relaunch

- `src/Bluent.UI/Bluent.UI.csproj` contains an invalid repository URL: `githttps://github.com/vrassouli/Bluent`.
- The rewritten README references `ROADMAP.md` and `CONTRIBUTING.md`, which must be created before the relaunch branch is merged.
- README installation instructions and asset paths must be verified against the source before merging.

## Session Resume Procedure

When resuming work on Bluent:

1. Read this file.
2. Check the current branch and open pull requests.
3. Continue with the first unchecked task in the current sprint.
4. Update this file after completing or changing a task.
5. Do not start a later sprint while the current sprint's definition of done remains unmet.
