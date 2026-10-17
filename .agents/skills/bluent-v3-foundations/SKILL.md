# Bluent v3 foundation: focus indicator host-contrast QA

Use this skill while designing v3 Fluent 2 focus-visible tokens and controls under Epic #416 / #418. Read AGENTS.md and docs/v3/ISSUE-WORKFLOW.md first. **Never edit stable Dev/v2 or ship NuGet.** Penpot canonical design file: Bluent v3 Design System, page 07 Accessibility & RTL.

## Reviewed facts and non-waivable boundaries

- Maintainer prefers brand-colored single-ring keyboard focus on Button, not neutral Focus2 as default. TextField uses its own animated 2px bottom underline, **no extra rectangular ring**.
- Browser-specific v3 research ring: outline 2px, outline-offset 2px. Judge contrast primarily against the OUTER SURROUNDING HOST; measuring only against the Button's own Primary/Danger fill is misleading because the outline sits outside the face.
- Research source normal/hover neutral host candidate: Light colorBrandBackground, Dark colorBrandForeground2. This is not an approved published token rule.
- Crucial counterexample: the same brand-color ring is too similar to brand-filled / danger-filled PARENT HOSTS. Existing colorNeutralForegroundOnBrand contrasts well on those hosts but fails on Dark inverted white hosts. An unconditional switch to white or an unconditional colored ring is **not a universal solution**.
- Evidence: docs/v3/tokens/FOCUS-HOST-CONTEXT-REVIEW.md. Reproducible 100-case source audit: python scripts/quality/audit_v3_focus_host_surface_matrix.py; seven contract tests: python -m unittest discover -s scripts/quality -p test_v3_focus_host_surface_matrix.py -v. Real-browser matrix: node scripts/quality/probe_v3_blazor_runtime.mjs on configured Dev01; observed 753/753 on Chrome WASM.
- Actual Penpot editable boards: filled host research 94a03b1b-8cb6-8091-8008-c96c96ea484f and inverse context 94a03b1b-8cb6-8091-8008-c96d09329a0b. Recheck geometry with scripts/quality/penpot_v3_focus_context_hosts_audit.js in a live connected Penpot plugin. Source-owned shape geometry: 3px symmetric vector ring around Button face with 2px stroke (CSS equivalent outline 2px + offset 2px).
- No public focus semantics, new component props, universal accessible styling, real Windows Contrast Themes, native browser zoom or assistive tech sign-off has been authorized by these local tests. Do not mark #418 Done without approved design/API and actual acceptance evidence.

**2026-10-14 connected Penpot acceptance evidence:** after an earlier suspended-tab attempt, the combined read-only editable-board test was actually run in the correct Bluent v3 Penpot file and PASSED **40/40**, zero failures. Design artifact integrity is proven for these six examples only; actual app/OS/AT/contrast contexts beyond the test inventory still need review.

**Five-host interactive Blazor research:** see docs/v3/tokens/CONTEXTUAL-BRANDED-FOCUS-LIVE-REVIEW.md. Native Bluent Button cards for Neutral/Brand/BrandHover/Danger/Inverted, and an actual click-driven opt-in choice between unconditional brand ring and explicit source context mapping. Light Inverted uses OnBrand inverse; Dark Inverted uses brandedForeground2; colored Brand/BrandHover/Danger use OnBrand. 10 brands x 2 modes x 5 cards = 100 contextual numeric passes, 70 unconditional failures deliberately preserved. Chrome and Edge WASM 796/796 each; narrow RTL 320px / 200% root text reflow fixed within demo. Not automatic detection, public API, or full accessibility signoff.

**Forced-colors specificity hazard:** New opt-in host card classes using Dark/adaptive CSS custom properties can outrank a generic forced-colors fallback. Real CDP emulated forced-colors caught this; use an explicit system Highlight override inside the isolated research card scope, verify Light/Dark x baseline/adaptive x five host types, and never claim Windows native OS/AT signoff on CSS emulation alone. Chrome WASM 797/797 includes new 20-case media-emulation check; source docs CONTEXTUAL-BRANDED-FOCUS-LIVE-REVIEW.md.

**Danger/Toggled readability:** colorPaletteRedBackground1 Light is very pale and must NOT be paired with white OnBrand text. On emitted source roles use colorPaletteRedForeground2 for selected and Hover (redBackground1/2), white OnBrand for pressed / not-selected redBackground3. Verify >=4.5:1 across 10 brands x 2 modes and test actual pointer/keyboard/toggle in Chrome and Edge. Only demo-scoped v3 proposal is implemented; update canonical Bluent Penpot design and get approval before any public Button API or SCSS change. Docs: DANGER-TOGGLED-READABILITY-REVIEW.md.

Danger/Toggled design QA: canonical Bluent v3 Penpot page-07 board 94a03b1b-8cb6-8091-8008-c986fd01b85f is editable, exported and visually inspected; real LIVE Penpot native shape and centered Persian RTL text audit 61/61 PASS. Rerun scripts/quality/penpot_v3_danger_toggle_contrast_audit.js inside connected Bluent Penpot, not Node. Earlier wrong-file issue is resolved; public Button state palette still needs maintainer review before release.

v3 Danger readable palette: use actual scoped Bluent.UI asset at wwwroot/v3/danger-toggle.opt-in.preview.css, imported after base CSS with _content/Bluent.UI/v3/danger-toggle.opt-in.preview.css and activated only on a parent carrying data-bui-v3-danger-toggle. Do not duplicate in demo Razor CSS or modify shared legacy _button.scss; production v3 Button API is not approved. Local Chrome/Edge 843/843 and local-only NuGet pack inventory passed. Source doc: docs/v3/tokens/DANGER-TOGGLE-PACKAGED-OPTIN.md.

**V3 Danger opt-in NuGet integrity:** compare exact packaged CSS bytes with src/Bluent.UI/wwwroot/v3/danger-toggle.opt-in.preview.css, not ZIP filename alone. Keep missing/tampered CSS negative controls, reject all other unreviewed v3 package members and retain ten original themes. Package boundary negative tests: 7/7; full v3 source QA: 40/40. See docs/v3/tokens/DANGER-TOGGLE-PACKAGED-OPTIN.md.

**Independent 10-brand media QA (2026-10-14):** `scripts/quality/probe_v3_forced_colors_runtime.mjs` now tests all 20 brand/mode combinations against generator-expected computed source colors, four CSS media combinations, focus geometry and restoration. Actual Dev01 Chrome WASM **139/139** and Edge WASM **139/139**. It runs under the existing WASM Chrome/Edge workflow; see `docs/v3/tokens/FOUNDATION-AUDIT.md`. These checks do not establish native OS Contrast Themes / AT accessibility approval.

**TextField full brand-media gate (2026-10-14):** In `scripts/quality/probe_v3_forced_colors_runtime.mjs`, 80 added real Blazor TextField focus checks span all 10 brands × Light/Dark × normal/reduced/forced/both CSS media. The native animated bottom pseudo-element must stay solid 2px and expanded, with no outer focus outline, no layout shift, and exact system `Highlight` during forced-colors. Dev01 Chrome and Edge WASM each passed **219/219**; see `docs/v3/tokens/FOUNDATION-AUDIT.md`. Penpot source-owned brand-ring/field-underline board `94a03b1b-8cb6-8091-8008-c8b9bae47e45` on #501 page38; no new design edits or native OS/AT certification claimed.

2026-10-14 additional explicit host-role regression: test_v3_focus_host_surface_matrix.py now proves proposed contextual selection 100/100 source-mode-brand-host cases >=3:1 (min 3.103) and guards Dark inverted vs unconditional white; baseline failures remain documented, not hidden. Connected Penpot canonical page38 #501 research board f4136a9a-101d-8004-8008-ca2956fe05f9 has 85 actual editable child shapes, PNG exported/visually inspected, 78/78 native read-only audit passed. This adds RESEARCH evidence only, no public UI/API approval or native OS/AT signoff; preserve maintainer's chosen brand ring on neutral hosts and underline-only TextField. #501 design PR #502 owns the Penpot audit code, #418 PR #500 owns the CSS source-host test and opt-in Blazor preview.

2026-10-14 #418 branch CLR compatibility checkpoint after merging #494 (4f25beff): independently diffed a temporary fresh Release metadata snapshot vs the #494 baseline, allowed EXACTLY 9 opt-in Dialog/Popover properties and 2 Dialog public methods; zero other differences, removals, changed signatures/shared bases. Updated branch-local snapshot counts to 788 declared component properties, 196 public methods, 140 types, 8 bases, 139 constructors and 13 CLR events. Three issue-specific regression tests protect this audited list; compiled negative/positive tests still run. See docs/v3/tokens/ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md. No stable Dev/NuGet or final v3 API/AT approval.

2026-10-14 explicit maintainer visual acceptance: #501 source-owned Penpot page38 board f4136a9a-101d-8004-8008-ca2956fe05f9 marked APPROVED DESIGN, native 78/78 on approved source. Approved: branded focus on Neutral, inverse OnBrand on colored hosts, inverse Light / brandForeground2 Dark on Inverted; TextField bottom underline only. #501 PR #502 merged into bluent-v3; #501 Done. #418 v3 Styling Lab default now approved adaptive while original single-brand study remains available via a real Button toggle; CDP probe asserts initial mounted Blazor adaptive and toggles to brand and back. All OS/AT, gradients/transparency/nested hosts, real zoom and #428 production component acceptance remain separate. Do not infer published CSS/semantics from opt-in demo.

2026-10-14 approved Focus host-role token bridge: source-owned Penpot board f4136a9a-101d-8004-8008-ca2956fe05f9. The new schema focusHostPreview map generates ONLY opt-in --bui-v3-focus-host-ring-candidate on an explicit role+Light/Dark same-element host under data-bui-v3-tokens ancestor; forced colors uses Highlight. Do not infer from Button fill, declare this variable public, modify global Button CSS or stable v2. Strict 100-source-color contrast checks and five new contract/negative tests reject changed approved roles and naming. Browser Lab's mounted real Blazor host cards test computed selected ring and host contrast across 10 brands x 2 modes x 5 host roles and nonopted-outside leakage, restoring DOM. Details docs/v3/tokens/FOCUS-HOST-TOKEN-CROSSWALK.md. Actual native OS/AT and production #428 semantics remain open.

2026-10-14 forced-colors follow-up: probe_v3_forced_colors_runtime.mjs now checks explicit approved candidate host-focus role on the actual mounted Blazor Danger card 10 brands x Light/Dark x four CSS media cases (80 new per-browser assertions), requiring `Highlight` under emulated forced colors, `colorNeutralForegroundOnBrand` otherwise, while restoring all host attributes. This guards specificity of forced-colors vs generated host-context selectors without pretending to certify Windows native AT. Run Chrome/Edge WASM CI on latest PR #500 before marking complete.

2026-10-15 real Blazor opt-in integration: five V3StylingLab host-card elements now DECLARE approved data-bui-v3-focus-host and Blazor-bound data-bui-v3-focus-mode in Razor (NOT the global product data-bui-theme); approved CSS mode consumes --bui-v3-focus-host-ring-candidate generated by #418 schema. Duplicated Brand/Danger/Inverted manual CSS rules removed. Six regression unit tests (incl Razor/CSS static contract) and CDP keyboard-painted outlines across 10 brands x 2 modes x 5 actual cards require matching inherited source palettes, role/mode, contrast and absence of outside alias leakage. During synthetic brand/mode browser sweeps test must update parent/card DOM attributes together (direct DOM mutation bypasses Blazor). No stable/public Button CSS or API change. Verify latest PR #500 browser CI before claiming success. See docs/v3/tokens/FOCUS-HOST-TOKEN-CROSSWALK.md.


2026-10-15 nested theme isolation correction: do NOT add data-bui-theme directly to each v3 Focus test card: global theme-[brand]-[mode] CSS would override the outer selected brand with default source colors. The explicit private focus-mode attribute data-bui-v3-focus-mode co-located with data-bui-v3-focus-host selects only the approved candidate ring; actual Blazor product data-bui-theme remains at the outer opt-in host. Generated schema/CSS and real Chrome/Edge tests must preserve source role inheritance across all ten selected brands and both modes. This is private/demo opt-in, not released API.

2026-10-15 #418 real-state regression: never confuse direct DOM palette
attribute mutation with Blazor _dark/_mainBrand state. Resynchronize using
actual controls before testing real EventCallback theme/brand rerender and
five focus host rings plus independent nested Word. Local Dev01 Chrome/Edge
WASM 868/868 each. A Windows Chromium launcher may exit 0 before its
detached browser creates DevToolsActivePort. Wait for the port, and
clean only this run's unique bluent-v3-418-cdp- temp-profile processes.
See docs/v3/tokens/FOCUS-HOST-TOKEN-CROSSWALK.md. No OS/AT/API signoff.

2026-10-15 nested theme QA: the approved generated Focus host token must use
the nearest independently owned product brand/mode, not its surrounding outer
host. The v3 Styling Lab has an actual Word Button under the independent Word
host, with explicit neutral host role and AlternateScope.Mode; never reapply
the global product data-bui-theme on the focus card itself. Browser asserts
Word's real computed brandBackground/brandForeground2 token versus focused
outline while the outer Excel/default Light/Dark state changes via real Blazor
controls. See docs/v3/tokens/FOCUS-HOST-TOKEN-CROSSWALK.md. Not public API.

2026-10-15 detached Popover Focus boundary: the DOM-owned Word Popover is
rendered into a global container, so use an explicitly opt-in, narrowly
demo-scoped selector for its real mounted Bluent Button. Source ring token
must inherit the Popover's own Word product theme, never the surrounding
Excel/default component host. Real keyboard modality is required before
testing focus-visible; simple programmatic focus after a mouse click is
not equivalent. Restore emulated forced-colors after asserting Highlight.
For browser palette QA, wait until computed CSS transition colors settle
to actual Fluent token source roles; immediate reads are nondeterministic. Dev01 Chrome/Edge WASM each passed
870/870 after this hardening. See docs/v3/tokens/FOCUS-HOST-TOKEN-CROSSWALK.md.
No shipping API approval.

2026-10-15 Persian font acceptance: Windows GitHub CI can return an empty
CSS.getPlatformFontsForNode array even while DOM typography/layout
assertions pass. Never claim glyph/fallback-family visual acceptance
from computed CSS/DOM alone. Use fail-closed policy
scripts/quality/v3_persian_font_evidence.mjs, run its five Node negative
controls and report semantic-layout-only separately from actual
platform-glyph-observed. The CI failure on 075f98f4 was one real
unavailable telemetry result; do not retroactively label it green.

2026-10-15 #418 native font research board: file b64f6665-c9ab-80b5-8008-c4ac99d9d000, page 42 e775e67c-d9da-804b-8008-cb84059cbdab, board e775e67c-d9da-804b-8008-cb8405b790a5, revision 377. Run scripts/quality/penpot_v3_persian_font_evidence_audit.js as a read-only Penpot execute_code body: expect 8/8 native LTR+RTL size-token bindings and 29 visible research shapes with zero bounds overflow. Inter/Noto Sans Arabic are Penpot draft specimen fonts ONLY, not approved fallback or release dependencies. Real browser font telemetry is not optical glyph acceptance; do not modify PuyaStudio Runner or stable Dev.

2026-10-15 Penpot fontFamilies QA caveat: #419 original draft token bluent.type.family.base with bare Segoe UI resolves to Segoe,UI in Penpot API. A temporary TokenSet verified quoted "Segoe UI" resolves to one correct family, then was deleted. Do NOT infer font stack approval from 8/8 native font-size bindings. Page42 rev386 board contains 30 shapes and a visible source-font warning; repeatable audit also checks current fontSerialization.reviewRequired. Do not overwrite original #419 draft values without design review; do not redistribute fonts. Other native foundation audits: 48 aliases, 60 swatches, 80 native brand-theme values, 40 focus-host source evidence, 29 field focus shapes all passed; known low-contrast source candidates deliberately remain FAIL on research board.

2026-10-16 maintainer decision #418: retain the existing system-font
Segoe UI-first fallback; package no new font. Corrected the original native
Penpot draft bluent.type.family.base to the quoted single family "Segoe UI"
(resolves Segoe UI). The page-42 specimen explicitly records the fixed
format, NOT native Persian glyph or assistive-technology acceptance.
Execute scripts/quality/penpot_v3_persian_font_evidence_audit.js read-only
to catch future source serialization regressions. A prior Edge/Server
GitHub CI failure occurred after 869/869 successful browser checks solely
in Windows PowerShell owned-browser cleanup; hardened asynchronous
bounded cleanup still rejects leftover processes.

2026-10-16 system-font continuity has a versioned testable snapshot at
docs/v3/tokens/issue-418-system-font-continuity.json. Run
python scripts/quality/audit_v3_system_font_continuity.py and the seven
negative tests. Enforce 20 CSS brand/mode font stacks and preserve three
preexisting Fluent System Icon fonts while rejecting new text fonts.
The CI snapshot is not live Penpot readback and does not certify native
glyph optics or assistive tech. Safe rollback:
docs/v3/tokens/SYSTEM-FONT-CONTINUITY-AND-ROLLBACK.md.
