# Sprint 2 — Demo and Visual Presentation

## Goal

Turn the Bluent demo into a credible public product experience for teams evaluating an enterprise Blazor UI toolkit.

## Tracking

- Branch: `demo/sprint-2-visual-presentation`
- Pull request: [#369](https://github.com/vrassouli/Bluent/pull/369)
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
- [ ] Complete browser-based review of the landing page.

### 2. Navigation and Discovery

- [x] Add Home and Getting Started destinations.
- [x] Group component links by purpose.
- [x] Promote Charts and Diagrams.
- [x] Support compact and expanded navigation.
- [ ] Validate desktop behavior.
- [ ] Validate mobile behavior.
- [ ] Validate navigation in LTR and RTL.

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

- [ ] Buttons/actions.
- [ ] Fields/forms.
- [ ] Data Grid and Data Pager.
- [ ] Dialogs, Toasts, and Message Bars.
- [ ] Charts.
- [ ] Diagrams.

### 4. Enterprise Scenarios

Implement at least three runnable scenarios using existing public components:

- [ ] Customer profile form — common fields, validation affordances, primary/secondary actions.
- [ ] Operations dashboard — cards, statuses, table/grid, feedback, and charts where supported.
- [ ] Search and filter workspace — filters, results, paging, empty/loading state.
- [ ] Confirmation and notification flow — dialog, message bar, toast, and action handling.
- [ ] RTL business form — demonstrate direction, alignment, and localized business UI.

Preferred minimum set for completion:

1. Customer profile form.
2. Operations dashboard.
3. Confirmation and notification flow.

### 5. Visual and Runtime Validation

- [ ] Run the WebAssembly demo.
- [ ] Review Home and Getting Started in a browser.
- [ ] Review selected showcase pages and all completed scenario pages.
- [ ] Validate representative desktop widths.
- [ ] Validate representative mobile widths.
- [ ] Validate light theme.
- [ ] Validate dark theme.
- [ ] Validate LTR.
- [ ] Validate RTL.
- [ ] Check browser console and navigation errors.
- [ ] Record environment and commit SHA.

### 6. Assets and Deployment

- [ ] Capture README-quality landing screenshot.
- [ ] Capture component showcase screenshot.
- [ ] Capture enterprise scenario screenshot.
- [ ] Capture RTL or theme demonstration screenshot.
- [ ] Modernize static deployment workflow where required for this demo.
- [ ] Run and validate the static deployment workflow.
- [ ] Check deployed routes and assets.

### 7. Finalization

- [ ] Run Release restore/build/test.
- [ ] Pack all five packages where the workflow requires it.
- [ ] Validate local Markdown links.
- [ ] Update `.bluent/PROJECT.md`.
- [ ] Update Issue #368 with evidence.
- [ ] Update PR #369 with exact validation and remaining risks.
- [ ] Mark PR #369 ready for review.

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
