# #418 — Danger selected Button label contrast regression

**2026-10-14, maintainer reported.** Opt-in v3 Styling Lab candidate; not approved public Button CSS or stable NuGet.

## Root cause

The existing shared Button rule for .bui-button.danger.toggled selects colorPaletteRedBackground1 with colorNeutralForegroundOnBrand. The default Light CSS resolves those to #FDF6F6 and #FFFFFF, resulting in effectively unreadable text. Non-toggled Danger already has a readable redBackground3 / OnBrand combination.

## Scoped research fix

Within the v3 Styling Lab focus matrix only, the selected Button uses these existing emitted Fluent theme roles:

| State | Background | Text |
| --- | --- | --- |
| Toggled / not hovered | colorPaletteRedBackground1 | colorPaletteRedForeground2 |
| Toggled + Hover | colorPaletteRedBackground2 | colorPaletteRedForeground2 |
| Toggled + Pressed | colorPaletteRedBackground3 | colorNeutralForegroundOnBrand |
| Not toggled | existing Danger background3 | existing OnBrand |

No public Button SCSS was edited. Forced-colors uses system ButtonFace/ButtonText for the scoped selected demo state. The user's preferred branded focus ring and native TextField underline stay unchanged.

## Verified QA

- Source: 10 brands x Light/Dark x four Button states produce >=4.5:1 foreground/background text contrast with the tested Fluent token pairs. Source regression test also explicitly captures the original Light failure.
- Actual Chrome and Edge Blazor WebAssembly: **823/823 assertions passed on EACH browser** including 20 actual selected Danger theme-mode contrast checks, real on/off/on Blazor click state and actual Light/Dark mouse Hover/Pressed state checks.
- All v3 source tests 37/37 passed, and demo Debug build had 0 warnings/errors. The pointer test initially disrupted an unrelated keyboard Space test because of input modality; it was repositioned after that earlier keyboard assertion, not weakened.
- Pending design signoff: the Penpot connector was attached to the unrelated PuyaStudio Runner file, and attempted Figma Bluent v3 fallback returned Starter MCP call-limit. The new palette research change was NOT added to an authoritative design-tool artifact. Update the correct Bluent Penpot page 38 / foundations page 07 before claiming design acceptance or final v3 Button behavior.
- Separate #428 Backlog aria-pressed gap remains open; this is a visual readability fix, not a semantic accessibility feature.

Issue #418 remains In progress; PR #500 stays Draft against bluent-v3; no Dev/2.x/NuGet change.
## 2026-10-14 update: canonical Penpot visual parity unblocked

The correct canonical Bluent v3 Design System Penpot file (b64f6665-c9ab-80b5-8008-c4ac99d9d000) was subsequently reconnected. On page 07 Accessibility & RTL (07c521b9-e441-80bd-8008-c4b24ce6f58c), created an actual native EDITABLE research board named REVIEW · Danger toggled contrast across Light and Dark · #418, ID 94a03b1b-8cb6-8091-8008-c986fd01b85f. Board size 1510×825 with 60 real Penpot vector/text shapes. The earlier wrong-file/Figma-quota issue is **resolved for this design**.

Board contains eight emitted Fluent theme source color combinations (selected ON/OFF/Hover/Pressed in Light/Dark) with centered RTL Persian Button labels; ratios range from 4.93:1 to 10.09:1. A comparative BAD original Light state showing white text on very pale red remains visible at 1.07:1. The actual Penpot PNG was exported and visually reviewed.

A read-only LIVE Penpot native auditor checked 61/61 items: design identities, exact source colors, RTL text direction and centering in both axes, label bounds and PASS/FAIL contrast captions. **61/61 PASS, zero failures.** Reproduce with scripts/quality/penpot_v3_danger_toggle_contrast_audit.js inside the connected Penpot plugin. Node CI only checks script syntax, not live Penpot geometry.

This is the SOURCE-OWNED research design specimen and implementation parity review, NOT approval of public v3 Button state tokens. The CSS correction remains inside the v3 opt-in Styling Lab; stable v2 and NuGet untouched.
