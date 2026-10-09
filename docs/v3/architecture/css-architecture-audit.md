# Bluent v3 — CSS architecture baseline and proposed ADR

> **Issue:** [#417](https://github.com/vrassouli/Bluent/issues/417) · **Status:** draft / source-verified only · **Branch:** `v3/issue-417-css-architecture` · **Date:** 2026-10-09

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

## Required v3-only proof-of-concept (not yet implemented)

Use Button, field/input and overlay to compare the old and candidate cascade/tokens under light/dark, RTL/LTR, disabled/validation, keyboard focus and nested themes. Exercise overlays outside normal DOM stacking contexts. Capture computed CSS and screenshots, specificity/cascade behavior, CSS bundle size, build/package output and supported render modes. Source examples or mockups alone are **not runtime/visual evidence**.

## Remaining work / review gates

- [ ] Quantify selector specificity, hard-coded colors/dimensions, generated utilities, CSS collision and JS positioning dependencies with source references.
- [ ] Record build warnings and distinguish compile-time, runtime and package dependencies.
- [ ] Implement and validate the isolated Button/field/overlay POC before choosing tokens or cascade layers.
- [ ] Approve or revise this ADR with reviewer findings; then unblock #418 and #420.
- [ ] Add per-change CSS/assets compatibility rows to the #424 migration ledger.

## Evidence classification

**Source verified:** cited source files, imports, selectors and package/build configuration inspected on the v3 baseline. **Not yet build/test/runtime/visual/pack verified** for the proposed architecture. No public component has been changed.
