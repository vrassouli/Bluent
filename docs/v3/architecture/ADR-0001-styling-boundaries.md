# ADR-0001 — Bluent v3 styling boundaries, token bridge and CSS migration

- **Status:** **Proposed — awaiting maintainer review**, not approved and not an implemented v3 styling engine
- **Date:** 2026-10-11
- **Issue:** [#417](https://github.com/vrassouli/Bluent/issues/417), review in [PR #498](https://github.com/vrassouli/Bluent/pull/498)
- **Target integration:** `bluent-v3` **only**; do not merge to `Dev`, publish NuGet or alter current 2.x CSS before the complete v3 is accepted
- **Design reference:** independent [Bluent v3 Penpot #419 review PR](https://github.com/vrassouli/Bluent/pull/499); Microsoft Fluent 2 UI kit is a visual reference, **not the Blazor runtime or a mandatory one-to-one component API**

## Context / reproducible facts

The existing UI theme build uses distinct Sass/imported Bootstrap utilities, ten generated brand CSS bundles, a shared components bundle and static-web-assets packaging. The source CSS has **178 `@import`** and **14 direct Bootstrap Sass imports**; the generated utility CSS has **2,653 distinct lexical class names**, with **86 matched literal class names / 1,441 references across 78 demo/sample Razor files**. This is an **observed consumer/migration surface**: it does not prove provenance or every external/dynamic class use.

Current Light/Dark default CSS exposes `--colorNeutralBackground1`, `--colorNeutralForeground1`, `--colorBrandBackground`, `--spacingHorizontalM`, `--borderRadiusMedium`, `--durationFaster` and other Fluent-like custom properties. Ten brands have distinct minified hashes despite equal recorded byte sizes. Scope is `[data-bui-theme=light|dark]`, not a global v3 CSS token contract.

Actual browser tests found:
- `:root` stacking variables are global; service-rendered Dialog is mounted outside the page-local theme subtree. A nested dark theme did **not** propagate automatically to the Dialog host (Dialog remained light).
- A demo-only reduced-motion Button transition was disabled, while the real `.bui-overlay` fade remained **0.25s** under `prefers-reduced-motion: reduce`. This is a concrete accessibility/motion gap, not a declaration that all a11y fails.
- Browser CSS cascade samples verified that unlayered CSS wins over normal layered declarations and `!important` ordering reverses. Do not switch the entire style surface to `@layer` without consumer checks.
- Contrast arithmetic for **80 specified opaque source token pairs** was above 4.5:1 (minimum observed 5.552); this is **not WCAG compliance** for all components, forced-colors or alpha/overlay combinations.
- Local Release build, unit tests, a local NuGet packaging smoke and a **repeatable published SSR Production smoke** have been exercised. The [PowerShell smoke probe](../../../scripts/quality/probe_v3_ssr_publish.ps1) verified HTML/CSS/JS at **3/3 HTTP 200**, with actual MIME and nonempty payload after setting the published process working directory. Source-level and browser evidence have different scopes; none of the proofs certify v3 runtime/API parity.

The full measurements, source paths, browser reproduction commands and limitations remain in [the CSS audit](css-architecture-audit.md), [theme crosswalk](theme-contract-crosswalk.md), [runtime CSS probes](css-runtime-probes.md) and [accessibility/utility baseline](accessibility-and-utility-baseline.md).

## Proposed decisions to accept at review

| ID | Recommendation | Invariant / implementation rule |
| --- | --- | --- |
| **D1 — Token bridge** | **Retain existing public Fluent-like CSS variable names during transition.** Introduce versioned source/global scales → v3 semantic aliases → private component aliases, **opt-in** before shipping. | No removal or unannounced reinterpretation of `--colorNeutral*`, `--colorBrand*`, `--spacing*`, `--borderRadius*`, `--duration*`, `--fui-text-field-*` without a verified compatibility/migration plan. Final token names/brands belong to **#418**, which is **Backlog** and must not be implemented from this proposed ADR. |
| **D2 — Theme and portals** | Explicit theme context belongs to the Bluent application/theme host; page-local CSS ancestors alone cannot style detached overlays. | Retain `[data-bui-theme]` selectors; define theme propagation for globally hosted Dialog/Popover/Overlay roots, fallback for SSR and nested contexts, and audit `forced-colors` plus reduced motion in real browsers. No global theme switch that leaks into unrelated host apps. |
| **D3 — Cascade/isolation** | **Keep existing unlayered CSS behavior as the default** for v2 consumers. Introduce a well-documented `@layer` experiment **only by opt-in** and test specificity/`!important`/consumer overrides first. | Preserve `bui-` public selector conventions; prefer CSS logical properties, scoped component aliases and low specificity. A consumer must still be able to override safely under the documented order; no CSS-wide reset outside owned root. |
| **D4 — Sass, Bootstrap and packages** | **Keep current Bootstrap Sass grid/utility/breakpoint/mixin build dependency and existing bundler/static web asset pipeline initially.** | No immediate drop of Bootstrap-generated classes; capture compiled bundle API, Sass migration complexity and consumer utility coverage. Remove only when build/runtime/consumer parity, asset hashes, layout and fallback are proved, via a separate migration issue. |
| **D5 — Accessibility/motion** | Treat focus visibility, forced-colors, minimum target sizes, RTL, high zoom and reduced motion as **acceptance tests**, not optional decorative tokens. | Workarounds must be demonstrated using actual Blazor/browser/assistive tech on v3 implementation issues. The current `.bui-overlay` motion defect becomes an explicit test case; do not fix legacy stable CSS inside the isolated ADR research task. |

## Alternatives considered

1. **Rewrite all CSS into Fluent Web Components:** rejected as a default strategy. Fluent UI is the **design and behavior reference**; Bluent remains Blazor-native with distinctive APIs, diagrams/charts and dependency model.
2. **Remove Bootstrap and Sass immediately:** rejected without quantified source and real consumer replacement proof. Generated utilities are a nontrivial source and consumer surface.
3. **Put all styles in global `@layer` immediately:** rejected due documented cascade reversal with unlayered consumer CSS and `!important` behavior.
4. **Keep v2 untouched forever with only cosmetic tweaks:** insufficient; does not solve portal mode inheritance, styling consistency, motion policy, documentable alias ownership or CSS debt.
5. **Introduce global v3 tokens without a compatibility bridge:** rejected because existing apps might rely on the exact old variables, static-asset ordering and theme inheritance.

## Component foundation and phase gates

| Phase / owner | Permitted work | Must prove before proceeding |
| --- | --- | --- |
| **#417 review** | Audit, proof-of-concept Button/Input/Overlay, decisions D1–D5, package and migration baseline | Repeatable source and limited runtime evidence, explicit limitations, Penpot traceability, maintainer acceptance of this ADR |
| **#418 token task (not started)** | Semantic/global/brand/mode token implementation **only after Ready** | Approved ADR, versioned token schema + Light/Dark/brand/forced-colors/RTL/motion matrix and contrasts, clear alias precedence |
| **Individual component issue** | Independent Penpot design, Blazor implementation, CSS, demos, component docs/skill and tests | Complete public API mapping, keyboard/AT/reflow/SSR, migration and visual coverage; no implicit approval of Fluent source parity |
| **#424 migration** | Consumer upgrade guide and deprecated-name adapters | `Default` vs `Secondary`, Danger, custom CSS overrides, Bootstrap utilities, theme nesting/portal and static assets accounted for |
| **Final Epic #416 review** | Accepted work merged to **`bluent-v3`**; stable branch still protected | Full integration regression, maintainer-authorized v3 release plan, **separate explicit permission** before touching `Dev` |

## Known limitations / follow-up owner

- **D1:** Token naming and default brand candidates are reviewed as source-aligned drafts, not approved v3 variable APIs. **Owner #418** after #417 acceptance.
- **D2:** Dialog/portal CSS mode gap is reproduced, not repaired in production code. **Owner #420 / Dialog/component issues** under their own Ready gates.
- **D3:** Opt-in `@layer` validation needs a genuine consumer CSS override fixture and combined utility conflicts. **Owner #417 review/implementation follow-up, plus #424**.
- **D4:** No removal of Bootstrap until consumer/utility parity and build size/code cleanup proofs. **Owner later explicit migration task**.
- **D5:** Forced-colors and reduced-motion need AT/browser acceptance, especially Overlay and focused control states. **Owner individual component/a11y tasks**.
- **Design fidelity:** The [Penpot #419 handoff/import report in the separate task branch](https://github.com/vrassouli/Bluent/blob/v3/issue-419-penpot-library/docs/v3/design/PENPOT-IMPORT-FIDELITY.md) explicitly records Segoe UI fallback and imported source plugin `switchVariant` mismatch; no lossless Figma import or pixel parity is claimed.

## Decision and rollback

**Requested reviewer decision:** accept D1–D5 as the guiding styling architecture, or comment on the specific row needing revision. This ADR must remain **Proposed** until explicitly accepted; publishing a PR or checking a token bundle cannot constitute approval.

**Rollback policy:** #417's research and demo-only styling lab can be discarded by not merging PR #498 into `bluent-v3`; it has **not changed the stable v2 CSS contract**. Any later opt-in alias/layer migration must have a standalone opt-out strategy and regression checks before integration. Preserve all old branch/release behavior until final authorized v3 completion.