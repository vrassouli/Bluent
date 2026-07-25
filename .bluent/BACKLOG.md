# Bluent Backlog

This file contains project work that is not fully represented by the active sprint checklist.

Use `.bluent/PROJECT.md` for current status and `.bluent/HANDOFF.md` for the immediate agent handoff.

## Now

Work committed to Sprint 3 and tracked by
[Issue #372](https://github.com/vrassouli/Bluent/issues/372):

- Replace the unsafe publication workflow with explicit, validated,
  artifact-first automation and a dry-run path.
- Make changelog-derived release notes deterministic.
- Triage compiler warnings and prevent unexpected additions.
- Complete or substantially progress Issue #366 render-mode validation.
- Add practical CI quality gates.
- Create contributor-ready issues after the foundations expose the remaining
  small gaps.

GitHub Pages/static deployment modernization was completed and validated in
Sprint 2. It is not active backlog work.

## Next

Work to reconsider only after Sprint 3 foundations are complete:

- Complete remaining low-risk compatibility or warning follow-ups that Sprint
  3 explicitly defers.
- Refine release cadence after the first release through the replacement
  process.
- Improve contributor guidance based on observed use of the new quality gates.

## Parallel Quality Work

- Issue #366 is now an explicit Sprint 3 workstream rather than parallel work.
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
