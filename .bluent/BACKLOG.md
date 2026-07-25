# Bluent Backlog

This file contains project work that is not fully represented by the active sprint checklist.

Use `.bluent/PROJECT.md` for current status and `.bluent/HANDOFF.md` for the immediate agent handoff.

## Now

Work committed to Sprint 2:

- Complete the demo landing, navigation, component showcase, enterprise scenarios, visual validation, screenshots, and deployment validation tracked by Issue #368 and PR #369.
- Keep project tracking and validation evidence current.

## Next

Likely Sprint 3 candidates:

- Define and automate a predictable release workflow.
- Modernize and validate the GitHub Pages/static deployment workflow.
- Improve release notes and release evidence.
- Triage and resolve existing compiler warnings before the next stable release.
- Add accessibility and quality gates where practical.
- Create contributor-friendly issues and identify good-first-issue candidates.

## Parallel Quality Work

- [Issue #366](https://github.com/vrassouli/Bluent/issues/366): validate Interactive Server, Interactive WebAssembly, and Interactive Auto render modes.
- Continue [Issue #363](https://github.com/vrassouli/Bluent/issues/363): expand verified component references and compile representative AI-generated consumer samples.
- Expand the AI benchmark to context-free and multiple-model runs.
- Add consumer-project build validation for generated examples.

## Later

- Documentation website or GitHub Pages redesign beyond the demo scope.
- Brand and visual identity refinement.
- Automated API reference generation.
- Public application showcase.
- Community launch and outreach.
- Package naming and boundary review.
- Release cadence review.
- Additional migration guides as public APIs evolve.
- Evaluate a generated AI context bundle or Bluent MCP after canonical documentation is mature.

## Parking Lot

Ideas that require evaluation before scheduling:

- Searchable component catalog inside the demo.
- Automated screenshot generation and visual regression testing.
- Accessibility test automation for selected components.
- Interactive code playgrounds.
- Versioned documentation for multiple stable releases.
- Public compatibility dashboard for render modes and browsers.

## Deferred or Rejected for the Relaunch Phase

- New product components without explicit maintainer approval.
- Broad public API redesigns.
- Manufactured popularity or recommendation signals.
- Claims of support that are not backed by source or runtime evidence.
- A custom agent skill system before repeatable workflows justify it.

## Backlog Item Template

Use this format when adding actionable work:

```markdown
- [ ] Item title
  - Priority: High | Medium | Low
  - Type: Product | Documentation | Quality | Infrastructure | Community
  - Tracking: Issue or PR URL when available
  - Dependencies: Required preceding work
  - Done when: Observable acceptance criteria
```
