# Bluent v3 Button — implementation record

> **Status: implementation on an isolated task branch; not merged or released.** This page records what the current #428 branch implements and what is actually verified. It is not a NuGet consumer contract. The existing [Bluent 2.x Button reference](../../components/button.md) remains authoritative for released packages.

## Identity

| Field | Value |
|---|---|
| Family | Button, including its existing split/dropdown composition |
| Issue / PR | [#428](https://github.com/vrassouli/Bluent/issues/428) / [#554](https://github.com/vrassouli/Bluent/pull/554) |
| Branch | v3/issue-428-button-p0 → bluent-v3 |
| Source | src/Bluent.UI/Components/ButtonComponent/ |
| Styles | src/Bluent.UI/Styles/Components/_button.scss and generated components.css |
| Demo | /components/buttons in the Debug WebAssembly demo |
| Design source | Owned Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000; pages 9, 19–25 and 38; equal-content comparison board e31294c6-7c55-805f-8008-c5afb988d983; focus host-context board f4136a9a-101d-8004-8008-ca2956fe05f9 |

## Implementation scope on this branch

The branch preserves the existing Button public parameter names and enum members; no new Razor parameter or public enum value is introduced by the work recorded here. The pinned Fluent comparison and the member-by-member disposition of all 30 public/inherited parameters and attributes are recorded in [Fluent 2 compatibility](../quality/FLUENT2-BUTTON-COMPATIBILITY.md). The crosswalk classifies 12 members as supported or supported on a related Fluent component (including the boolean Toggled subset) and 18 as deliberate Bluent extensions.

Implemented behavior includes:

- Native toggle state is reflected by aria-pressed only when Toggled has a value. The component-owned state wins over a conflicting caller attribute only in that case; caller state remains available when Toggled is null.
- Disabled links use native disabled-button semantics rather than an anchor with a non-functional disabled attribute. Disabled activation does not invoke OnClick or toggle callbacks.
- Button-managed dropdowns expose a stable popup relationship and synchronized expanded state. Menu semantics include named menu/menuitem roles, disabled-item skipping, roving focus, Arrow/Home/End/type-ahead, Enter/Space, Escape dismissal, focus restoration, Tab dismissal without a trap, and nested submenu direction handling.
- Button-owned decorative glyphs do not pollute accessible names. Icon-only controls still require an accessible name from the caller.
- Persian Button text uses content-driven dir="auto", while the outer layout continues to control icon mirroring.
- Keyboard focus is now rendered by the shipped component CSS using :focus-visible: a 2px outline with 2px offset on ordinary buttons, an inset 2px outline with -3px offset for split-button segments, and the OS Highlight system color under forced-colors: active.
- The selected focus color follows the approved Penpot host-context rule, not the Button appearance. Neutral surfaces use the brand foreground appropriate to Light/Dark; Brand, BrandHover and Danger surfaces use the on-brand foreground; Inverted uses on-brand in Light and brand foreground in Dark. Hosts that cannot be identified from the component must set the inherited CSS custom property --bui-button-focus-ring-color explicitly. This is a CSS host-context override, not a Razor API or a finalized global token.

## Demo and verification

The existing Button showcase exercises the current parameter surface and includes appearance/size/shape, toggle, explicit callback, split/dropdown, Badge, tooltip, Persian LTR/RTL and responsive examples. A new host-context section demonstrates Neutral, Brand, BrandHover, Danger and Inverted surfaces in Light and Dark.

| Validation | Actual result |
|---|---|
| Button source/API baseline | 20 parameter names and existing enum members preserved; 0 errors |
| v3 docs contract | 0 findings |
| Focus design handoff tests | 7/7 passed |
| Docs contract unit tests | 22/22 passed |
| Debug WebAssembly demo build | 0 warnings / 0 errors; CSS bundle regenerated |
| Live Chromium WebAssembly probe | Chrome 215/215 and Edge 215/215; 0 failures |
| Published Production menu/keyboard matrix | Chrome/Edge × InteractiveServer/InteractiveWebAssembly 208/208 (52 per combination; fresh Published Production run on 2026-10-30) |

The fresh 215-check Chrome probe reads the actual bundled product stylesheet; it does not inject candidate focus CSS. It checks the 54 appearance/size/shape combinations, Light/Dark styles, five approved host contexts, split-button inset focus geometry, disabled focus suppression, keyboard focus, forced-colors browser emulation, toggle accessibility-tree state, Persian direction/name, RTL icon mirroring and 390px reflow.

## Known acceptance boundaries

- Native Windows Contrast Themes were tested on the live demo with the Windows Desert contrast theme. The browser entered forced-colors: active, a focused Button retained its 2px outline, and the OS palette controlled its color. The Windows setting was restored to None and forced-colors returned to false.
- Narrator was launched and the browser UI Automation tree was inspected: 154 page buttons were named, and the Button toggle state changed false → true → false. Spoken Narrator output was not captured/listened to; native screen-reader speech acceptance is still open.
- The Penpot host-context focus treatment is approved, but the Button equal-content comparison and complete appearance/state review still need final maintainer visual sign-off against the editable Penpot designs and screenshots at the agreed zoom/viewport matrix. The export on page 22 omits comparison headings/labels, so it is not final sign-off evidence.
- The two existing NU1903 advisories for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 in the SSR demo remain assigned to #425. They have not been suppressed.
- PR #554 is Ready for review and GitHub Project #5 status for #428 is Review. This page does not claim component acceptance, merge, stable v3 API availability, or release readiness.

## Reproducible commands

From the repository root:

~~~powershell
dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug -warnaserror
python scripts/quality/check_v3_button_api_baseline.py
python -m unittest discover -s scripts/quality -p 'test_v3_button_fluent_compatibility.py' -v
python scripts/quality/check_v3_docs_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_button_focus_handoff.py' -v
python -m unittest discover -s scripts/quality -p 'test_v3_docs_contract.py' -v
node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080
node scripts/quality/probe_v3_button_toggle_interactive_server.mjs both  # 208/208 on 2026-10-30
~~~

The browser command must target the live interactive WebAssembly demo. Do not run it against static SSR and describe that as InteractiveServer. The separate published-host probe is responsible for the Server matrix.
