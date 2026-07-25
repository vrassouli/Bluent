# Sprint 2 — Demo and Visual Presentation

## Goal

Turn the Bluent demo into a credible public product experience for teams evaluating an enterprise Blazor UI toolkit.

## Tracking

- Branch: `demo/sprint-2-completion`
- Foundation pull request: [#369](https://github.com/vrassouli/Bluent/pull/369) — merged
- Completion pull request: pending creation; validation gates are complete
- Issue: [#368](https://github.com/vrassouli/Bluent/issues/368)
- Audit: `docs/demo/sprint-2-audit.md`

## Non-Goals

- Adding new public Bluent components.
- Redesigning package boundaries or public APIs.
- Completing the separate render-mode validation tracked by Issue #366.
- Building a full documentation platform beyond the current demo scope.
- Introducing unrelated design frameworks or broad infrastructure rewrites.

## Workstreams

### 1. Landing and Positioning

- [x] Replace the default Blazor starter home page.
- [x] Explain Bluent's enterprise positioning.
- [x] Add clear calls to action.
- [x] Highlight themes, dark mode, RTL, Charts, and Diagrams.
- [x] Complete browser-based review of the landing page.

### 2. Navigation and Discovery

- [x] Add Home and Getting Started destinations.
- [x] Group component links by purpose.
- [x] Promote Charts and Diagrams.
- [x] Support compact and expanded navigation.
- [x] Validate desktop behavior.
- [x] Validate mobile behavior.
- [x] Validate navigation in LTR and RTL.

### 3. Component Showcase Standard

Define a repeatable structure for high-value component pages:

1. purpose and business use;
2. package and namespace;
3. interactive example;
4. source snippet or source reference;
5. important parameters/events;
6. theme, RTL, accessibility, and hosting notes;
7. limitations and validation evidence.

Apply it first to:

- [x] Buttons/actions.
- [x] Fields/forms.
- [x] Data Grid and Data Pager.
- [x] Dialogs, Toasts, and Message Bars.
- [x] Charts.
- [x] Diagrams.

### 4. Enterprise Scenarios

Implement at least three runnable scenarios using existing public components:

- [x] Customer profile form — common fields, validation affordances, primary/secondary actions.
- [x] Operations dashboard — cards, statuses, table/grid, feedback, and charts where supported.
- [ ] Search and filter workspace — filters, results, paging, empty/loading state.
- [x] Confirmation and notification flow — dialog, message bar, toast, and action handling.
- [ ] RTL business form — demonstrate direction, alignment, and localized business UI.

Preferred minimum set for completion:

1. Customer profile form.
2. Operations dashboard.
3. Confirmation and notification flow.

### 5. Visual and Runtime Validation

- [x] Run the WebAssembly demo.
- [x] Review Home and Getting Started in a browser.
- [x] Review selected showcase pages and all completed scenario pages.
- [x] Validate representative desktop widths.
- [x] Validate representative mobile widths.
- [x] Validate light theme.
- [x] Validate dark theme.
- [x] Validate LTR.
- [x] Validate RTL.
- [x] Check browser console and navigation errors.
- [x] Record environment and commit SHA after final validation commit.

### 6. Assets and Deployment

- [x] Capture README-quality landing screenshot.
- [x] Capture component showcase screenshot.
- [x] Capture enterprise scenario screenshot.
- [x] Capture RTL or theme demonstration screenshot.
- [x] Modernize static deployment workflow where required for this demo.
- [x] Run and validate the static deployment workflow.
- [x] Check deployed routes and assets.

### 7. Finalization

- [x] Run Release restore/build/test.
- [x] Pack all five packages where the workflow requires it.
- [x] Validate local Markdown links.
- [x] Update `.bluent/PROJECT.md`.
- [ ] Update Issue #368 with evidence.
- [x] Preserve PR #369 as the merged foundation checkpoint.
- [ ] Open the Sprint 2 completion PR with exact validation and remaining risks.

## Validation Evidence

- Local runtime: Blazor WebAssembly demo on macOS 26.5.2 with .NET SDK 10.0.300.
- Browser matrix: 1440 × 1000 desktop and 390 × 844 mobile; Home, Getting Started, all three enterprise scenarios, and the selected high-value showcase pages reviewed.
- Modes: light and dark themes, LTR and RTL direction, and a non-default Teams brand color reviewed without horizontal overflow.
- Interaction: customer save, dashboard refresh and alert acknowledgement, confirmation dialog, toast, mobile drawer, and navigation scroll reset exercised.
- Console: no browser console warnings or errors during the final local review.
- Local verification: Release build, 17/17 tests, all five package outputs and metadata, Release static publish, packaged assets, and local Markdown links passed.
- Remote verification: commit `f1c2748` passed clean restore/build/test/pack/link validation in [run 30154038522](https://github.com/vrassouli/Bluent/actions/runs/30154038522). All 17 tests passed and the five packages were produced. The clean build retained 10 pre-existing compiler warnings and no errors.
- Deployment: commit `f1c2748` passed the modernized Pages workflow in [run 30154039208](https://github.com/vrassouli/Bluent/actions/runs/30154039208) and deployed to `https://vrassouli.github.io/Bluent/`. Root, fallback routes, framework assets, Bluent styles, and demo JavaScript were checked; GitHub Pages returns its expected HTTP 404 status for client-side fallback URLs while the Blazor router renders them successfully.
- Final live browser check: the deployed operations route rendered its chart without overflow or console errors, Home/Bluent resolved to the `/Bluent/` base path, and the brand link returned successfully to the deployed landing page.
- Deployment policy: the feature branch was temporarily added to the existing `github-pages` custom branch allowlist for validation, then removed. The original `Dev` and `gh-pages` policies remain.

## Acceptance Criteria

- The demo immediately explains what Bluent is and who it serves.
- Users can find major component families without scanning one flat list.
- At least three enterprise scenarios are runnable.
- Existing Bluent strengths are visibly demonstrated rather than only described.
- Desktop/mobile and theme/direction combinations have recorded runtime evidence.
- Screenshots are current and truthful.
- Build, tests, package checks, links, and deployment checks pass or any limitation is explicitly recorded.
- The sprint is delivered through one reviewed PR into `Dev`.

## Risks

- Visual changes can hide RTL, overflow, focus, or responsive defects.
- Demo-only CSS may diverge from actual component behavior.
- Existing components may not cover a desired scenario without exposing gaps; record gaps rather than adding unapproved public APIs.
- Static hosting base paths may differ from local hosting.
- Browser and screenshot validation cannot be inferred from CI build success.
