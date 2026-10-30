# Bluent v3 Button — Fluent compatibility and implementation record

> **Status: implementation complete on the isolated #428 task branch; maintainer acceptance remains open.** The component is Fluent-aligned, not a one-to-one clone of a single Fluent component and not yet certified as full visual parity. This page records the pinned upstream comparison, intentional Bluent extensions, current implementation, and verification limits. It is not a released NuGet consumer contract.

## Reference baseline and method

This crosswalk uses the exact versions pinned by the separate Fluent parity audit:

- @fluentui/web-components 3.1.3
- @fluentui/react-components 9.74.10 as a related React API fallback, not a replacement for the Web Components contract.
- Referenced component family: fluent-button, fluent-toggle-button, fluent-compound-button, fluent-menu-button, and fluent-anchor-button.

These are separate Fluent interaction components. Bluent's single Button composes parts of those models while adding Bluent-specific conveniences. Similar names or appearances do not make the APIs interchangeable. The pinned release is a fixed comparison baseline, not a claim about every Fluent library or later release.

The 30-member matrix below is derived from current public Bluent declarations: 20 direct Button parameters, two public cascading properties, five inherited tooltip parameters, and three inherited common attributes. The private BluentButtonManagedMenuTrigger flag is internal implementation state, not public API. Generated Id is not a declared parameter: callers can supply id through AdditionalAttributes; otherwise Bluent generates one.

## Public API crosswalk

| Bluent member | Disposition | Fluent comparison | Contract / deliberate difference |
|---|---|---|---|
| Text | Supported | fluent-button default slot | Renders visible action content. |
| TextClass | Bluent extension | No per-text equivalent; Fluent exposes a content CSS part | Styles Bluent's inner text wrapper rather than the complete Fluent content part. |
| SecondaryText | Supported on related component | fluent-compound-button description slot | The counterpart is a separate CompoundButton, not a property of ordinary fluent-button. |
| Icon | Supported | Fluent Button start/end slots | Bluent uses its IconDefinition abstraction and paired Regular/Filled glyphs. Decorative Button-owned glyphs are hidden from the accessible name. |
| Toggled | Supported — boolean subset | fluent-toggle-button pressed | When non-null, Bluent exposes aria-pressed=false or true and keeps it synchronized with the bound state. Bluent's current bool? API has no Mixed/aria-pressed=mixed state. Null means ordinary Button semantics, not an unpressed toggle. |
| Rotated | Bluent extension | No matching pinned Button attribute | Applies Bluent's rotation class. |
| Orientation | Bluent extension | No matching pinned Button attribute | Adds Bluent's vertical-orientation treatment. |
| ToggledChanged | Blazor extension with equivalent state callback intent | Related to Fluent ToggleButton pressed state; no custom event is declared in the pinned CEM | A Blazor EventCallback<bool> paired with Toggled; not a Fluent custom DOM event. |
| OnClick | Supported interaction | Native DOM click | Blazor bridges native click to EventCallback; disabled paths do not invoke it. |
| Shape | Supported | fluent-button shape | Rounded, Circular and Square align with the pinned values. |
| Appearance | Supported with one extension | fluent-button appearance | Default maps to the component default (omit the attribute); Primary, Outline, Subtle and Transparent map to pinned values. Danger is a Bluent extension, not a pinned Fluent appearance. |
| Size | Supported | fluent-button size | Small, Medium and Large align with pinned values. |
| Href | Supported on related component | fluent-anchor-button href | Bluent renders an anchor for enabled non-empty Href; this is an AnchorButton mapping, not an attribute on fluent-button. |
| Badge | Bluent extension | No dedicated Badge slot on pinned Button tags | Bluent composes a positioned Badge inside Button. |
| BadgeHorizontalPosition | Bluent extension | No matching pinned Button attribute | Controls nested Badge horizontal placement. |
| BadgeVerticalPosition | Bluent extension | No matching pinned Button attribute | Controls nested Badge vertical placement. |
| Dropdown | Bluent extension / related composition | fluent-menu-button is a related interaction family | Bluent composes Popover and Surface content; it is not the same as a single fluent-button slot or an asserted one-to-one menu-button API. |
| ShowDropdownIndicator | Bluent extension | No matching pinned Button attribute | Controls Bluent-generated caret icons. |
| Compact | Bluent extension | No matching pinned Button attribute | Applies Bluent's compact density class. |
| DropdownPlacement | Bluent extension | Fluent menu positioning is a separate composition concern | Configures Bluent Popover placement. |
| ParentPopover | Blazor composition extension | No matching public Fluent Button property | Cascading Popover context used to register a trigger and coordinate its parent. |
| Overflow | Blazor composition extension | No matching public Fluent Button property | Cascading toolbar/overflow context used by Bluent layout composition. |
| Tooltip | Bluent extension | No equivalent property on pinned Button tags | Inherited Bluent TooltipService string content; not interchangeable with native title. |
| TooltipContent | Bluent extension | No equivalent tooltip-content slot on pinned Button tags | Inherited arbitrary Blazor RenderFragment content. |
| TooltipPlacement | Bluent extension | No matching Button attribute | Inherited Bluent Popover placement. |
| TooltipAppearance | Bluent extension | No matching Button attribute | Inherited Bluent Popover appearance. |
| DisplayTooltipArrow | Bluent extension | No matching Button attribute | Inherited Bluent tooltip arrow configuration. |
| AdditionalAttributes | Supported through Blazor attribute forwarding | Native HTML attributes on root element | Unmatched attributes, including caller aria-label, id and disabled, are forwarded subject to component-owned state rules. |
| Class | Supported through Bluent base | HTML class | Merged with Bluent component classes. |
| Style | Supported through Bluent base | HTML style | Applied to the root element with Bluent style-merge behavior. |

### Important behavioral decisions

**Toggle state.** Toggled=null is an ordinary button. Toggled=false/true is a two-state toggle and exposes the matching pressed state to the accessibility tree. The component owns aria-pressed while it owns a non-null toggle value; it does not synthesize tri-state behavior. This maps the supported boolean subset of Fluent ToggleButton without claiming Fluent's full mixed surface.

**Icon names.** Button-owned Regular and Filled icon glyphs, including dropdown indicators, are decorative and use aria-hidden=true. A text Button therefore exposes visible text as its accessible name without a private-use font glyph prefix. An icon-only Button still needs a meaningful contextual name from the caller, for example aria-label="Open settings"; Bluent must not guess an action name from an icon catalog key.

**Disabled navigation.** An enabled Href uses an anchor. A disabled link is rendered as a disabled native button so activation and keyboard navigation are actually suppressed. This is a deliberate disabled-state safety choice and differs from simply forwarding disabled to an anchor.

**Compound, menu and Badge composition.** SecondaryText, Dropdown, Badge and related positioning properties are Bluent compositions built on top of Button. They should be compared with Fluent's separate CompoundButton, MenuButton and Badge families rather than described as identical members of the basic Fluent Button API.

## Visual and token comparison

The project-owned Penpot file is **Bluent v3 Design System** (b64f6665-c9ab-80b5-8008-c4ac99d9d000). The editable pages that inform review are:

| Purpose | Penpot page / artifact |
|---|---|
| Upstream reference | Page 9, Fluent Button state reference (07c521b9-e441-80bd-8008-c4b57568c3ef) |
| Bluent appearance/state variants | Page 19, Bluent Button native variants (e31294c6-7c55-805f-8008-c58ffcf22e07) |
| Size and layout | Page 20, Bluent Button sizes and layout (e31294c6-7c55-805f-8008-c590b2678162) |
| API anatomy | Page 21, Button API anatomy (e31294c6-7c55-805f-8008-c5912770e8ab) |
| Equal-content reference fixture | Page 24, Button equal-content comparison (e31294c6-7c55-805f-8008-c5af6658c671), board e31294c6-7c55-805f-8008-c5afb988d983 |
| Persian and RTL | Page 25, Persian RTL Button (e31294c6-7c55-805f-8008-c5b0bae3546a) |
| Focus-visible design | Page 38, Button Focus Visible states (535db143-a732-807e-8008-c64d2fb91b9a), host-context board f4136a9a-101d-8004-8008-ca2956fe05f9 |

Page 24 is the fair equal-content comparison fixture: Fluent and Bluent specimens use the same Button text and corresponding icon, with aligned icon size, content gap and a 91×32 local specimen. Its Penpot canvas uses Inter for the local draft because Segoe UI is not available in the Penpot font library. **That is a design-canvas font limitation, not the production Button font.** The actual Bluent web theme resolves fontFamilyBase to the Segoe UI / Segoe UI Web / native system font stack. No product font override was added to compensate for Penpot's font catalogue.

The primary surface-color comparison is a documented brand-token difference, not an unexplained component CSS mismatch:

| Mode | Pinned Fluent Button | Bluent default theme | Source mapping |
|---|---:|---:|---|
| Light / LTR | #0F6CBD | #1267B4 | colorBrandBackground → Bluent brand key 80 |
| Dark / RTL | #115EA3 | #18599B | colorBrandBackground → Bluent brand key 70 |

Bluent's computed colors match its compiled default-theme token values. The editable Bluent brand/token pages still record draft design intent; changing the palette purely to copy Fluent would bypass the owning token decision (#418). Button therefore follows Fluent's interaction and design language while retaining Bluent's brand palette. Do not claim exact pixel/color parity.

The separate focus handoff in docs/v3/design/BUTTON-FOCUS-ALIGNMENT-REPAIR.md and source-owned page 38 govern the implemented 2px keyboard ring, split-button inset treatment and five host-context ring colors. The visual parity page 22 remains a review draft; its current exported comparison omits labels/headings and must not be treated as final sign-off.

## Verification record

| Check | Result and boundary |
|---|---|
| Public API preservation | Existing Button parameter names and enum members preserved; no new public Razor parameter or enum member added. |
| Button source/API baseline | 20 direct Button parameter names and current enum members; 0 findings. |
| Live Debug WASM Button focus/runtime probe | Chrome 215/215 on 2026-10-30 against shipped component CSS; earlier Edge run on the same branch: 215/215. |
| Published host runtime/ARIA/menu matrix | 208/208 across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (52 per combination; separate published-host run). |
| Native Windows Contrast Theme | Tested with Windows Accessibility → Contrast themes (Desert) applied to the live Button demo. The browser reported forced-colors: active; the focused Button retained a visible 2px outline and the system palette controlled its color. Contrast was returned to None afterwards and forced-colors was confirmed false. |
| Native UI Automation / Narrator session | Narrator was launched while the live page was inspected. The page exposed 154 buttons and no unnamed button in the inspected UIA tree; the explicit toggle pressed state changed false → true → false. This verifies browser/native UIA semantics, **not** the actual spoken Narrator announcement. |
| Focus handoff tests | 7/7 passed. |
| Documentation contract | 0 findings; focused docs contract suite passed. |
| Targeted Debug and Release WebAssembly demo builds | 0 warnings / 0 errors in the earlier validated builds. |
| Full solution Release build | Two existing NU1903 advisories for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 remain assigned to #425; they were not suppressed. |

Reproduce from the repository root:

~~~powershell
dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug -warnaserror
dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Release --no-restore -warnaserror
python scripts/quality/check_v3_button_api_baseline.py
python scripts/quality/check_v3_docs_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_button_focus_handoff.py' -v
python -m unittest discover -s scripts/quality -p 'test_v3_docs_contract.py' -v
node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080
node scripts/quality/probe_v3_button_toggle_interactive_server.mjs both
~~~

## Acceptance boundary

The implementation work and verified software tests are ready for maintainer review. Three things must remain distinguishable from engineering completion:

1. **Penpot visual sign-off:** the linked reference, equal-content fixture and focus board are editable review sources; this work did not make a maintainer's final visual approval or a complete pixel/zoom/viewport parity sign-off.
2. **Spoken assistive-technology sign-off:** a native Narrator session and UI Automation tree were inspected, but the spoken output was not recorded or independently listened to. Do not describe this as completed NVDA/Narrator acceptance.
3. **Merge/release:** PR #554 is ready for maintainer review and Issue #428 is in Review. This component is not accepted, merged or released. The isolated task branch does not authorize a merge into stable Dev, any 2.x branch, NuGet or a deployment.

The existing released Bluent 2.x Button reference remains authoritative for 2.x consumers.