# Bluent v3 — Button Focus design-to-code handoff

Use this skill only when designing, implementing, reviewing or testing the **future** Bluent v3 Button Focus Visible behavior. This is not the 2.x consumer API. Keep every edit under a task branch targeting `bluent-v3`.

## Grounded sources and ownership

- Source-owned Penpot: **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Page **38 · Button Focus Visible states · #501**, `535db143-a732-807e-8008-c64d2fb91b9a`.
- Genuine native `Appearance × Focus` family `535db143-a732-807e-8008-c64f10ae5f75`: 5 appearances × `Off|Visible`, 10 variants; separate native `Danger × Focus` family `cd054205-a525-80d8-8008-c853b7ac86f0`: 2 variants.
- Page 19 original `Appearance × State` family has 25 variants, which must remain intact. Page 20 Size×Layout, page 25 Persian RTL, page 07 accessibility and page 35 Persian reflow are design sources, not copies to silently replace.
- User-reported alignment defects have been fixed directly in Penpot. Read `docs/v3/design/BUTTON-FOCUS-ALIGNMENT-REPAIR.md` before touching ring position or label geometry.

## Required design behavior

1. Ring follows `:focus-visible` (keyboard modality), NOT mere Hover, Pressed or Selected; Focus Off and Disabled must remain free of false rings.
2. Outer editable vector bounds exactly `face - 3px` on four sides, 2px stroke; contrast gap bounds exactly `face - 1px` on four sides, 1px stroke. Center the text box vertically in the actual face; never use the larger specimen wrapper as ring anchor.
3. Split buttons have two separate real native focus targets and **inset** rings to avoid obscuring a sibling; verify RTL Main and Menu independently.
4. Forced colors uses the OS `Highlight` role with a real visible outline; do not count box-shadow as accessible ring in forced colors.
5. Cover six public `ButtonAppearance` values (Default, Primary, Danger, Outline, Subtle, Transparent), Small/Medium/Large, shapes, icon-only, compound, Selected+Focused, RTL Persian and high contrast.

## Bridge and implementation boundary

- **#418** owns the proposed source `--colorStrokeFocus2` → opt-in semantic `--bui-v3-focus-ring-strong-candidate` → Button `--bui-v3-button-focus-outer-candidate`. These are **not approved** public aliases and existing `--bui-v3-border-focus` cannot be removed.
- **#501** owns the editable Penpot native design/focus interactions and validation.
- **#428** owns final Blazor component CSS/API, exhaustive Button demos, `aria-pressed` for Toggled, migration docs, and true cross-render-mode browser verification. Before starting or continuing that issue, check the live Status field in GitHub Project #5 and obey `AGENTS.md` lifecycle (Backlog → Ready → In progress → Review → Done); this skill is not a status source of truth. Production visual/token integration remains gated by #418 review and #428 acceptance criteria. Never ship experimental demo CSS as production styling.
- #418's demo research uses `outline:2px`, `outline-offset:1px`, `box-shadow:0 0 0 1px`, and **relative z-index** on focused button to avoid bottom-stroke overpaint. This is a geometric parity *proposal*, not signed-off production CSS.

## Tests and acceptance boundaries

- Live Penpot geometry audits (requires correct connected file and plugin): `penpot_v3_button_focus_alignment_audit.js` **469/469** and `penpot_v3_button_focus_special_audit.js` **105/105**; source typography audit **215/215**. These ran successfully in the connected plugin on 2026-10-13.
- Source-level contract `python -m unittest discover -s scripts/quality -p test_v3_button_focus_handoff.py -v` is **not a Penpot validation substitute**.
- Real existing Blazor WebAssembly Button/API probe: launch the Debug demo with `ASPNETCORE_URLS=http://127.0.0.1:5080 dotnet run --project src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug --no-build --no-launch-profile`, then run `node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080`. The expanded probe passed 211/211 in Chrome and Edge on 2026-10-27, including stable names after the Button decorative-icon fix, all twelve TooltipPlacement cases, all 54 Appearance × Size × Shape class mappings, Light/Dark computed styles, Persian RTL text direction/accessibility name, icon/Badge mirroring in LTR/RTL, responsive coverage, and exactly-once direct `ToggledChanged` callbacks for pointer and Space; it adds temporary focus research CSS only inside the disposable browser tab and uses browser-emulated forced colors. This is WebAssembly evidence, not published InteractiveServer, native Windows Contrast Themes or assistive-technology acceptance. Do not run it against Static SSR and call that InteractiveServer.
- For a real v3 implementation, run the larger #418 browser/contrast matrix in WASM and **published InteractiveServer**, and obtain native OS high contrast/AT and actual browser UI zoom evidence. Test with screenshots too—computed outline geometry alone missed a lower ring being covered by a following row.
- Do not mark #501 Done before design review/approval and accepted PR integration into `bluent-v3`. Never touch stable `Dev` or publish a NuGet release just to satisfy a prototype test.

## Native token binding follow-up

The source-owned Penpot file now has two additive draft Focus candidate TokenSets, and twelve real outer/gap stroke bindings on the five enabled Appearance×Focus variants plus Danger. Read [the token-bridge audit](../../../docs/v3/design/BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md); verify Dark and restore Light in the connected plugin before claiming the theme-switch gate is done. Draft names are **not approved** production CSS or component API.

## Latest live verification (2026-10-13)

Read [native token bridge update](../../../docs/v3/design/BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md). Both Dark and Light were verified as **real rendered native stroke values** on 6 enabled variants. A separate Light read-only run passed **71/71**, 12 linked strokes, 40 TokenSets/205 tokens. A later repeat Dark toggle froze the browser; **restore Light once Penpot reconnects**. Earlier notes calling Dark unverified are historical, not the current tested conclusion. These remain **not approved** public v3 tokens.

### Final recovery addendum

2026-10-13 final UI-state recovery: after the later Dark toggle suspended the plugin, the correct Penpot file connected again and the existing Light · Draft Mode theme was explicitly toggled active. The tool returned activeModes: [Light · Draft] and the exact Bluent v3 Design System file ID b64f6665-c9ab-80b5-8008-c4ac99d9d000. Thus **the final default-Light restoration is now confirmed**. The earlier separate real six-variant Light and Dark readbacks and 71/71 Light audit remain the recorded actual stroke evidence; the last restore call verified the active theme, not a new screenshot or repeat of the 71-check suite. Public token signoff and native screen-reader/OS conformance remain open.

## 2026-10-13 maintainer-selected visual direction (supersedes black/white Focus2 default)

The maintainer tested actual Styling Lab and explicitly prefers **existing brand-colored Button :focus-visible**, while rejecting a second rectangular ring on TextField: use its **animated 2px bottom underline** alone. The editable Penpot source-owned decision board on #501 page 38 has ID `94a03b1b-8cb6-8091-8008-c8b9bae47e45`. It includes real Light/Dark Button/Field vector specimens and an actual token-bound brand Light outline. See [new brand/field design evidence](../../../docs/v3/design/BUTTON-FOCUS-BRAND-REVIEW.md) and [read-only board audit](../../../scripts/quality/penpot_v3_button_brand_review_audit.js). Black/white/double Focus2 native prototype families are **kept for comparison only** and are *not* the selected default; their historical validation notes remain useful research but do not override the maintainer's preference. The earlier unconditional branded ring failed on some Dark/same-hue host contexts; the approved host-aware design below addresses the five documented host classes, while final public token/CSS integration, other host types, native OS contrast and assistive-technology acceptance remain open.

**Danger selected-state readability:** docs/v3/design/BUTTON-DANGER-SELECTED-REVIEW-HANDOFF.md records canonical editable Penpot page07 board 94a03b1b-8cb6-8091-8008-c986fd01b85f (61/61 native audit) and #418 task opt-in package stylesheet data-bui-v3-danger-toggle (Chrome/Edge 843/843; CI 6/6). Keyboard Focus Visible remains orthogonal to Selected and no global Button API is approved. The current #428 status must be read from GitHub Project #5; full production acceptance remains gated by #418/#428.

**2026-10-14 additional real Penpot board:** page-38 Danger Selected x Focus review board 6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa was created as 51 native editable shapes and actually audited 77/77 PASS in the connected canonical Penpot, exported PNG visually inspected. Independent selected/focus cases are demonstrated in Light/Dark. Source audit: scripts/quality/penpot_v3_button_danger_selected_audit.js. The earlier suspended-tab audit blocker is resolved, but public Button approval is not granted.

2026-10-14 live editable Penpot #501 context study: correct Bluent v3 file/page38 board f4136a9a-101d-8004-8008-ca2956fe05f9, 85 editable child shapes, 10 Light/Dark x Neutral/Brand/BrandHover/Danger/Inverted specimens; PNG actually exported/inspected; scripts/quality/penpot_v3_button_host_context_audit.js executed in live Penpot PASS 78/78 native identity/stroke/contrast/caption checks. Actual emitted theme source #418 independently checked 100 brand/mode/host combinations for contextual mapping PASS 100/100, minimum 3.103. The selected single BRAND Button ring remains on neutral surfaces; TextField underline only. Inverse/fallback on colored/inverted hosts is a RESEARCH PROPOSAL, NOT publicly approved token/component API. See docs/v3/design/BUTTON-FOCUS-HOST-CONTEXT-NATIVE-REVIEW.md. Do not claim full accessibility/native OS/AT/real zoom or mark Done until explicit design approval and integration criteria.

2026-10-14 explicit maintainer design approval: page38 Penpot context board f4136a9a-101d-8004-8008-ca2956fe05f9 now marked APPROVED DESIGN. Selected rule: BRAND single Button focus ring on Neutral; inverse OnBrand ring on Brand / BrandHover / Danger; Light Inverted inverse / Dark Inverted brandedForeground2; original animated TextField bottom underline only, no extra rectangular focus ring. New read-only native audit checks board approval and 10 concrete examples. This approval resolves the VISUAL host-dependent treatment decision; it does NOT by itself certify OS Contrast Themes, AT, all nested/transparent/gradient hosts or final production #428 implementation. Review docs/v3/design/BUTTON-FOCUS-HOST-CONTEXT-NATIVE-REVIEW.md.
