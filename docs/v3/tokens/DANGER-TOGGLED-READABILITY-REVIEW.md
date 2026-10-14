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
