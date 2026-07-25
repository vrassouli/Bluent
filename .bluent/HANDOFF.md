# Codex Handoff

This file is the operational entry point for continuing Bluent with Codex or another coding agent.

## Current Objective

Sprint 2 — Demo and Visual Presentation is complete. Prepare Sprint 3 only when the maintainer chooses to begin it.

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `Dev`
- Completed checkpoint: [PR #369](https://github.com/vrassouli/Bluent/pull/369) — merged
- Sprint completion: [PR #370](https://github.com/vrassouli/Bluent/pull/370) — merged
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

Already merged into `Dev`:

- Product-oriented responsive landing page replacing the default Blazor starter page.
- In-demo Getting Started page based on canonical documentation.
- Purpose-based navigation groups.
- Functional compact and expanded navigation.
- Initial responsive scoped styling.
- Repository-native Codex handoff, backlog, quality policy, and sprint plan.
- Successful checkpoint restore, Release build, tests, package creation, and Markdown-link validation.

Completed through PR #370:

- Added runnable customer profile, operations dashboard, and confirmation/notification scenarios.
- Applied a repeatable showcase header to the highest-value component pages.
- Validated Home, Getting Started, scenarios, and showcase pages at desktop and mobile widths.
- Validated light/dark, LTR/RTL, a non-default brand color, interactions, navigation, overflow, and console state.
- Captured and documented current landing, component, enterprise, and dark/RTL screenshots.
- Modernized the static deployment workflow and validated the local Release publish output.
- Passed the cached Release build, all 17 tests, five-package pack/metadata inspection, and Markdown-link validation.
- Passed clean restore/build/test/pack/link validation on commit `f1c2748` in GitHub Actions run `30154038522`.
- Deployed commit `f1c2748` successfully in Pages run `30154039208` and checked the live root, client-side routes, and required assets.
- Confirmed in the final live browser check that deployed Home/Bluent links respect `/Bluent/`, the operations chart renders, root navigation succeeds, overflow is zero, and the console is clean.
- Restored the `github-pages` deployment environment to its original `Dev` and `gh-pages` branch policies after feature-branch validation.

Final evidence was added to Issue #368, PR #370 was merged into `Dev`, and the merged Sprint branches were deleted.

## Next Session

1. Start from current `Dev`.
2. Review `.bluent/PROJECT.md`, `.bluent/BACKLOG.md`, `ROADMAP.md`, and open tracking issues.
3. Confirm Sprint 3 scope with the maintainer before creating its branch or pulling backlog items into active work.

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
- `.bluent/PROJECT.md`, Issue #368, and the completion PR contain the final evidence;
- the completion PR is reviewed and merged into `Dev`.
