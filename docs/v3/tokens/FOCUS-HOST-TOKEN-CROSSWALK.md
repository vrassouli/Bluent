# #418 - Approved Focus host-role mapping in the opt-in token bridge

**Visual rule accepted by maintainer on 2026-10-14.** Source-owned Penpot: Bluent v3 Design System, page 38, APPROVED DESIGN board f4136a9a-101d-8004-8008-ca2956fe05f9. The **CSS custom-property name and consumer contract remain provisional** for #418 and #428; no stable 2.x or released Button API changes.

## Explicit host × mode mapping

| Surrounding host | Light focus source | Dark focus source |
| --- | --- | --- |
| Neutral | --colorBrandBackground | --colorBrandForeground2 |
| Brand | --colorNeutralForegroundOnBrand | --colorNeutralForegroundOnBrand |
| BrandHover | --colorNeutralForegroundOnBrand | --colorNeutralForegroundOnBrand |
| Danger | --colorNeutralForegroundOnBrand | --colorNeutralForegroundOnBrand |
| Inverted | --colorNeutralForegroundOnBrand | --colorBrandForeground2 |

The surrounding host backgrounds correspond respectively to --colorNeutralBackground1, --colorBrandBackground, --colorBrandBackgroundHover, --colorPaletteRedBackground3 and --colorNeutralBackgroundInverted. Contrast is measured against the **OUTER host**, not the Button face. The opt-in generator rejects less than 3:1 against any of **10 actual emitted brands × Light/Dark × 5 opaque source hosts = 100** tested combinations.

## Generated, explicit-only preview

The source schema in [issue-418-token-schema.preview.json](issue-418-token-schema.preview.json) now records the approved focusHostPreview mapping and Penpot board ID. [generate_v3_token_preview.py](../../../scripts/quality/generate_v3_token_preview.py) emits the extra host-scoped CSS to [issue-418-opt-in.preview.css](issue-418-opt-in.preview.css), with provisional property **--bui-v3-focus-host-ring-candidate**. This is still a **candidate token name**, not final public CSS.

For a host to acquire that variable: opt in via a data-bui-v3-tokens root/ancestor, and put **data-bui-theme="light" or "dark" plus data-bui-v3-focus-host="neutral", "brand", "brandHover", "danger" or "inverted" on the SAME host element**. Never infer a focus color from Button Appearance, its own fill or underlying pixels. Co-located explicit mode avoids leaking an outer Light host selector into a nested Dark host. Outside the opt-in scope there is **no** such custom property. Under CSS forced-colors: active the variable uses system Highlight.

This CSS does **not** set outline-color, does not target .bui-button, does not mutate legacy --color* roles, does not touch v2 bundles and is not a finalized public Button API. The generated demo-only asset comes from sync_v3_token_demo_asset.py and is consumed only by the isolated v3 Styling Lab.

## Verification and QA boundaries

Run:

    python scripts/quality/generate_v3_token_preview.py --check
    python scripts/quality/test_v3_approved_focus_host_token_bridge.py -v

Five tests require exact source-owned design identity, schema/CSS regeneration parity, 100 source-color contrast cases, forced-colors system fallback, and rejection of intentionally tampered Dark Inverted mapping or unapproved token/attribute names. The actual Blazor Chrome/Edge Browser Lab now temporarily sets explicit role/mode attributes on **five mounted host cards** in each of the **20 brand×mode contexts**, measures computed focus token color versus real host background, verifies >3:1 and correct Fluent source and checks an external non-opted-in element for leakage, then restores DOM without changing public product CSS. The new CI result must be verified before claiming actual browser success.

Native Windows Contrast Themes/screen readers, user browser zoom, gradients, images, nested portal/semantic ownership and final public CSS/component API still require separate review; numeric token tests are not universal WCAG conformance.

### Four-state browser media fallback regression

The independent real-Blazor WebAssembly forced-colors browser probe now also checks the newly generated host alias on the mounted **Danger host** in all 10 brands x Light/Dark x four independent CSS media combinations = **80 additional browser assertions per browser**. It explicitly tests system Highlight during forced-colors-only and forced+reduced-motion, and OnBrand during normal/reduced-only, while restoring explicit theme/host attributes after each case. The Chrome/Edge WASM CI must pass on the new commit; no claim about real native Windows Contrast Themes or AT is inferred from CDP media emulation.

## 2026-10-15 — Actual Blazor Styling Lab consumes the generated alias

The five real mounted Blazor Button cards now declaratively annotate their surrounding host containers with matching data-bui-theme (bound to the Blazor Light/Dark state) and data-bui-v3-focus-host (the exact named host kind in the reviewed Penpot matrix). The surrounding Styling Lab is the data-bui-v3-tokens opt-in root. The Razor-scoped CSS no longer reproduces the Brand/Danger/Inverted per-mode ring color switch: the approved mode uses **--v3-lab-focus: var(--bui-v3-focus-host-ring-candidate)** as the single bridge from generated tokens. The historical unconditional brand ring remains available for explicit comparison, not as default. No public Button CSS selector or API changed.

The new CDP Browser Lab asserts **actual Razor-owned host role/mode** and **painted keyboard-focused Button outline** against the inherited 10-brand source palettes across both Light/Dark themes (five actual cards each), in addition to the outside non-opted-in leak sentinel. During automated brand/theme sweeps the test synchronizes card theme attributes explicitly because the test changes the DOM root mode directly without Blazor state rendering; this is test scaffolding only. The independent forced-colors WASM probe separately validates system Highlight across four emulated media modes. Six Python contract tests include static real Razor/CSS parity to prevent accidental reintroduction of hardcoded source roles. New browser results must pass on the latest CI before being claimed successful.
