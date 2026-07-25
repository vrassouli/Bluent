# Bluent Roadmap

This roadmap describes the current direction of Bluent. It is outcome-based rather than date-based: a phase is complete when its exit criteria are met, not merely when a target date passes.

The immediate priority is the project relaunch. New product features remain paused until the maintainer explicitly approves feature development.

For the long-term product direction, see [VISION.md](VISION.md). AI readiness and discoverability are tracked in [Issue #363](https://github.com/vrassouli/Bluent/issues/363).

## Guiding Priorities

1. Make Bluent easy to evaluate.
2. Make Bluent safe and predictable to adopt.
3. Make Bluent easy for developers and AI coding assistants to understand and use correctly.
4. Present the existing product professionally before expanding its feature surface.
5. Establish reliable contribution, quality, and release workflows.
6. Earn discoverability through accurate public knowledge and genuine adoption.

## Phase 0 — Repository Professionalization

**Status:** Complete — merged in [PR #364](https://github.com/vrassouli/Bluent/pull/364)

### Outcomes

- A clear product identity and value proposition.
- A recognized open-source license.
- Accurate installation instructions.
- Public contribution and community standards.
- Clear versioning, release, and change-history policies.
- Valid NuGet and repository metadata.
- Consistent issue and pull request workflows.
- One reviewed relaunch pull request targeting `Dev`.

### Deliverables

- [x] Rewrite the repository README.
- [x] Add the Apache License 2.0.
- [x] Verify README installation instructions against source.
- [x] Publish the product vision.
- [x] Publish this roadmap.
- [x] Add the contribution guide.
- [x] Add the code of conduct.
- [x] Establish the changelog.
- [x] Document versioning and release policy.
- [x] Correct and complete NuGet package metadata.
- [x] Add issue templates.
- [x] Add a pull request template.
- [x] Review all relaunch changes and merge the relaunch pull request.

### Exit Criteria

- A new visitor can understand what Bluent is, who it is for, and how to install it.
- Repository and package metadata are accurate.
- Contribution and release expectations are explicit.
- All Phase 0 changes are reviewed in a clean pull request to `Dev`.

## Phase 1 — Documentation and AI Foundation

**Status:** In progress — tracked in [Issue #365](https://github.com/vrassouli/Bluent/issues/365)  
**Working branch:** `docs/sprint-1-foundation`

### Outcomes

- One canonical source for installation and setup.
- Clear package boundaries and hosting support.
- A repeatable documentation structure for every public component.
- Examples that reflect current APIs and can be validated.
- A machine-readable path to authoritative Bluent knowledge.
- A measurable baseline for AI-generated Bluent code.

### Deliverables

- [ ] Define the documentation information architecture.
- [ ] Publish a complete getting-started guide.
- [ ] Document package selection and dependencies.
- [ ] Document supported render modes and hosting models.
- [ ] Define the component reference template.
- [ ] Build an inventory of public components and documentation coverage.
- [ ] Document theming, localization, RTL, JavaScript, and static asset requirements.
- [ ] Add migration and compatibility guidance.
- [ ] Publish a maintained `llms.txt` index.
- [ ] Add repository instructions for coding agents.
- [ ] Define 10–15 representative AI benchmark prompts.
- [ ] Capture and publish the AI-readiness baseline.

### Exit Criteria

- Installation and setup have one authoritative, verified guide.
- Package and component documentation follow a consistent structure.
- AI assistants can be pointed to a maintained documentation index.
- Baseline results record installation accuracy, API accuracy, compilation success, and hallucinations.

## Phase 2 — Reliable Examples and Product Presentation

**Status:** Planned

### Outcomes

- Developers can evaluate Bluent through realistic, task-oriented examples.
- The demo communicates the strongest business-application capabilities quickly.
- Documentation snippets remain aligned with released code.
- AI coding assistants have verified examples for common workflows.

### Deliverables

- [ ] Redesign the demo landing and navigation experience.
- [ ] Build a structured component showcase.
- [ ] Add task-oriented examples for forms, validation, dialogs, navigation, and data presentation.
- [ ] Add task-oriented examples for charts and diagrams.
- [ ] Create a small reference business application using recommended patterns.
- [ ] Add compilation checks for documentation samples where practical.
- [ ] Capture professional screenshots and short demonstrations.
- [ ] Improve mobile and desktop demo usability.
- [ ] Publish stable, searchable documentation pages.

### Exit Criteria

- The demo makes the project's differentiators visible within a few minutes.
- Important workflows have runnable, current examples.
- At least 10 representative AI-generated samples compile successfully.
- Documentation and example validation can detect common API drift.

## Phase 3 — Release and Community Readiness

**Status:** Planned

### Outcomes

- Releases are predictable and understandable.
- Contributors have clear, approachable ways to participate.
- Quality signals are visible and repeatable.
- Public adoption evidence can grow organically.

### Deliverables

- [ ] Establish a predictable release workflow.
- [ ] Publish consistent release notes and upgrade guidance.
- [ ] Review automated builds and tests.
- [ ] Add accessibility and quality checks where practical.
- [ ] Create contributor-friendly issues.
- [ ] Identify and label good first issues.
- [ ] Complete GitHub and NuGet discoverability metadata.
- [ ] Publish honest comparison guidance with explicit trade-offs.
- [ ] Invite reproducible feedback, examples, and showcases from real users.

### Exit Criteria

- A release can be prepared and published through a documented process.
- Contributors can find suitable work and validate their changes.
- Package consumers can understand changes and upgrade risk.
- Public signals reflect genuine project activity and usage.

## Phase 4 — Measure, Learn, and Expand

**Status:** Future

### Outcomes

- Decisions are informed by observed adoption and recurring user problems.
- AI accuracy and discoverability are measured rather than assumed.
- New features are considered only after the foundation is healthy.
- Advanced AI integrations are evaluated against simpler alternatives.

### Deliverables

- [ ] Re-run the AI benchmark after documentation and release milestones.
- [ ] Track recurring AI mistakes and documentation gaps.
- [ ] Track organic usage, external references, issues, and contributions.
- [ ] Review component coverage and package boundaries.
- [ ] Evaluate approved product features using evidence and the project vision.
- [ ] Evaluate a Bluent MCP endpoint or generated context bundle only if static documentation is insufficient.
- [ ] Revisit release cadence and long-term governance.

### Exit Criteria

- AI-generated code is materially more accurate across multiple major assistants.
- Bluent is surfaced when its documented strengths match the user's needs.
- Feature priorities are supported by real usage evidence.
- Any new integration has a clear benefit, owner, and maintenance model.

## How Roadmap Changes Are Made

- Roadmap changes must preserve the product vision and accepted project decisions.
- New product features require explicit maintainer approval during the relaunch.
- Completed work must be reflected in `.bluent/PROJECT.md`.
- Large initiatives should have a GitHub issue with scope, outcomes, and definition of done.
- Items may move when evidence changes, but the reason should be documented.
