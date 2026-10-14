# Bluent v3 — component-family reference template

> **Authoring contract only — not a released v3 component or supported API.** Replace the bracketed placeholders with verified source/design/test facts on each family issue. Do not publish this template as an implemented component API. See [the v3 documentation index](README.md) and [epic's definition of done](https://github.com/vrassouli/Bluent/issues/416).

## Identity and maturity

| Field | Required content |
| --- | --- |
| Family | [Exact inventory family; link to its current 2.x reference] |
| Version/maturity | Existing 2.x behavior / accepted v3 / preview / proposed / unimplemented |
| NuGet and namespace | [Exact package ID, public namespace and source path, checked from code] |
| Implementation issue / PR | [Task, PR targeting bluent-v3 only, exact commit] |
| Fluent 2 baseline | [Which upstream behaviors/states apply; deliberate Bluent extensions] |
| Owned design | [Penpot/Figma file, page, component/variant/board IDs; review state] |
| Component author | [Reviewer and date] |

## Source and public API inventory

Record every actual public type, enum, nested subcomponent, parameter, default, `EventCallback`, `@bind-` contract, generic type argument, render-fragment slot, service/JS dependency, and lifecycle/disposal requirement. Link to real `src/` files; **do not derive API declarations from a diagram**.

| Type/member | CLR type | Default | Observable behavior and restrictions | Source evidence |
| --- | --- | --- | --- | --- |
| [Verified only] | [Verified only] | [Verified only] | [Verified only] | [Source path/commit] |

## Anatomy and variant matrix

Tie each supported appearance, size/density, shape, icon/layout, state (rest, hover, pressed, selected, disabled, focus-visible), error/loading and edge case to both a real native design variant and a real implemented fixture. Explicitly mark unsupported states rather than inventing them.

| State × appearance × size | Design node / token | Blazor/CSS implementation | Demo fixture | Test proof | Known gap |
| --- | --- | --- | --- | --- | --- |
| [Verified combination] | [Penpot ID] | [Source selector/branch] | [Demo route] | [Test ID] | [Or none] |

## Interaction and accessibility

Record native HTML semantics, keyboard navigation (including Tab, Shift+Tab, Enter/Space as applicable), focus-visible vs selected, forced-colors handling, name/description relationships, ARIA, disabled and readonly rules, pointer/touch behavior, reduced motion, focus restoration and nested overlay behavior. State exactly whether proof is CSS-source, rendered DOM, interactive browser, contrast calculation, Windows/macOS native accessibility or assistive technology. **One type of evidence does not replace the others.**

## RTL, language and responsive behavior

Document Persian text shaping and fallback fonts, RTL/LTR directional semantics, mixed identifiers, 320px/reflow/zoom/long content, icon and label alignment, touch targets and overflow. Give actual locale and viewport for each tested fixture. Do not claim full WCAG 2.2 AA from contrast arithmetic alone.

## Verified consumer usage

Only after a runnable example exists, show its actual tested Razor snippet, required `@using`, service registration, static assets, relevant hosting/render mode and the executable demo route. Before then, write **Unimplemented — no verified v3 sample**; do not replace absent code with illustrative but plausible parameters.

## Validation ledger

| Claim | Source/build/test command | OS/browser/render mode | Result and date | Evidence link |
| --- | --- | --- | --- | --- |
| [Exact behavior] | [Reproducible command] | [Exact environment] | [Pass/fail/not tested] | [CI artifact/PR] |

Also record negative cases, unsupported features, design exceptions and failed runs, including follow-up issues. Complete demo coverage requires an auditable public API/event/state matrix, not merely a screenshot or a sample page.

## 2.x → v3 compatibility

For **each** public change, classify unchanged / additive / deprecated / breaking, list old and accepted new behavior, exact before/after source-compiled code, CSS selector/token changes, asset paths and migration/rollback instructions. If a decision is pending, label it **proposed**, not a migration requirement.

## Acceptance and change log

Link acceptance decisions, review comments, validated Penpot parity, test runs, component skill, demo ledger and issue transition. Mark Done only after the PR merges into `bluent-v3` and the full family acceptance conditions are actually met. Never merge task-level v3 work into stable `Dev`.

Design source: [Bluent v3 owned Penpot working library](design/BLUENT-V3-PENPOT.md). Repo process: [branching](BRANCHING.md) and [workflow](ISSUE-WORKFLOW.md).
