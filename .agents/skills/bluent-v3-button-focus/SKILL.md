# Bluent v3 — Button Focus design-to-code handoff

Use this Skill only when designing, implementing, reviewing or testing the **future** Bluent v3 Button Focus Visible behavior. It is not the 2.x consumer API. Keep every v3 edit under a task branch targeting bluent-v3.

## Grounded sources and ownership

- Source-owned Penpot: **Bluent v3 Design System**, file b64f6665-c9ab-80b5-8008-c4ac99d9d000.
- Page **38 · Button Focus Visible states · #501**, 535db143-a732-807e-8008-c64d2fb91b9a.
- Native Appearance × Focus family 535db143-a732-807e-8008-c64f10ae5f75: five appearances × Off|Visible, ten variants; separate Danger × Focus family cd054205-a525-80d8-8008-c853b7ac86f0: two variants.
- Page 19 Appearance × State has 25 variants and must remain intact. Page 20 Size×Layout, page 25 Persian RTL, page 07 accessibility and page 35 Persian reflow are design sources, not copies to replace.
- Approved host-context board: page-38 board f4136a9a-101d-8004-8008-ca2956fe05f9 (85 editable child shapes; live audit 78/78). Alignment details are in docs/v3/design/BUTTON-FOCUS-ALIGNMENT-REPAIR.md.

## Approved visual behavior

1. Ring follows :focus-visible (keyboard modality), not Hover, Pressed or Selected. Disabled controls do not receive a focus ring.
2. Ordinary Button: 2px outline, 2px offset. The Penpot outer editable vector bounds are face - 3px with 2px stroke and contrast gap bounds face - 1px with 1px stroke. Center the text box in the actual face, not the specimen wrapper.
3. Split buttons have two distinct native focus targets and inset rings so one action does not obscure its sibling. Verify Main and Menu in LTR and RTL.
4. Forced colors use the OS Highlight system color and a real outline; box-shadow is not a substitute.
5. Cover all six public ButtonAppearance values (Default, Primary, Danger, Outline, Subtle, Transparent), Small/Medium/Large, shapes, icon-only, compound, Selected+Focused, Persian RTL and high contrast.
6. The selected context mapping is explicit: Neutral uses brand background in Light and brand foreground in Dark; Brand, BrandHover and Danger use on-brand foreground; Inverted uses on-brand foreground in Light and brand foreground in Dark. TextField keeps its animated bottom underline only; do not add a rectangular ring to it.

## Implementation status on #428

The implementation is on v3/issue-428-button-p0 and remains in Draft PR #554 targeting bluent-v3 only.

- The actual production component stylesheet now renders :focus-visible. Ordinary buttons use a 2px outline with 2px offset; split segments use a 2px outline with -3px offset and relative stacking; forced-colors uses Highlight.
- A host surface that needs an inverse ring explicitly inherits the CSS custom property --bui-button-focus-ring-color. This is a host-context CSS override, **not** a new Razor parameter, a public global token or a finalized #418 token alias. Do not guess a host type from the Button appearance.
- The Button showcase demonstrates Neutral, Brand, BrandHover, Danger and Inverted hosts in Light and Dark.
- The live browser test reads the actual bundled production stylesheet. It no longer injects candidate CSS into the test browser.

See the branch-only implementation and verification record at docs/v3/components/button.md and the full component issue #428.

## Bridge and API boundary

- #418 owns the global/semantic/component token schema and final brand/theme token acceptance. Candidate token names in #418 are not approved public aliases; do not silently promote them.
- #501 owns editable Penpot focus design and review. The imported Microsoft Fluent 2 Community library remains read-only.
- #428 owns Button runtime CSS/API, exhaustive demo, Toggled aria-pressed, migration evidence and cross-render-mode checks.
- No new public Razor parameter or enum member is introduced by the host-focus implementation. Existing Button parameter names and enum values remain intact.
- Check the live Status field in GitHub Project #5 and follow Backlog → Ready → In progress → Review → Done. This Skill is not a status source of truth. Do not mark #428 Done until the full issue acceptance criteria are met and its PR is accepted/merged into bluent-v3. Never merge to stable Dev, main or release branches as part of this task.

## Verification evidence

- Penpot: native alignment audit 469/469 and special-state audit 105/105; source typography audit 215/215. Historical live plugin runs are recorded on 2026-10-13.
- Native host-context design audit: 78/78 on the actual source-owned Penpot board; the selected treatment was explicitly approved on 2026-10-14.
- Source-level handoff tests: python -m unittest discover -s scripts/quality -p test_v3_button_focus_handoff.py -v. Current run: 7/7.
- Debug WASM build: dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug -warnaserror. Current run: 0 warnings / 0 errors; bundle regeneration included.
- Live Debug Interactive WebAssembly browser probe: run node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080 against the live demo. Current run on 2026-10-30: Chrome 215/215 and Edge 215/215, no failures. Checks include actual bundled CSS, five host contexts in Light/Dark, split inset geometry, keyboard behavior, browser-emulated forced-colors, 54 Appearance×Size×Shape combinations, responsive 390px Persian RTL, icon/Badge mirroring and toggle accessibility-tree state.
- Separate published Production menu/keyboard matrix: node scripts/quality/probe_v3_button_toggle_interactive_server.mjs both. Previously verified 208/208 across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (52 per combination), with a real Server SignalR handshake.
- Latest v3 docs contract: 0 findings; Button API baseline: 0 errors; docs-contract unit tests: 22/22.

## Acceptance boundaries — do not overstate

- Browser forced-colors emulation is not native Windows Contrast Themes.
- Named screen-reader acceptance (NVDA, Narrator or VoiceOver) has not been completed.
- The current production CSS implementation still needs final maintainer visual review against Penpot and screenshot evidence across agreed zoom/viewports, including edge cases outside the five approved host classes.
- The full-solution Release build currently reports two high-severity NU1903 advisories for Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 in the SSR demo; #425 owns that dependency update. Do not suppress these warnings. The focused Debug WebAssembly build is clean.
- PR #554 remains Draft and #428 remains In progress. The component is not accepted, merged or released; stable Bluent 2.x remains unchanged.

## Historical design record

The source-owned Penpot file has two additive draft Focus candidate TokenSets and twelve real outer/gap stroke bindings on the five enabled Appearance×Focus variants plus Danger. Read docs/v3/design/BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md for provenance. These draft token names are not public production CSS/API.

The maintainer prefers an existing brand-colored Button focus ring and rejects a second rectangular ring on TextField. The approved context mapping supersedes the earlier unconditional black/white Focus2 experiments. Historical audits are evidence for their stated scope only; they do not certify native OS contrast, assistive technology, all host types or full Fluent parity.
