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
| Design source | Owned Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000, page 38 / Button Focus Visible, host-context board f4136a9a-101d-8004-8008-ca2956fe05f9 |

## Implementation scope on this branch

The branch preserves the existing Button public parameter names and enum members; no new Razor parameter or public enum value is introduced by the work recorded here.

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
| Published Production menu/keyboard matrix | Chrome/Edge × InteractiveServer/InteractiveWebAssembly 208/208 (52 per combination; prior verified result) |

The fresh 214-check probe reads the actual bundled product stylesheet; it does not inject candidate focus CSS. It checks the 54 appearance/size/shape combinations, Light/Dark styles, five approved host contexts, split-button inset focus geometry, disabled focus suppression, keyboard focus, forced-colors browser emulation, toggle accessibility-tree state, Persian direction/name, RTL icon mirroring and 390px reflow.

## Known acceptance boundaries

- Native Windows Contrast Themes and named screen-reader testing have not been completed. Browser forced-colors emulation is not a substitute.
- Penpot's host-context design is approved, but this implementation still needs final human visual review against the native designs and screenshots at the agreed zoom/viewport matrix.
- The full-solution Release build currently encounters the two already-tracked NU1903 high-severity advisories for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 in the SSR demo (#425). The targeted Debug WebAssembly build is clean; the advisories have not been suppressed.
- PR #554 is Ready for review and GitHub Project #5 status for #428 is Review. This page does not claim component acceptance, merge, stable v3 API availability, or release readiness.

## Reproducible commands

From the repository root:

~~~powershell
dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug -warnaserror
python scripts/quality/check_v3_button_api_baseline.py
python scripts/quality/check_v3_docs_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_button_focus_handoff.py' -v
python -m unittest discover -s scripts/quality -p 'test_v3_docs_contract.py' -v
node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080
~~~

The browser command must target the live interactive WebAssembly demo. Do not run it against static SSR and describe that as InteractiveServer. The separate published-host probe is responsible for the Server matrix.
