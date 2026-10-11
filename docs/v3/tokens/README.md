# #418 — Source → semantic → component token bridge, first design/implementation checkpoint

**Status:** In progress · **2026-10-11** · **not final v3 token API or release-ready**. [Epic #416](https://github.com/vrassouli/Bluent/issues/416) · [Accepted ADR #417](../architecture/ADR-0001-styling-boundaries.md) · [Issue #418](https://github.com/vrassouli/Bluent/issues/418).

## Real design location and scope

- Authoritative working file (not Microsoft Fluent Community): **`Bluent v3 Design System`**, Penpot file ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Native token-layer board: **`27 · v3 token architecture and themes · #418`**, page ID `acf5f619-7d81-80da-8008-c5cad7f94014`, main board ID `acf5f619-7d81-80da-8008-c5cb90d6963b`. Screen exported, inspected, and TextField example's visible border improved.
- Native 10-brand palette review: **`28 · Ten brands Light Dark matrix · #418`**, page ID `acf5f619-7d81-80da-8008-c5cce396e634`, main board ID `acf5f619-7d81-80da-8008-c5cce3bd4593`. Board includes **ten named source brands and 20 color swatches**, each from real emitted CSS. PNG exported and inspected. The preview board shows sourced colors, not individually bound/active 20 Penpot brand themes.
- The latest **named recovery version**, observed revision **220**, is `Bluent v3 · #418 20 brands contrast and foundations audited 2026-10-11`. It includes **five #418 design pages** (27–31), source-backed 10-brand theme switching and an independent Danger text contrast candidate board. The static swatch matrix was independently audited (**60 checks, zero errors**), and the **20 genuinely selectable native brand-mode themes** were switched live (**80/80 component-token assertions, zero errors**).
- Earlier #419 Penpot library remains separate: its **seven draft sets (49 tokens)** and imported read-only Fluent kit were **not overwritten**. #418 first added **six default Light/Dark TokenSets (48 tokens)**, then **20 native brand-palette source sets (4 tokens each) plus two shared brand-preview semantic/component sets (4 each)**. A further **two isolated accessibility research sets (two tokens per mode)** plus six shared foundation aliases bring the design file to **38 total sets / 195 tokens / 22 themes**. The original #419 library PR remains in Review.

### Native 10-brand switching preview

- **Actual native Theme group:** `Bluent v3 / Brand×Mode (Preview)`, 20 options (`default / light`, `default / dark`, `excel / light`, ... `word / dark`), each linking its own source TokenSet plus **shared** `bluent-v3/418/brand-preview/semantic` and `bluent-v3/418/brand-preview/component` sets.
- The 20 new source sets contain **four unique token names each**: `bluent.preview.source.surface`, `bluent.preview.source.foreground`, `bluent.preview.source.brandBackground`, `bluent.preview.source.onBrand`. Shared semantic and component sets contain **4 aliased tokens each**. These use a **separate experiment namespace** so they do not override #419's existing source tokens or falsely finalize the production alias names.
- **Real bound preview board** on `29 · Live brand theme switching · #418`: Penpot page `acf5f619-7d81-80da-8008-c5d06084d4c6`, board `acf5f619-7d81-80da-8008-c5d0608ab738`. The Button fill/label and TextField surface/text have **native Penpot Token binding**. The preview was PNG-reviewed in Default/Light and **Excel/Dark**; after the next Penpot read, actual shape fills updated to `#146938` Button and `#292929` TextField surface, proving this is not just a static swatch.
- **Live theme switching:** [repeatable script](../../../scripts/quality/penpot_v3_native_brand_theme_audit.js) tested all **20 themes × four actual component alias values = 80 checks / zero failures**. It restores `default / light` and `Light · Draft` when finished.
- **Important limitation:** Penpot has **two separate theme groups**: the Brand×Mode source palette and the original neutral/global Mode. The designer must select matching Light/Dark modes; this is a prototype of brand+mode resolution, **not an implemented automatic synchronized theme picker in Blazor**. The static 10-brand board remains useful for side-by-side palette comparison.

### Text contrast candidate and design evidence

A **real source-color defect candidate** was detected for ordinary Danger text on the neutral dark surface: existing `--colorStatusDangerForeground1` `#DC626D` vs `#292929` gives **4.164:1** in **all ten Dark brands**, while the existing `--colorPaletteRedForeground1` `#E37D80` gives **5.204:1**. In Light, the respective ratios are **7.121:1** and **5.848:1**. This is a *specific numerical pairing*, not a declaration that every use of the old Danger variable fails WCAG.

- [Editable Penpot contrast board](CONTRAST-AUDIT.md): page `30 · Danger text contrast comparison · #418` (`acf5f619-7d81-80da-8008-c5ddd53bc436`), board `acf5f619-7d81-80da-8008-c5ddf5c26686`; exported PNG visually reviewed.
- Two new **separate a11y research TokenSets**, Light `acf5f619-7d81-80da-8008-c5ddd546a298` and Dark `acf5f619-7d81-80da-8008-c5ddd54c7980`, with two source-backed color values each; actual mode-readback audit **12/12 pass**.
- [Contrast scanner](../../../scripts/quality/audit_v3_token_preview_contrast.py): **20 modes × 4 numerical pairs = 80 checks**, confirms **10/10** legacy Dark Danger values below 4.5 and **0/20** candidate values below 4.5.
- Added **independent opt-in alias chain**, `--colorPaletteRedForeground1` → `--bui-v3-text-danger-accessible` → `--bui-v3-badge-danger-text-accessible`. Existing `--bui-v3-status-danger` and `--bui-v3-badge-danger-foreground` **remain untouched**; this does not change stable CSS or approve a final badge runtime API.

### Native additive #418 TokenSets

| Penpot set | ID | Native tokens |
| --- | --- | ---: |
| `bluent-v3/418/source/light` | `acf5f619-7d81-80da-8008-c5cb4da01659` | 5 |
| `bluent-v3/418/source/dark` | `acf5f619-7d81-80da-8008-c5cb4e0375d0` | 5 |
| `bluent-v3/418/semantic/light` | `acf5f619-7d81-80da-8008-c5cad804962a` | 11 |
| `bluent-v3/418/semantic/dark` | `acf5f619-7d81-80da-8008-c5cb4e03942e` | 11 |
| `bluent-v3/418/component/light` | `acf5f619-7d81-80da-8008-c5cb4da21fea` | 8 |
| `bluent-v3/418/component/dark` | `acf5f619-7d81-80da-8008-c5cb4e03faa3` | 8 |

Each set is included in the matching existing `Bluent v3 / Mode` **Light · Draft / Dark · Draft** theme. The existing default-brand color tokens still supply five source names per mode; #418 adds five more: **onBrand**, accessible stroke, danger foreground, foreground disabled and disabled background, all from existing emitted CSS.

Penpot **real design aliases** use `{bluent.color.brandBackground}` → `{bluent.semantic.action.background}` → component-specific names, **not manually duplicated hex strings**. Actual Penpot theme-switch readback verified **48/48 resolved tokens**, zero unresolved aliases, including `bluent.component.button.backgroundPrimary` resolving to **#1267B4 in Light** and **#18599B in Dark**, and accessible text-field stroke and danger badge colors. Initial #418 presentation board has a token-bound Light specimen, and a literal Dark preview clearly identified as a source-derived static snapshot.

### Typography, density and motion source-alias specimen

The editable [source-backed foundation study](FOUNDATION-AUDIT.md) on page `31 · Typography density and motion foundations · #418` (ID `acf5f619-7d81-80da-8008-c5e09d3a050f`, board `acf5f619-7d81-80da-8008-c5e0d7a2fbf9`) adds one *shared, genuine native* `bluent-v3/418/foundation/aliases` TokenSet (ID `acf5f619-7d81-80da-8008-c5e09d49cf8a`). Its **six native references** resolve pre-existing #419 foundation tokens for body typography (14px / 20px), control gap 12px, Medium Button height 32px, fast motion 150ms and reduced motion 0ms. Both Latin/Persian text specimens and Medium height sample bind real Penpot tokens. Live Light/Dark audit: **18/18 checks passed**; exported PNG visually reviewed. **Neither browser font fallback nor product motion behavior is approved.**

## Source-backed code artifact, opt-in only

[Versioned preview schema](issue-418-token-schema.preview.json) is the explicit crosswalk for the following three layers:

1. **Source:** eleven logical tokens per mode — actual existing CSS variables (`--colorNeutralBackground1`, `--colorBrandBackground`, `--colorNeutralStrokeAccessible`, `--colorStatusDangerForeground1`, etc.). Existing #419 Penpot sets contain five of these; the new #418 source sets add five.
2. **Semantic:** twelve aliases such as `--bui-v3-action-background`, `--bui-v3-surface-default`, `--bui-v3-border-strong`, `--bui-v3-text-disabled`. Designed to express purpose rather than a particular color.
3. **Component:** nine aliases such as `--bui-v3-button-background-primary`, `--bui-v3-text-field-stroke`, `--bui-v3-checkbox-checked-fill`, `--bui-v3-switch-checked-track`. These names are **proposals**, not committed API names or exhaustive production component states.

Run from repo root:

```powershell
python scripts/quality/generate_v3_token_preview.py
python scripts/quality/generate_v3_token_preview.py --check
python scripts/quality/probe_v3_token_preview.py
python scripts/quality/audit_v3_token_preview_contrast.py
python scripts/quality/probe_v3_token_nested_theme_scope.py
```

[Generator](../../../scripts/quality/generate_v3_token_preview.py) validates existing **20 emitted brand/mode source files**, resolves all 32 logical tokens per combination, rejects missing/conflicting source declarations, forward/cyclic aliases and schema drift. It writes [the deterministic 10×2 source-color matrix](issue-418-brand-matrix.preview.json) and [the opt-in CSS bridge](issue-418-opt-in.preview.css) under `docs/v3/tokens`.

**Important D1 safety:** The CSS is **not included in `bundleconfig.json`, the current static-asset CSS or NuGet release** and never defines or overwrites a preexisting `--color*`, `--spacing*`, `--fui-*` variable. The new aliases exist *only* under `[data-bui-v3-tokens][data-bui-theme]` and descendant `[data-bui-theme]` scopes **when a consumer explicitly includes this research CSS file**.

A [real Chromium computed-style probe](../../../scripts/quality/probe_v3_token_preview.py) uses all **10 actual brand theme files × 2 modes** with the generated opt-in CSS. It verified **140/140 assertions, 0 failures** for Button background/text/border, disabled foreground/background and the new opt-in accessible Danger text candidate. This is measurable stylesheet interoperability, **not a claim of actual Button Blazor behavior** or WCAG AA compliance.

## Browser evidence: nested Theme and opt-in boundaries (2026-10-11)

Run `python scripts/quality/probe_v3_token_nested_theme_scope.py` for a repeatable Chrome check with real emitted Light/Dark CSS and the opt-in token preview.

The fixture loads **all ten existing brands** independently and checks a non-opted-in subtree, a Light opt-in host, a nested Dark host, a nested Light host and an outside Dark subtree. It verifies the current legacy brand source variable remains correct, that opt-in aliases resolve to each mode's computed color, and that unopted regions receive no v3 token alias.

**Results: 10 brands × 10 computed-style expectations = 100/100 PASS (0 errors).** Default brand Button-background samples: `rgb(18, 103, 180)` Light and `rgb(24, 89, 155)` Dark. The generator's `--check` mode also passes across 20 brand/mode combinations with 32 logical tokens each.

**Limit:** This tests nested DOM CSS inheritance, **not** service-hosted Dialog/Popover outside its ancestry, keyboard, screen readers, forced colors or full accessibility. Runtime portal propagation (ADR D2) still requires implementation and real Blazor testing.

## Native forced-colors and reduced-motion acceptance study

A new **editable native Penpot page**, `32 · High contrast and reduced motion policy · #418` (ID `acf5f619-7d81-80da-8008-c5ef1089ac94`, board `acf5f619-7d81-80da-8008-c5ef2f9a3158`), documents three separate policy concepts: regular Light/Dark semantic tokens, OS forced-colors system roles and reduced-motion acceptance. The board was exported to PNG and visually inspected. Recovery version `Bluent v3 · #418 opt-in scope and accessible motion rules 2026-10-11` at Penpot revision **223** contains **33 pages**, still **38 native TokenSets**. Original imported Fluent source was not modified.

The [design and runtime acceptance distinctions](HIGH-CONTRAST-MOTION-DESIGN.md) explicitly prohibit treating the illustration as proof of native forced-color behavior, functioning Blazor control focus or automatic portal context propagation. The real Chrome DOM ancestry scope check immediately above passed **100/100**; actual portal, forced-colors and reduced-motion runtime verification remain open.

## Still required before #418 Review

- **Penpot:** repeat the [default-mode native alias audit](../../../scripts/quality/penpot_v3_token_alias_audit.js) (**48/48 passed**), [static palette source audit](../../../scripts/quality/penpot_v3_brand_matrix_audit.js) (**60/60 passed**) and [true native brand theme-switch audit](../../../scripts/quality/penpot_v3_native_brand_theme_audit.js) (**80/80 passed**, observed revision 193). The selected Brand×Mode palette group requires **matching the separate base Mode Light/Dark selection**. Neither these proofs nor native Penpot preview names approve all runtime semantic aliases.
- **Full token coverage:** typography stacks for Windows/macOS/Persian (Segoe UI vs Inter, Noto Sans Arabic candidate), density, elevation, corners, high contrast/forced-colors, motion/reduced-motion and true RTL/LTR logical dimensions. The 48 color token specimens are only the first independently checked slice; #419 has earlier draft spacing/typography/motion sets.
- **Portal and nested theme ownership:** D2's real Dialog/Popover host-context behavior remains unimplemented; token aliasing alone does not move a DOM portal into its correct Theme ancestry.
- **Actual component consumption:** the CSS is deliberately opt-in research and not yet imported by final Blazor v3 component code. Test real disabled/focus/error/hover, modes, SSR, keyboard, zoom and screen readers, with nonbreaking CSS variable precedence.
- **Quality & migration:** full browser/reflow/forced-colors evidence, documentation/Skills, exhaustive demo, build/pack/SSR validations and [#424](https://github.com/vrassouli/Bluent/issues/424) migration notes before Review/Done. #419 design-library PR #499 has been merged into bluent-v3; #418 remains independently in progress.

**Isolation:** work on branch `v3/issue-418-design-tokens` based on `bluent-v3`; stable `Dev` and published NuGet untouched. The architecture D1–D5 is accepted; the *exact v3 token vocabulary and complete brand themes have not yet been approved*.

## Browser emulation checkpoint
The [scoped accessibility policy overlay](issue-418-accessibility.preview.css) and [six-scenario Chrome probe](ACCESSIBILITY-MEDIA-PROBE.md) exercise forced-colors and reduced-motion at research scope only; keyboard focus and non-reduced motion remain open. This is not shipped CSS.


## Real Blazor runtime and detached Dialog checkpoint
The [nine-check interactive WASM/Chrome proof, SSR smoke and D2 Penpot decision map](BLZ-RUNTIME-PORTAL-AUDIT.md) exercise scoped candidate tokens in real Bluent controls and document the **reproduced, still-unfixed** global service Dialog theme ownership gap. Preview CSS stays opt-in and demo-only.


## Expanded Chrome/Blazor 74-check runtime matrix
[Runtime results](BLZ-RUNTIME-PORTAL-AUDIT.md) now include 20 real Button brand-mode colors, 20 root alias isolation assertions, 20 primary color-contrast arithmetic checks (minimum 5.552:1), mobile 390px RTL, compact height, and **both still-unfixed** service Dialog/Popover ownership defects. See [D2 candidate owner contract](PORTAL-THEME-OWNERSHIP-PROPOSAL.md) for required app-scoped propagation design; the document-wide style swap does not demonstrate independent simultaneous brands.


## Opt-in portal theme prototype — actual runtime implementation
[The scope prototype guide](PORTAL-THEME-SCOPE-PREVIEW.md) documents the proposed C# PortalThemeScope/SetThemeScope/CascadingValue contract, real Blazor ownership propagation and v2 no-scope fallback. Actual Dev01 Chrome passes **83/83** assertions and NUnit **26/26**; the original D2/D5 defects are fixed **only in the opted-in research path**. Brand-isolated simultaneous apps, native High Contrast/AT, interactive SSR, final API/Skills and full Penpot approval are **still pending**. It is not in current NuGet/CSS packages. The earlier findings above are preserved as historical pre-fix evidence.

## Concurrent brand-scoped owners
See BRAND-SCOPES-PREVIEW.md for the source-based 10-brand, 2-mode CSS generator, Penpot page 34 and 126/126 real Blazor Chrome tests. All 450 variable declarations are parsed per theme, but only 49 brand-varying variables are overridden for each opted-in host (980 declarations across 20 combinations). NUnit tests: 40/40. Legacy, stable and default bundles are unchanged. Older browser-count checkpoints above are retained for traceability.

## Interactive Server browser parity
The [published SSR InteractiveServer integration probe](INTERACTIVE-SERVER-PROBE.md) now passes the same **126/126 real Chrome/CDP tests** as standalone Blazor WebAssembly. The isolated SSR probe route keeps the service-hosted Containers in its own interactive circuit; the Production-published local host handles static assets correctly. This is not native accessibility validation, deployment, or a release.

## Persian typography / genuine 320px reflow research
The [live فارسی, ZWNJ, Latin identifiers and icon/text alignment research](PERSIAN-TYPOGRAPHY-RESEARCH.md) adds three real Bluent Buttons, one TextField, isolated bidi identifiers and Chrome platform-font tracing to the opt-in lab. It corrects the previous mobile emulation false-positive: CSS viewport width is now explicitly asserted to be 320 or 390px. An observed 400% long Persian Button overflow was fixed **only inside the v3 demo CSS**, using wrapping and width constraints. The current dual-mode browser matrix is **139/139 WASM and 139/139 Interactive Server**, subject to their documented scope. A new Penpot typography design and approved font choice are still pending; stable Bluent.UI Button SCSS is unchanged.


## Verifiable typography source and invalid/disabled states
The [#418 typography source audit](TYPOGRAPHY-SOURCE-AUDIT.md) parses the existing 10-brand × Light/Dark CSS and verifies the same 17 declared family/weight/size/line-height values for all 20 modes (fontSizeBase300 14px, lineHeightBase300 20px). These are **legacy source facts**, not approved v3 typography. The research demo now contains a truly disabled Bluent Button and Persian invalid TextField with aria-describedby and a demo-only source-danger border. Updated Chrome WASM and InteractiveServer test suites pass **144/144** each; final font/visual/native AT decisions remain open.

Additional real Microsoft Edge (Chromium) repetitions of the full new 144-check matrix pass on both WebAssembly and locally published InteractiveServer; see TYPOGRAPHY-SOURCE-AUDIT.md. This does not provide Firefox/Safari/AT coverage.


## Editable Penpot form and reflow board; open D5 portal accessibility
The correct Bluent v3 Design System Penpot file (b64f6665-c9ab-80b5-8008-c4ac99d9d000) now includes a **new editable page 35**: `Persian validation states and reflow` (page `916ee53e-8991-8009-8008-c61c0754ce9d`, board `916ee53e-8991-8009-8008-c61c075e54cc`, **44 native shapes**, 0 bounds violations; final updated PNG exported and visually inspected). It previews Persian TextField error states, disabled Button, Light/Dark, a schematic of the browser-verified 320 CSS-pixel / 400% text wrapping (not a pixel-scale font-size rendering). Noto Sans Arabic is **only the research Penpot font**, not an approved v3 shipping font. [D5 actual Chrome Accessibility/keyboard audit](D5-PORTAL-ACCESSIBILITY-AUDIT.md) identifies *four still-open findings* around Dialog role, accessible close label, initial focus from a programmatic open, and open Popover expanded/controls relationships; 144/144 Chrome styling tests **do not imply these are fixed**. Penpot page 33 D2 acceptance text was updated for D5.

Final page #35 board re-exported from the connected Penpot file after refinements, visually reviewed and rechecked: 44 editable elements, zero geometry bounds errors. Four D5 open observations reproduced on Chrome and Edge, on both WASM and InteractiveServer; see D5-PORTAL-ACCESSIBILITY-AUDIT.md.


## Penpot #418 Button labels: rendered-content centering
The maintainer spotted visibly top-aligned Button text on page 34 (Excel/Word) and page 35 (Persian disabled and multiline RTL). [Native Penpot correction evidence](PENPOT-BUTTON-LABEL-CENTERING.md) records the before/after layout and actual Penpot Text.textBounds measurement: all five labels now have centered ink boxes (horizontal 0 px, vertical <=0.21 px), all inside their background buttons, and both page PNG exports were visually inspected. Setting verticalAlign=center alone was inadequate for Penpot Noto Sans Arabic, so the final result was calibrated from actual rendered text bounds. This changes Penpot design assets only; no shipping Button CSS or stable NuGet.


## Opt-in Dialog accessible name/entry proof
The [D5 scoped Dialog accessibility prototype](D5-ACCESSIBLE-DIALOG-PROTOTYPE.md) supplies an explicit localized accessible name and Close icon label, adds role=dialog and focuses the Dialog on initial render, only with caller opt-in. Real Chrome and Edge, WASM and published InteractiveServer **149/149** each; NUnit **43/43**. Legacy unscoped markup is unchanged. **Remaining gaps:** focus restoration, full modal keyboard trap/stack, Popover aria-expanded/aria-controls, native AT and approved API. The earlier four D5 defects in D5-PORTAL-ACCESSIBILITY-AUDIT.md are historical baseline findings.


## Explicit focus restoration and actual Popover ARIA state (opt-in)
The [#418 D5 focus-return and Popover ARIA proof](D5-FOCUS-RESTORE-POPOVER-ARIA-PROTOTYPE.md) covers a caller-supplied Dialog launch Button ID and safe restoration after the last Dialog closes; real Popover show/hide/reopen cycles set aria-expanded and aria-controls in the JS component that owns visibility. A legacy Popover opened without opt-in remains unchanged. Four Chrome/Edge x WASM/InteractiveServer browser runs **157/157 each**, NUnit **47/47**; the previously reported original D5 gaps are now historical only in the opted-in prototype. Modal focus trapping, nested stacks, AT, final component API approval and complete design parity remain open.


## D5 named Modal keyboard, nested Escape and focus stack draft
The [new native Penpot #418 design and runtime ledger](D5-MODAL-KEYBOARD-STACK-PROTOTYPE.md) references actual editable Penpot page 36 (535db143-a732-807e-8008-c6403ec3fa0c), board 535db143-a732-807e-8008-c6403f3c74af: 35 native shapes, zero bounds violations, five rendered label ink centers within 0.36px of button center, reviewed exported PNG. Opt-in SetModalKeyboardNavigation on a named Modal implements topmost-only Tab/Shift+Tab looping, Escape with keyrepeat/closing guard, nested caller-ID focus return, teardown of its listener and reduced-motion dismissal. **Four 169/169** Chrome/Edge × WebAssembly/published InteractiveServer passes; **48/48** NUnit. Native OS/AT and final API/cross-component sign-off remain open.


## D5 escape precedence and explicit initial focus (draft)
Penpot file Bluent v3 Design System now has **page 37** `535db143-a732-807e-8008-c644769400c0`, native board `535db143-a732-807e-8008-c644771eb48a`: 26 editable elements, 0 board-bounds errors, actual PNG visually reviewed. [D5 design-to-code record](D5-ESCAPE-FOCUS-PRIORITY-PROTOTYPE.md) specifies child Popover Escape consumption before its Modal, internal preventDefault/stopPropagation Escape ownership and explicit caller-selected initial focus with inside/visible/enabled validation and fallback to the Dialog root. Four actual **176/176** Chrome/Edge x WebAssembly/InteractiveServer interactive probes pass; final native AT/Fluent API acceptance remains open.


### D5 open-Popover disposal proof
Added an opt-in JS Escape-listener disposal path through existing Blazor PopoverService.Destroy and PopoverInterop. Browser integration checks count actual document keyboard listeners before show, while a Popover is open, and after *in-surface button-triggered component unmount*, proving **+1 then -1**. Four Chromium x Blazor runs each **177/177**, including prior Escape/initial-focus checks. See [D5 Escape/focus audit](D5-ESCAPE-FOCUS-PRIORITY-PROTOTYPE.md). Arbitrary navigation, other libraries and real screen readers remain separate acceptance items.


## D5 visible Dialog heading as accessible name
Real editable Bluent v3 Penpot **page 38** (`535db143-a732-807e-8008-c64b3e0c419d`, native board `535db143-a732-807e-8008-c64b3e839d5a`) documents the [title-to-AX-name contract](D5-DIALOG-HEADING-AX-AUDIT.md): standard titled `ShowAsync<T>(title,...)` opts into an `aria-labelledby` reference to its true unique `h2`; custom render-fragment dialogs keep the explicit localized `aria-label` fallback and never point to a missing heading. Board has **22 editable shapes**, zero bounds errors and reviewed PNG export. Real Chrome/Edge × WASM/InteractiveServer **183/183 each**, NUnit **53/53** including static SSR/HTML-encoding tests. NVDA was not found on Dev01; VoiceOver was not running on MacBook3: no actual native screen-reader approval is claimed.


## D5 Dialog aria-describedby and live Persian title proof
The [#418 visible description and live title audit](D5-DESCRIPTION-LIVE-TITLE-AUDIT.md) links actual opt-in visible English/Persian help text via a unique, scoped aria-describedby IDREF; native Blazor Button changes the standard Dialog h2 and Chromium Accessibility Tree name follows it with stable aria-labelledby. New real editable Penpot page `535db143-a732-807e-8008-c650a310958b` / board `535db143-a732-807e-8008-c650a32a10f7` (22 shapes, 0 bounds errors, exported PNG reviewed). Four **190/190** Chrome/Edge × WASM/InteractiveServer runs, NUnit **58/58**. A reduced-motion zero-duration close race was fixed only in opt-in paths; an accidental duplicate JS export briefly terminated the Server Circuit during testing, was removed and all suites re-passed. Native AT, Safari engine and final API still OPEN.


## D5 Dialog unmount and keyboard teardown regression
See [#418 live Blazor Dialog owner removal](D5-DIALOG-OWNER-UNMOUNT-AUDIT.md). Three actual mount/unmount cycles remove an open opt-in Dialog via its own Bluent Button without Close(), and CDP verifies window keydown listeners baseline -> +1 -> baseline. Real Chrome/Edge x WASM/published InteractiveServer pass 194/194 each. The early red test was a JavaScript falsey-zero test bug, not a demonstrated runtime leak. JS unregister now supports stable Dialog ID after DOM detach. Existing Penpot page36 is design basis; a new Penpot board was blocked by suspended tab and Figma fallback by Starter-plan rate limit. SafariDriver was ready on MacBook3 but Safari requires Allow Remote Automation to be manually enabled; setting unchanged and Safari not tested.


## D5 native Safari / WebKit test and VoiceOver gate (2026-10-11)
The [Safari/VoiceOver #418 audit](D5-SAFARI-VOICEOVER-AUDIT.md) records a real authored Penpot D5 page `535db143-a732-807e-8008-c661af0787e1`, board `535db143-a732-807e-8008-c661af7e66a4` (26 native editable shapes, zero bounds errors and reviewed PNG). Actual Safari 27.0.1/WebKit with locally published InteractiveServer **15/15** repeatable W3C WebDriver checks via `scripts/quality/probe_v3_safari_webdriver.py`: hydration, named modal, native keyboard Tab/Shift+Tab/Escape, focus restore, aria-labelledby/describedby, live Persian title and three real Blazor owner unmount cycles. Stable Mac checkout remained Dev; only a temporary task-branch worktree and published host were used. Opening VoiceOver revealed first-run Quickstart, so **native spoken VoiceOver output remains NOT VERIFIED**; no VoiceOver/WCAG certification is claimed.


## D5 route-local Dialog host disposal (draft)
The [#418 page-local navigation/awaiting Dialog audit](D5-ROUTE-LOCAL-DIALOG-DISPOSAL-AUDIT.md) documents actual editable Penpot page `535db143-a732-807e-8008-c66a41867ed4` and board `535db143-a732-807e-8008-c66a418dadb2` (26 native shapes, zero boundary errors and PNG visually reviewed). A RED NUnit reproduced an opted-in Dialog awaiting forever when its page-local host was disposed; opt-in-only `Dispose` now completes its pending result as dismissed/null while preserving legacy default behavior. Real published InteractiveServer route navigation via a Button inside the Dialog verifies the old host and focus scope disappear (Chrome+Edge 197/197 each); existing WebAssembly tests 194/194 each. Layout-global Dialog owner navigation semantics and native VoiceOver output remain OPEN.

- **D5 route-navigation WebKit update:** real macOS Safari 27.0.1/WebKit locally published InteractiveServer on task branch `8fc5d7e5`, repeatable `scripts/quality/probe_v3_safari_webdriver.py` **18/18** including 3 cross-route Dialog-owner disposal/landing-focus assertions; native VoiceOver speech still unverified.
