# #418 — Packaged opt-in Danger toggle palette for v3

Date: 2026-10-14. Task branch only; no stable NuGet publication or Dev/v2 changes.

## Design and defect
In Light, the inherited Danger.Toggled Button style pairs a pale red background (#FDF6F6) with white text (#FFFFFF), only 1.07:1. The canonical Bluent v3 Design System Penpot file, page 07 Accessibility & RTL, board 94a03b1b-8cb6-8091-8008-c986fd01b85f, shows eight editable Light/Dark states and the original broken combination. Live Penpot audit 61/61 passed; board PNG was visually inspected. Ten emitted brand themes x Light/Dark x four states pass 4.5:1 with the proposed existing Fluent source palette.

## Scoped library asset

The CSS now lives in the ACTUAL v3 task-branch Bluent.UI static web assets:
src/Bluent.UI/wwwroot/v3/danger-toggle.opt-in.preview.css

The opt-in stylesheet must be loaded after the standard Bluent components CSS:

    <link rel="stylesheet" href="_content/Bluent.UI/v3/danger-toggle.opt-in.preview.css">

Opt in on a containing element only:

    <section data-bui-v3-danger-toggle>
       <!-- Render real Bluent Buttons with Danger Appearance and Toggled state here -->
    </section>

The CSS selectors are all prefixed by the attribute data-bui-v3-danger-toggle. They touch only its descendant selected Danger Buttons. The standard Button _button.scss, other component appearances, non-selected Danger state, and TextField bottom-underline remain unchanged. This is deliberately NOT the default v3 Button style or approved public component API.

State mapping uses existing Fluent tokens:
- Toggled rest: colorPaletteRedBackground1 + colorPaletteRedForeground2
- Toggled Hover: colorPaletteRedBackground2 + colorPaletteRedForeground2
- Toggled Pressed: colorPaletteRedBackground3 + colorNeutralForegroundOnBrand
- Not toggled: existing Danger redBackground3 + white OnBrand
- Forced-colors: system ButtonFace / ButtonText / ButtonText border

The actual Styling Lab now loads this Bluent.UI asset from the _content/Bluent.UI route, and scopes the opt-in attribute to its focus-matrix section. The prior duplicate CSS in V3StylingLab.razor.css was deleted. Real local HTTP requests confirmed both the Styling Lab and CSS static web asset return 200. Removing the attribute restores legacy behavior without re-mounting the Button.

## Testing and package boundary

Local Chromium-based real Blazor WebAssembly tests: Chrome 843/843 and Edge 843/843 passed, including twenty brand/mode tests confirming actual stylesheet load and no leakage outside the attribute scope, on top of existing user interaction/hover/press/keyboard checks.

NuGet local-only pack of Bluent.UI.1.0.0.nupkg was inspected by scripts/quality/check_v3_nuget_boundary.py: PASS, includes the new reviewed v3 CSS plus the already approved Dialog JS, all ten old theme assets, no unexpected v3 files. No package was uploaded or published. Package checker still rejects demo-only token CSS and unknown v3 scripts/styles; a missing reviewed CSS file is also an explicit regression failure. Generated wwwroot CSS needed explicit Git staging because the existing .gitignore ignores generic wwwroot CSS.

Original public Button CSS still has the unfixed state until a distinct v3 Button implementation issue is approved. #428 Button rewrite remains Backlog; #501 is design Review. This opt-in preview addresses #418 foundation research only. Full native Windows accessibility/AT acceptance and universal Button palette approval are NOT implied by source/browser/package checks.
