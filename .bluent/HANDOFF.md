# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Complete **Sprint 2 — Demo and Visual Presentation**.

The immediate goal is to turn the existing demo into a credible public product experience for developers evaluating Bluent as an enterprise Blazor UI toolkit.

## Current Branch and Tracking

- Branch: `demo/sprint-2-visual-presentation`
- Pull request: [#369](https://github.com/vrassouli/Bluent/pull/369) — draft
- Sprint issue: [#368](https://github.com/vrassouli/Bluent/issues/368)
- AI-readiness epic: [#363](https://github.com/vrassouli/Bluent/issues/363)
- Demo audit: `docs/demo/sprint-2-audit.md`
- Sprint plan: `.bluent/sprints/sprint-02.md`

## Read First

1. `AGENTS.md`
2. `.bluent/PROJECT.md`
3. this file
4. `.bluent/sprints/sprint-02.md`
5. `.bluent/QUALITY.md`
6. `.bluent/BACKLOG.md`
7. `docs/demo/sprint-2-audit.md`
8. `src/Bluent.UI.Demo.Pages/AGENTS.md`
9. relevant canonical documentation under `docs/`

## Current State

Already implemented on the active branch:

- Product-oriented responsive landing page replacing the default Blazor starter page.
- In-demo Getting Started page based on canonical documentation.
- Purpose-based navigation groups.
- Functional compact and expanded navigation.
- Initial responsive scoped styling.
- Successful GitHub Actions restore, Release build, tests, package creation, and Markdown-link validation.

Still required before Sprint 2 can be considered complete:

- Add at least three runnable enterprise scenario pages.
- Establish and apply a repeatable component showcase layout to the highest-value pages.
- Perform browser-based desktop and mobile review.
- Validate light and dark themes.
- Validate LTR and RTL layouts.
- Validate Home and Getting Started behavior in a running application.
- Capture accurate professional screenshots.
- Validate the static deployment workflow.
- Update project tracking and PR evidence.

## Execution Order

1. Review the active branch and PR #369 before changing code.
2. Implement the enterprise scenario pages defined in `.bluent/sprints/sprint-02.md`.
3. Apply the showcase structure to selected high-value components.
4. Perform runtime visual validation across required modes and widths.
5. Fix issues found during validation without expanding into unrelated feature work.
6. Capture screenshots only from the validated running application.
7. Run all required build, test, pack, and documentation checks.
8. Update `.bluent/PROJECT.md`, Issue #368, and PR #369 with exact evidence.
9. Mark PR #369 ready for review only after the Sprint 2 definition of done is satisfied.
10. Do not merge the PR without maintainer review.

## Constraints

- Do not introduce new public Bluent APIs or product components.
- Reuse existing Bluent components and established demo infrastructure.
- Do not introduce a new design system or unrelated CSS framework.
- Preserve light/dark mode and LTR/RTL behavior.
- Preserve existing package boundaries and public API conventions.
- Do not claim runtime, responsive, render-mode, or deployment validation unless it actually ran.
- Keep commits focused and reviewable.
- Record any source/documentation mismatch instead of guessing.
- Keep Issue #366 render-mode validation separate unless a Sprint 2 change directly depends on it.

## Completion Protocol

Sprint 2 is complete only when:

- the landing page clearly positions Bluent;
- navigation is structured and usable on desktop and mobile;
- at least three enterprise scenarios run successfully;
- themes and direction modes are visually validated;
- screenshots accurately represent the current product;
- required CI and deployment checks pass;
- `.bluent/PROJECT.md`, Issue #368, and PR #369 contain the final evidence;
- PR #369 is ready for maintainer review against `Dev`.
