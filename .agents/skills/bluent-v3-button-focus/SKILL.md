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
- **#428** owns final Blazor component CSS/API, exhaustive Button demos, `aria-pressed` for Toggled, migration docs, and true cross-render-mode browser verification. #428 remains Backlog until moved Ready using project workflow. Never ship experimental demo CSS as production styling.
- #418's demo research uses `outline:2px`, `outline-offset:1px`, `box-shadow:0 0 0 1px`, and **relative z-index** on focused button to avoid bottom-stroke overpaint. This is a geometric parity *proposal*, not signed-off production CSS.

## Tests and acceptance boundaries

- Live Penpot geometry audits (requires correct connected file and plugin): `penpot_v3_button_focus_alignment_audit.js` **469/469** and `penpot_v3_button_focus_special_audit.js` **105/105**; source typography audit **215/215**. These ran successfully in the connected plugin on 2026-10-13.
- Source-level contract `python -m unittest discover -s scripts/quality -p test_v3_button_focus_handoff.py -v` is **not a Penpot validation substitute**.
- Real existing Blazor WebAssembly keyboard probe: run `node scripts/quality/probe_v3_button_focus_runtime.mjs http://127.0.0.1:5080` while `Bluent.UI.Demo` is running on that URL; expect 17/17 in Chrome and Edge. Do not run it against Static SSR and call that InteractiveServer.
- For a real v3 implementation, run the larger #418 browser/contrast matrix in WASM and **published InteractiveServer**, and obtain native OS high contrast/AT and actual browser UI zoom evidence. Test with screenshots too—computed outline geometry alone missed a lower ring being covered by a following row.
- Do not mark #501 Done before design review/approval and accepted PR integration into `bluent-v3`. Never touch stable `Dev` or publish a NuGet release just to satisfy a prototype test.

## Native token binding follow-up

The source-owned Penpot file now has two additive draft Focus candidate TokenSets, and twelve real outer/gap stroke bindings on the five enabled Appearance×Focus variants plus Danger. Read [the token-bridge audit](../../../docs/v3/design/BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md); verify Dark and restore Light in the connected plugin before claiming the theme-switch gate is done. Draft names are **not approved** production CSS or component API.

## Latest live verification (2026-10-13)

Read [native token bridge update](../../../docs/v3/design/BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md). Both Dark and Light were verified as **real rendered native stroke values** on 6 enabled variants. A separate Light read-only run passed **71/71**, 12 linked strokes, 40 TokenSets/205 tokens. A later repeat Dark toggle froze the browser; **restore Light once Penpot reconnects**. Earlier notes calling Dark unverified are historical, not the current tested conclusion. These remain **not approved** public v3 tokens.

### Final recovery addendum

2026-10-13 final UI-state recovery: after the later Dark toggle suspended the plugin, the correct Penpot file connected again and the existing Light · Draft Mode theme was explicitly toggled active. The tool returned activeModes: [Light · Draft] and the exact Bluent v3 Design System file ID b64f6665-c9ab-80b5-8008-c4ac99d9d000. Thus **the final default-Light restoration is now confirmed**. The earlier separate real six-variant Light and Dark readbacks and 71/71 Light audit remain the recorded actual stroke evidence; the last restore call verified the active theme, not a new screenshot or repeat of the 71-check suite. Public token signoff and native screen-reader/OS conformance remain open.

## 2026-10-13 maintainer-selected visual direction (supersedes black/white Focus2 default)

The maintainer tested actual Styling Lab and explicitly prefers **existing brand-colored Button :focus-visible**, while rejecting a second rectangular ring on TextField: use its **animated 2px bottom underline** alone. The editable Penpot source-owned decision board on #501 page 38 has ID `94a03b1b-8cb6-8091-8008-c8b9bae47e45`. It includes real Light/Dark Button/Field vector specimens and an actual token-bound brand Light outline. See [new brand/field design evidence](../../../docs/v3/design/BUTTON-FOCUS-BRAND-REVIEW.md) and [read-only board audit](../../../scripts/quality/penpot_v3_button_brand_review_audit.js). Black/white/double Focus2 native prototype families are **kept for comparison only** and are *not* the selected default; their historical validation notes remain useful research but do not override the maintainer's preference. Existing brand Dark contrast still needs an accessible design solution before release.