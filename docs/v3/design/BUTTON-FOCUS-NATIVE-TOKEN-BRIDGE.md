# #501 Native Focus ring TokenSet binding — real Penpot evidence

**Date:** 2026-10-13. **Design status:** Draft candidate / **NOT APPROVED** public v3 token names or Button implementation.

## Edited actual source-owned Penpot file

File `Bluent v3 Design System` `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
Native Button Focus design page `535db143-a732-807e-8008-c64d2fb91b9a`.

Two **new additive Penpot TokenSets** (not a replacement of imported Fluent tokens or existing 418 default/brand sets):

| Mode | Native TokenSet ID | Source focus | Inner gap |
| --- | --- | --- | --- |
| Light | `5d7c31da-9e95-80b3-8008-c899a1590197` | `#000000` | `{bluent.semantic.surface.default}` |
| Dark | `5d7c31da-9e95-80b3-8008-c899a1719fcf` | `#FFFFFF` | `{bluent.semantic.surface.default}` |

Each set contains **five actual native Penpot Color Tokens**, with matching names and *real* native aliases:
- `bluent.source.focusStroke2` = source color from the emitted real CSS,
- `bluent.semantic.focusRing.strongCandidate` = `{bluent.source.focusStroke2}`,
- `bluent.component.button.focusOuterCandidate` = `{bluent.semantic.focusRing.strongCandidate}`,
- `bluent.semantic.focusRing.gapCandidate` = `{bluent.semantic.surface.default}`,
- `bluent.component.button.focusGapCandidate` = `{bluent.semantic.focusRing.gapCandidate}`.

The Light and Dark candidate sets were added to **their existing respective** `Bluent v3 / Mode` themes:
- Light `07c521b9-e441-80bd-8008-c4ae76af65a5`
- Dark `07c521b9-e441-80bd-8008-c4ae76b15887`

These independent additions changed the Penpot library count from **38 → 40 sets**, and **195 → 205 tokens**. They do **not** change the 20 existing Brand×Mode experimental source sets or remove/override old `bluent.semantic.border.focus`.

## Actual editable native variant shapes bound

Binding was applied directly via `TokenColor.applyToShapes([...], ['strokeColor'])` to **12 actual editable vector properties**: outer stroke and contrast gap on **five Focus Visible variants** of the native `Appearance × Focus` family `535db143-a732-807e-8008-c64f10ae5f75`, plus the independent **Danger Focus Visible** native family `cd054205-a525-80d8-8008-c853b7ac86f0`. Focus Off variants and the original 25 Appearance×State family were left untouched. Outer vector stroke width remains **2px**, contrast gap **1px**, and both follow the corrected 3px/1px spacing from the actual Button face.

In the connected Penpot plugin, Light native token resolution was read back: source, semantic and component aliases resolved to **`#000000`**; gap resolved to **`#FFFFFF`**; and the actual outer/gap shapes reported their `tokens.strokeColor` bindings as `bluent.component.button.focusOuterCandidate` / `bluent.component.button.focusGapCandidate`, with rendered black outer stroke.

**Critical pending live readback:** The plugin successfully switched to Dark · Draft, but the browser immediately suspended the Penpot tab before the dark strokes were read back and **before Light · Draft was restored**. Do **not** claim Dark verification or restored theme. Once the correct Penpot tab is awake, run the repeatable audit below in Dark, then toggle the existing Light theme, allow its rendered values to settle and run the audit again. The source Dark token values and theme linkage were inspected, but visual resolution was *not* verified. Keep this outstanding in #501 until achieved.

## Repeatable read-only audit

The repo now contains `scripts/quality/penpot_v3_button_focus_token_binding_audit.js`: it checks the canonical file/page, two source-owned five-token sets, existing Light/Dark theme membership, genuine native variant counts, 12 tokenized strokes, correct rendered colors in the **currently active** mode and missing rings for Focus Off. It must execute **inside** the connected Penpot plugin, not with Node; `node --check` verifies syntax only.

On the same task branch, `.github/workflows/v3-button-focus-contract.yml` separately runs the 17/17 native real Blazor Chrome/Edge WASM keyboard probes. The GitHub job passed for the previous commit. This test **does not substitute** for visual/native Penpot theme-switching.

## Relationship to #418 and #428

The already-pushed #418 opt-in schema now uses `--colorStrokeFocus2` → `--bui-v3-focus-ring-strong-candidate` → `--bui-v3-button-focus-outer-candidate`; the real Blazor Styling Lab consumes the same candidate via a guarded opt-in attribute, and the CSS generator/demo asset synchronization is now checked by CI. The native Penpot gap alias is separately linked to the existing native surface token, not to a published CSS component alias.

Neither #418 nor #501 should move to Done without a real design acceptance, required real OS/accessibility verification and their approved, accepted integration into `bluent-v3`. No work touches `Dev` / stable 2.x or publishes NuGet.

## 2026-10-13 live Light/Dark verification after reconnection

**Former Dark readback blocker resolved:** The correct Penpot file reconnected and the already-active `Dark · Draft` theme was inspected live. **Six of six** enabled native appearances (five original + separate Danger) returned outer `#FFFFFF` and gap `#292929`, native outer/gap token bindings intact and 2px/1px stroke widths; computed result `pass=true`. Switched successfully to `Light · Draft`: all six variants returned `#000000` outer and `#FFFFFF` gap, same bindings, `pass=true`. Then ran a detailed native read-only contract audit in Light: **71/71 passed**, zero failures, **12 actual stroke bindings**, 40 real TokenSets and 205 native tokens.

**Separate later connection issue:** Another attempt to run the full 71-check audit in Dark toggled Dark successfully but the tab immediately froze. Therefore although **both modes' rendered values were already verified**, this last Dark-mode toggle has not yet been returned to default Light. On the next live Penpot connection, restore `Light · Draft` and check it remains active. Do not mistake this pending UI state restoration for a failure of the earlier verified Dark semantics.

These values remain candidate/nonproduction until design reviewer accepts their semantics and any remaining OS/AT accessibility evidence. The actual reusable read-only script remains `scripts/quality/penpot_v3_button_focus_token_binding_audit.js`. This follow-up supersedes only the earlier 'Dark unverified' paragraph; the originating diagnostic timeline remains for traceability.
