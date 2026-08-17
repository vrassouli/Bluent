# Bluent Backlog

This file contains project work that is not fully represented by the active sprint checklist.

Use `.bluent/PROJECT.md` for current status and `.bluent/HANDOFF.md` for the immediate agent handoff.

## Now

Final stable release candidate work tracked by
[Issue #381](https://github.com/vrassouli/Bluent/issues/381):

- Finalize the approved stable `1.0.367` changelog section dated 2026-07-26.
- Validate the five existing published package IDs at exact version `1.0.367`.
- Run and inspect the protected artifact-only workflow without publication.
- Open the final release pull request targeting `Dev` for maintainer review.

Do not publish packages or create a tag or GitHub Release as part of this work.

## Next

Work to reconsider only after Sprint 3 foundations are complete:

- Automate a transient Interactive Server circuit reconnection test.
- Instrument and record the Interactive Auto server-to-WebAssembly transition.
- Complete remaining low-risk compatibility or warning follow-ups that Sprint
  3 explicitly defers.
- Refine release cadence after the first release through the replacement
  process.
- Improve contributor guidance based on observed use of the new quality gates.

## Parallel Quality Work

- Issue #366 is now an explicit Sprint 3 workstream rather than parallel work.
- [Issue #374](https://github.com/vrassouli/Bluent/issues/374): document
  Checkbox from current source.
- [Issue #375](https://github.com/vrassouli/Bluent/issues/375): expand
  release-package validator tests with synthetic archives.
- [Issue #376](https://github.com/vrassouli/Bluent/issues/376): document Badge
  from current source.
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
