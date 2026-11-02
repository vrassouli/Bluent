# Bluent v3 Button: simultaneous keyboard Focus, Hover, Pressed and Selected

> Research evidence for #418, #501 and implementation #428. Not a signed-off Fluent design or a stable library change. Branch: v3/issue-418-design-tokens.

## Real Blazor scenario

The opt-in V3StylingLab hosts Persian/RTL native Bluent Buttons for all six preexisting ButtonAppearance values (Default, Primary, Danger, Outline, Subtle, Transparent), plus separate six Toggled=true examples. The script scripts/quality/probe_v3_blazor_runtime.mjs sends browser input through CDP (rather than applying pseudo-classes in code).

| Combination | Verified behavior | Coverage |
| --- | --- | --- |
| Keyboard Focus on Rest | Real Tab shows focus-visible and >=2px outline; geometry stable | All six appearances |
| Keyboard Focus + Hover | Real mouse movement preserves keyboard ring; visible Fluent icon is measured and stays centered | All six appearances |
| Keyboard Focus + Pressed | Holding real Space reports :active while focus-visible persists; icon/face dimensions stable | All six appearances |
| Selected + Keyboard Focus | Toggled=true class and keyboard ring coexist; icon nonzero and contained | All six appearances |
| Selected + Hover + Keyboard Focus | Pointer movement retains selected and focus ring | Transparent representative |
| Selected activation | Real Space releases toggle-selected styling while preserving keyboard focus | Transparent representative |
| Forced Colors | Browser-emulated forced-colors retains >=2px keyboard ring | All six Rest/Focus appearances |
| Disabled and reverse traversal | Tab bypasses disabled; Shift+Tab returns to preceding control | Rest appearance row |

Visible icon is the non-hidden native Bluent .bui-icon (regular or active/filled, whichever displays), not merely the .icon node that may be display:none. CSS bounding-box checks do not prove painted glyph-ink centering.

## Confirmed accessibility defect — remains open

On Dev01 the actual DOM for all six Toggled=true Buttons exposed NO aria-pressed attribute. A selected-looking toggle therefore fails to announce its boolean toggle state through the standard native button pressed property. The real Space press changed its visual selection to false, but aria-pressed remained absent. The browser probe now reports this in observedUnfixedAccessibilityGaps rather than treating clean visual checks as a complete accessibility pass.

Source: src/Bluent.UI/Components/ButtonComponent/Button.razor adds attributes, classes and onclick, but does not add aria-pressed derived from the nullable Toggled property. Button.razor.cs exposes Toggled and ToggledChanged and implements their click handling.

Acceptance needed in #428:
1. For native toggle buttons with Toggled set, make aria-pressed reflect true/false (with initial render, keyboard activation, controlled ToggledChanged and re-render), and omit it for ordinary buttons with Toggled=null.
2. Define link Href and disabled behavior explicitly; don't blindly assign toggle-button semantics to an anchor.
3. Verify accessible name for icon-only and compound controls, real AT announcement, keyboard Space/Enter and combined Focus/Pressed/Selected with all appearances, sizes and RTL.
4. Update the headless test from reporting a known gap to asserting accessible pressed semantics only after the v3 implementation/contract is approved.

**Do not change the stable Button source, public API or NuGet from #418.** #428 implementation remains prerequisite-gated; #501 native Penpot focus rings/variants are not finally approved.

## Local verification

Dev01 2026-10-12: Chrome / Edge WebAssembly **278/278** each, InteractiveServer **281/281** each. Each summary reports one deliberate outstanding accessibility gap (missing aria-pressed), zero test failures. These are Chromium real-Blazor/CDP tests and forced-colors browser emulation; not actual OS high-contrast or assistive technology certification.
