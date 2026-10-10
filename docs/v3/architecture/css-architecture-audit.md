# Bluent v3 — CSS architecture baseline and proposed ADR

> **Issue:** [#417](https://github.com/vrassouli/Bluent/issues/417) · **Status:** draft / source, limited browser and local package verified; ADR not approved · **Branch:** `v3/issue-417-css-architecture` · **Date:** 2026-10-09

## Purpose and guardrails

This is an initial source-derived audit, **not** an approved final styling decision or visual/runtime validation. All work stays in the v3 task branch and targets `bluent-v3` exclusively. `Dev`, stable NuGet and existing production/demo assets remain untouched. Fluent 2 is a design/interaction reference; Bluent remains Blazor-native.

## Current styling graph (observed)

```text
Styles/Themes/theme-{brand}-{light,dark}.scss
   -> theme/light-theme.scss or theme/dark-theme.scss
   -> shared color, typography, spacing, radius, motion and elevation maps
   -> theme-{brand}-{light,dark}.css
Styles/Themes/styles.scss
   -> Bootstrap SCSS functions/variables/breakpoints/grid/utility mixins
   -> local utility, layout, typography and color styles
   -> styles.css
Styles/Components/components.scss
   -> 50 component partials plus :root stacking tokens
   -> components.css
bundleconfig.json -> theme bundles (icons, reboot, light, dark, shared styles)
                  -> components bundle -> packaged *.min.css web assets
```

**Evidence:** `src/Bluent.UI/package.json` specifies `bootstrap: ^5.3.3` and a Sass build script. `Bluent.UI.csproj` has `BundleMinify` invoking `dotnet tool restore` and `dotnet bundle`, with `BuildBundlerMinifier2022` 2.9.11. There are 118 SCSS files in `src/Bluent.UI/Styles`: 51 in `Components`, 64 under `Themes` and three elsewhere. These counts do **not** represent public Blazor components.

## Findings and risk register

| ID | Evidence | Risk / required verification | Priority |
| --- | --- | --- | --- |
| CSS-01 | `Themes/styles.scss` imports Bootstrap RFS, functions, variables, breakpoints, containers, grid, utilities; `_drawer.scss` imports Bootstrap functions/variables | **Build-time** dependency. Audit emitted utility and component class usage before considering removal; do not infer a Bootstrap JS requirement. | High |
| CSS-02 | `theme-default-{light,dark}.scss` use `[data-bui-theme=light]` and `[data-bui-theme=dark]` | Verify nested themes, overlay portal placement and SSR fallback. | High |
| CSS-03 | `Components/components.scss` sets `--zIndex*` on global `:root` and imports all component partials | Global cascade and layering are implicit; define owned stacking and opt-in reset/utility boundaries. | High |
| CSS-04 | `.bui-button`, `.bui-field` consume existing Fluent-style `--colorNeutralBackground1`, `--spacingHorizontalM`, `--borderRadiusMedium` | Preserve value; formalize versioned mapping to Bluent tokens and Penpot. | High |
| CSS-05 | `_field.scss` uses local `--fui-text-field-*`; `_button.scss` has literal pixel dimensions | Define token/density ownership; inventory hardcoded dimensions before altering behavior. | Medium |
| CSS-06 | `styles.scss` generates responsive/RTL utilities and component SCSS contains `.rtl, [dir=rtl]` selectors | Migrating styling can break consumer utility classes, layout, direction or selector specificity. | High |
| CSS-07 | Many Sass `@import` statements remain | Modernization requires an explicit compiler and dependency migration/test plan, not mechanical conversion. | Medium |
| CSS-08 | Bundled output includes icon fonts, reboot, light/dark and utilities | Document asset paths, ordering, collisions, package content and v2→v3 migration. | High |

## Proposed ADR: token-based v3 architecture (not approved)

1. **Three token tiers:** source/reference scales and palettes → semantic design aliases (surface/text/stroke/focus/status/motion) → component-level aliases. Make Microsoft Fluent 2 and Penpot mapping explicit. Bridge existing variable names deliberately rather than silently removing them.
2. **Scoped themes:** define brand, light/dark/high-contrast and density contracts. Test nested theme containers, overlay hosts and SSR/interactive fallback. Prevent theme changes from leaking outside Bluent-owned scopes.
3. **Cascade ordering experiment:** prototype reset → tokens → components → utilities → consumer overrides. Evaluate `@layer` only after testing interactions with existing unlayered CSS and `!important` utilities.
4. **Class and selector policy:** retain `bui-` component prefixes; prefer logical properties and low-specificity selectors. Keep utility names as migration surface until their usage is known; avoid broad application-wide resets by default.
5. **Build strategy:** retain existing Sass/bundler/static-web-assets pipeline for the first proof-of-concept. Remove Bootstrap only after proving class/mixin equivalence, CSS size and package compatibility.
6. **Accessibility:** specify visible focus, contrast, touch target and reduced-motion token behavior, backed by interactive browser tests rather than merely token declarations.

### Alternatives considered

- **Remove Bootstrap immediately:** not justified: grid, breakpoints, utility generators and drawer SCSS imports are still present.
- **Keep old cascade unchanged:** cheapest short-term, but does not resolve global overrides and themes.
- **Adopt Fluent JS runtime wholesale:** unnecessary for the proposed Blazor-native styling and interaction foundation.

## Required v3-only proof-of-concept (first demo implemented; full gates remain)

Use Button, field/input and overlay to compare the old and candidate cascade/tokens under light/dark, RTL/LTR, disabled/validation, keyboard focus and nested themes. Exercise overlays outside normal DOM stacking contexts. Capture computed CSS and screenshots, specificity/cascade behavior, CSS bundle size, build/package output and supported render modes. Source examples or mockups alone are **not runtime/visual evidence**.

## Remaining work / review gates

- [x] Quantify lexical hard-coded colors/dimensions, Bootstrap source imports and JavaScript positioning candidates; generated utility equivalence, selector specificity and CSS collisions **remain open**.
- [x] Record successful Release/Debug build, 20 existing tests and local NuGet pack evidence; distinguish static Sass imports from runtime dependencies.
- [x] Implement the demo-only Button/Field/Overlay POC and exercise limited Chrome interaction; accessibility, portal inheritance and cross-browser tests remain open.
- [ ] Approve or revise this ADR with reviewer findings; then unblock #418 and #420.
- [ ] Add per-change CSS/assets compatibility rows to the #424 migration ledger.

## Evidence classification

**Source verified:** cited source files and package/build configuration. **Runtime verified (limited):** Chrome WASM Debug styling lab controls, themes, directions and mobile viewport. **Build/test verified:** Release and Debug builds, 20 existing unit tests, local pack smoke evidence. **Not verified:** a production v3 token architecture, full accessibility, multihost/portal theme behavior, unlayered/layered specificity regressions or approved visual parity. No public component has been changed.

> **Design gate (2026-10-10):** Penpot is preferred, with an explicitly authorized **Figma fallback** if Penpot is disconnected or attached to a different file. The verified [Microsoft Fluent 2 Web Community kit](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD) is the upstream reference; the independent editable [Bluent v3 working file](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc) contains a [draft #417 architecture board](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=2-2) (page `0:1`, node `2:2`). This is **research**, not an approved ADR/token specification or proof of component visual parity. The earlier code-only Button/Field/Overlay experiment remains separate, pending comparison to the eventually approved design. See [design-first workflow](../PENPOT-WORKFLOW.md).

## 2026-10-10 measured CSS / JS inventory

Reproduce with `python scripts/quality/audit_v3_css.py` or `--json` for per-file source counts.

| Signal | Source-derived count |
| --- | ---: |
| All package SCSS files | 120 (118 main UI; 2 Diagrams) |
| Sass source lines | 9,336 |
| Legacy `@import` occurrences | 178 |
| Sass `@use`/`@forward` occurrences | 17 |
| Direct Bootstrap SCSS imports | 14, across 2 local files |
| Literal `px`/`rem`/`em`/`vh`/`vw` values | 566 |
| Literal hex-color occurrences | 643 (including legitimate palette definitions) |
| `!important` occurrences | 67 |
| Distinct lexical CSS variable definitions / references | 220 / 248 |
| References without definition **in scanned SCSS** | 112 (not proof of broken tokens; may come from emitted CSS or host styles) |
| `:root` in source SCSS | `Components/components.scss` |
| TypeScript files needing positioning review | DataGrid, DomHelper, Overflow, Popover |

The audit counts are lexical and include legitimate intentional design values, repeated declarations, and Sass palettes. They cannot independently prove CSS collisions or actual computed styles. Generated bundles and vendor scripts are excluded from the TypeScript positioning list to avoid double counting; `src/Bluent.UI.Scripts/src/Popover/Popover.ts` directly reads trigger bounding geometry, while `Overflow.ts` measures layout in multiple places.

### Real Blazor styling experiment

- **Files:** `src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor` and colocated scoped `.razor.css`.
- **Local-only development route:** `/v3/styling-lab`; intentionally unlisted in the **public v2-oriented navigation** while the v3 architecture is experimental.
- **Actual control API:** existing Bluent `Button`, `TextField`, `Overlay`. No new public API and no stable CSS bundle modifications.
- **Candidate pattern:** local `--v3-lab-*` aliases resolve to existing Fluent-style variables; a scoped theme container and density switch adjust only the experiment. Candidate token names are **not yet the public schema** (#418).
- **Bounded functionality:** theme (light/dark), direction (LTR/RTL), compact/comfortable density, disabled Button, text binding and submit feedback, visual-only overlay (click backdrop to dismiss). The overlay is explicitly **not** a production modal: focus trap, focus restore and escape-key behavior are out of scope.
- **Initial test problem:** `dotnet run -c Release` served the GitHub Pages `<base href="/Bluent/">` variant, so the local root URL had incorrect asset paths and Blazor did not initialize. This is a host configuration issue, **not evidence about the candidate CSS**. Debug build and host correctly use `<base href="/">`; no release file was edited.
- **Debug browser:** Chrome dedicated temporary profile on Dev01; `http://127.0.0.1:5078/v3/styling-lab`. Confirmed switching themes, switching direction, density change (button height 40 → 32 CSS pixels), text entry, action feedback, overlay show/dismiss and return to baseline. On a 390×844 viewport, closed the demo's default mobile navigation and inspected Dark+RTL. An overlay preview centering bug on RTL was observed (negative x-coordinate) and repaired by using a viewport-anchored left center, then rechecked at positive centered bounds (x=307 for 1034px width / 420px panel).
- **Build:** `dotnet build Bluent.sln --configuration Release --no-restore --nologo -v:q` passed (0 warnings/errors), both before and after adding the POC. `dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj -c Debug --no-restore --nologo -v:q` passed (0 warnings/errors).
- **Tests:** `dotnet test Bluent.sln --configuration Release --no-build --nologo -v:q` passed 20/20 tests. These are existing suite checks, **not** dedicated CSS parity, accessibility or visual-regression tests.
- **Browser diagnostics:** after clearing older entries and reloading the Debug lab, no new browser diagnostics were reported immediately. No broad multi-browser/browser-engine or all-render-mode claim is made.

### Findings from the experiment

1. **Incremental scoped aliases work for real Bluent components** without rewriting public component source. However, the experiment changes the control appearance intentionally and is not proof of Fluent 2 fidelity.
2. **CSS-isolation + nested theme is useful** for component-scoped experiments, but production overlays rendered to document-level portals may fall outside local token inheritance. Dedicated tests are still needed (#420).
3. **RTL and viewport anchoring must be tested together.** A superficially logical `inset-inline-start: 50%` with `translate(-50%, -50%)` miscentered the preview in RTL. Use an explicit viewport-centered positioning strategy for this type of element.
4. **Do not remove Bootstrap yet**: build-time mixins and generated utility/grid classes still require replacement coverage and consumer migration tests.
5. **Not yet validated:** WCAG contrast calculations, keyboard focus trapping, high contrast, reduced motion in real browser settings, browser-wide screenshot diffs, Sass package size differences, CSS `@layer` compatibility and SSR/static-rendering behavior. These remain approval gates for the final styling ADR.

For browser-backed CSS cascade proofs, actual nested DialogContainer theme behavior, reduced-motion and forced-color observations, and the design-tool quota limitation, see [CSS runtime probes](css-runtime-probes.md). For the latest **80-pair color contrast arithmetic**, generated utility usage inventory and **published Release/Production SSR smoke**, see [accessibility and utility baseline](accessibility-and-utility-baseline.md).

For precise source-to-Figma palette mapping, all ten branded CSS bundle checks and local NuGet pack evidence see [theme contract crosswalk](theme-contract-crosswalk.md) and the [verified Figma token/cascade decision board](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) (node `14:3`). All proposed architectural decisions remain drafts.

This remains **In progress** under #417 and draft PR #498, not approved/merged architecture.