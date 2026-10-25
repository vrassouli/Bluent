# Bluent Project Status

This file is the current project-state entry point. Historical sprint/relaunch detail that previously accumulated here is preserved in [`PROJECT-HISTORY-2026-08-29.md`](PROJECT-HISTORY-2026-08-29.md) and in the versioned sprint plans under `.bluent/sprints/`.

## Parallel v3 foundation (isolated development)

**Epic:** [#416](https://github.com/vrassouli/Bluent/issues/416), all work in the protected `bluent-v3` integration branch and issue-specific task branches. **Stable `Dev`, NuGet and deployments remain untouched.**

**#417 CSS architecture:** [ADR D1–D5 accepted 2026-10-11](../docs/v3/architecture/ADR-0001-styling-boundaries.md), [PR #498](https://github.com/vrassouli/Bluent/pull/498) merged into **`bluent-v3` only** (squash `3988195e`), GitHub Project **Done**, issue closed. [Browser CSS probe](../scripts/quality/probe_v3_consumer_css_overrides.py), [published SSR smoke](../scripts/quality/probe_v3_ssr_publish.ps1) and [migration compatibility risks](../docs/v3/architecture/css-migration-impact-ledger.md) underpin the accepted architectural direction. This does **not** approve exact final #418 token names, general Fluent parity or runtime accessibility.

**#419 editable design library:** [Review PR #499](https://github.com/vrassouli/Bluent/pull/499) contains an independent project-owned `Bluent v3 Design System` Penpot file and verifiable linked Fluent source/library research. The imported `Microsoft Fluent 2 Web (Community)` remains read-only. [Working Penpot manifest](../docs/v3/design/penpot-workspace.manifest.json): 27 editable pages, 65 core native variants + 16 research fixtures and alignment/RTL/size stress evidence. Issue #419 remains **Review**, not Done; accept/merge only to `bluent-v3` following review.

**#418 token system:** Active v3 foundation work is tracked in [Issue #418](https://github.com/vrassouli/Bluent/issues/418) on `v3/issue-418-design-tokens`, with [PR #500](https://github.com/vrassouli/Bluent/pull/500) targeting `bluent-v3`. The token-schema and theme previews remain research-only and non-shipping. A source-backed audit now measures 140 contrast pairs across 10 brands × Light/Dark and exposes a dark-mode gap in the draft `action.foreground` mapping: `colorBrandForeground1` falls to 3.551:1 in `office/dark` and is below 4.5:1 in all 10 Dark themes; `colorBrandForegroundLink` has the same gap, while `colorBrandForeground2` is below 4.5:1 in 8 Dark themes. No shipped component consumes the draft alias and no product CSS changed. See [the contrast audit](../docs/v3/tokens/CONTRAST-AUDIT.md). Exact final semantic mappings still need maintainer design review. Last recorded Project #5 status is **Review**, but do not mark Done until design, native accessibility, and token-approval gates are accepted.

**Design rule:** use [Penpot first / Figma authorized fallback](../docs/v3/PENPOT-WORKFLOW.md), record real design file/page/variant IDs in relevant issue/PR. The original [Microsoft Fluent 2 Web Figma reference](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD) must not be edited. Independent editable [Bluent v3 architecture Figma research](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) is supplementary, not final font/token/browser design sign-off.

**GitHub workflow:** [Backlog → Ready → In progress → Review → Done](../docs/v3/ISSUE-WORKFLOW.md). No task automatically merges to `Dev` before the complete v3 epic is accepted and separately authorized.

## Current Phase

**As of:** 2026-10-25

**Phase:** Bluent v3 foundations — token architecture, themes, and accessibility evidence (isolated from stable 2.x)
**Current Work:** [Issue #418](https://github.com/vrassouli/Bluent/issues/418) — Fluent 2 token system and themes
**Last recorded Project #5 status:** Review; verify the real Status field before any lifecycle transition
**Working Branch:** `v3/issue-418-design-tokens`
**Base Branch:** `bluent-v3`
**Pull Request:** [#500](https://github.com/vrassouli/Bluent/pull/500) — open, non-draft, targeting `bluent-v3`
**Last verified implementation base before the contrast-audit follow-up:** `7b3d5853e42a6d97e084375dcb7ac964dd1c649a` (all six required CI workflows passed on this commit)

Implementation and automated evidence have advanced, but #418 is **not complete**. The exact final semantic token mappings and accepted editable design-tool review remain open, as do native Windows Contrast Themes / assistive-technology checks. Forced Colors CSS for Slider/RangeSlider is research-only and is not a product fix. Keep all v3 work isolated from `Dev`, stable assets, published NuGet packages, and deployments.

**Completed parallel workstream:** [Issue #406](https://github.com/vrassouli/Bluent/issues/406) is closed and [PR #407](https://github.com/vrassouli/Bluent/pull/407) is merged. Its canonical consumer Skill and 65-family retrieval inventory remain maintained deliverables, not the current active workstream.

## Completed Consumer-Skill Workstream (#406)

- `.agents/skills/bluent/SKILL.md` provides a compact Bluent-first, version-aware retrieval router; canonical docs remain authoritative rather than duplicating an API encyclopedia.
- The source-reconciled consumer inventory contains 65/65 source-verified retrieval families: 57 main UI, 2 Charts, 2 Diagrams, and 4 Utilities families.
- `docs/components/consumer-api-surface.md` classifies service/container/helper/configuration APIs separately from ordinary component families.
- `scripts/quality/check_consumer_skill.py` checks source/inventory/index drift in Quality CI.
- `samples/Bluent.TaskExamples` and `docs/ai/bluent-consumer-skill-dogfood.md` preserve compiled consumer scenarios and their evidence boundaries.
- PR #407 is merged and Issue #406 is closed. No NuGet package or release was published by this documentation workstream.
- The former umbrella issue #411 is closed; future product defects should be tracked in their current component-specific issues (for example #428–#445) or the relevant v3 parity issue, not treated as an open #411 queue.

## Earlier Local Validation Checkpoint (#418)

The following build/test evidence was recorded at checkpoint `52fa29a07f7565673ff9d8e0ce724d406302e31f`; it is not the latest branch head.

- Local Release solution build: `dotnet build Bluent.sln --configuration Release --no-restore --warnaserror` — **0 warnings, 0 errors**.
- Local solution tests: `dotnet test Bluent.sln --configuration Release --no-build --no-restore` — **61/61 passed**.
- Token preview generation check: `python scripts/quality/generate_v3_token_preview.py --check` — **PASS**, 20 brand/mode combinations, 35 logical tokens per combination; legacy variables unchanged and previews excluded from published bundles.
- Demo CSS sync check: `python scripts/quality/sync_v3_token_demo_asset.py --check` — **PASS**, shipping CSS untouched.
- Forced-colors contract tests: `python -m unittest discover -s scripts/quality -p test_v3_slider_hc_token_candidate.py -v` — **11/11 passed**.
- The tracked Chrome and Edge Forced Colors matrices record **8,320/8,320 computed-style assertions passed** over 480 specimens per browser, covering ten source brands, Light/Dark app modes, two emulated system palettes, LTR/RTL, Slider/RangeSlider, and opt-in isolation. This is browser-emulation evidence, not native Windows or assistive-technology certification.
- The current-head v3 CI runs passed for the real browser lab, token contract, documentation contract, local package boundary, public component census, and Button-focus contract: [browser lab](https://github.com/vrassouli/Bluent/actions/runs/39332963141), [token contract](https://github.com/vrassouli/Bluent/actions/runs/39332963186), [docs](https://github.com/vrassouli/Bluent/actions/runs/39332963230), [package boundary](https://github.com/vrassouli/Bluent/actions/runs/39332963177), [component census](https://github.com/vrassouli/Bluent/actions/runs/39332963251), [focus contract](https://github.com/vrassouli/Bluent/actions/runs/39332963140).

These checks do **not** establish approved token names, pixel-perfect Fluent parity, native Windows High Contrast, screen-reader behavior, or final design sign-off.

## Current Operational Files

- `.bluent/HANDOFF.md` — immediate #418 continuation instructions.
- `.bluent/QUALITY.md` — validation vocabulary and repository quality policy; the #406 acceptance gate is retained only for that completed workstream.
- `docs/v3/tokens/README.md` — token taxonomy, mapping, and preview entry point.
- `docs/v3/tokens/SLIDER-FORCED-COLORS-BROWSER-RESEARCH.md` — current two-palette Chrome/Edge matrix and limitations.
- `docs/v3/tokens/BLZ-RUNTIME-PORTAL-AUDIT.md` — Blazor runtime and detached portal evidence.
- `scripts/quality/generate_v3_token_preview.py` — deterministic preview generator.
- `scripts/quality/test_v3_slider_hc_token_candidate.py` — recorded evidence and negative-approval contract tests.
- `docs/v3/ISSUE-WORKFLOW.md` and `docs/v3/BRANCHING.md` — mandatory v3 workflow and isolation rules.

## Remaining #418 Work

1. Complete design-first review in the authoritative Bluent v3 Penpot file (or an explicitly authorized, editable Figma fallback), record the real page/board/node IDs, and agree the exact token-to-role mapping. The Penpot plugin was unavailable/suspended in the latest session. A fallback Figma file was created, but Figma MCP reached its Starter-plan call limit before it could be populated; it is blank and is **not** design evidence: [Bluent v3 Token System — Issue #418 (Design Fallback)](https://www.figma.com/design/pUC3kEmDMHf44EWDiEFK0i).
2. Focused native Windows High Contrast browser evidence is now recorded (6/6 assertions on 2026-10-25; actual OS setting, not DevTools emulation). Still required: dependable Narrator/NVDA announcement evidence and accepted final semantic system-color/focus/disabled mapping across Light/Dark/RTL. The attempted Narrator session could not maintain page focus reliably, so no screen-reader pass is claimed.
3. Keep production Slider/RangeSlider behavior, keyboard/ARIA, pointer-coordinate and related fixes in their owned component issues (#442/#443 and linked tasks). Do not silently convert the #418 research stylesheet into production CSS.
4. Re-run the exact-head CI and review evidence after any follow-up commit. Keep PR #500 open until acceptance is complete; do not merge it to `Dev` or publish stable packages/releases.

## Working Agreement

- Do not invent public APIs, support claims, render modes, assets, token names, or accessibility behavior.
- Preserve v2.x compatibility and the zero-warning Release baseline.
- Distinguish source checks, build/tests, browser-emulated checks, Penpot/Figma review, native OS contrast, and assistive-technology tests.
- Follow `Backlog → Ready → In progress → Review → Done` using the actual GitHub Project #5 Status field. Do not process or promote `Analysis` without the maintainer's explicit request.
- Update this file, `.bluent/HANDOFF.md`, the active issue, and PR when project status materially changes.
- Never merge v3 into `Dev`/stable branches or publish stable NuGet packages without separate explicit final approval.

## Historical Project Record

The prior detailed relaunch/Sprint 0–4 project record is preserved verbatim in [`PROJECT-HISTORY-2026-08-29.md`](PROJECT-HISTORY-2026-08-29.md). Use it for historical decisions and completed sprint evidence; use this file for current project state.
## Isolated Bluent v3 design track (not merged into stable v2.x)

As of 2026-10-10, Issue [#419](https://github.com/vrassouli/Bluent/issues/419) is **In progress** in GitHub Project #5, after its explicit `Backlog → Ready → In progress` transitions. Dedicated branch: `v3/issue-419-penpot-library`, **base `bluent-v3` only**. The maintainer created a separate Penpot `Bluent v3 Design System` file; twenty-seven native editable design pages (including foundation, brand, RTL, source reference and Button API anatomy), **134 verified upstream Fluent reference instances**, **four original local reusable draft components**, plus **five core native variant families / 65 unique variants and 65 linked local preview instances**, plus **two separate test-fixture families / 16 linked comparison and Persian RTL variants**, draft Light/Dark themes, **seven draft token sets / 49 entries**, and a local reusable primary Button prototype now exist. An actual linked imported Fluent 2 Button reference instance was verified and visually inspected, while the original community file remained unchanged. See [Penpot workspace contract](../docs/v3/design/BLUENT-V3-PENPOT.md), [extended foundations](../docs/v3/design/FOUNDATION-EXTENSIONS.md), [form/grid component references](../docs/v3/design/COMPONENT-REFERENCE-MATRICES.md), [local component drafts](../docs/v3/design/LOCAL-COMPONENT-DRAFTS.md), [native variant families](../docs/v3/design/NATIVE-CONTROL-VARIANTS.md), [native Button states/size/API design](../docs/v3/design/NATIVE-BUTTON-VARIANTS.md), [alignment audit + live Penpot gate](../docs/v3/design/ALIGNMENT-QUALITY-AUDIT.md), [actual imported/native Button comparison](../docs/v3/design/BUTTON-PARITY-REVIEW.md), [controlled copy/icon fidelity and Persian RTL](../docs/v3/design/BUTTON-CONTROLLED-FIDELITY-AND-RTL.md), [verified import-fidelity risk assessment](../docs/v3/design/PENPOT-IMPORT-FIDELITY.md), [source-to-Razor/CSS handoff contract](../docs/v3/design/DESIGN-TO-RAZOR-HANDOFF.md), [migration impact ledger](../docs/v3/design/MIGRATION-IMPACT-LEDGER.md), [native resize constraints lab](../docs/v3/design/BUTTON-RESIZE-REVIEW.md), [Button v2 API baseline checker](../scripts/quality/check_v3_button_api_baseline.py), [source-backed FC1–FC6 design gates](../docs/v3/design/FORM-CONTROL-DESIGN-GATES.md) and [machine-readable IDs](../docs/v3/design/penpot-workspace.manifest.json).

This draft does **not** approve the #417 styling ADR, implement the #418 CSS/token migration or satisfy full Fluent UI/design parity. No public v2/v3 component code, stable assets, `Dev`, published NuGet or deployment is modified. Complete library coverage, visual/interaction parity, accessibility, font/icon checks and design review remain before #419 reaches Review/Done.

## Integration checkpoint (2026-10-11)

- #419 / PR #499: completed, independently re-audited at Penpot revision 224 (1085 geometry checks, zero errors), merged exclusively into bluent-v3 as 1b4ed97. Its historical design-stage notes above remain for provenance; full runtime/component parity is not claimed.
- #418 / PR #500: In progress / Draft. Separate opt-in forced-colors/reduced-motion CSS research overlay and Chrome fixture map to Penpot page 32; six scenarios pass. Non-reduced 150ms and real Blazor keyboard/AT/portal behavior remain unverified. Details: docs/v3/tokens/ACCESSIBILITY-MEDIA-PROBE.md.


- 2026-10-11 (#418): Real Blazor WASM Chrome/CDP opt-in token demo now passes 9/9 checks (Button, TextField, interactive Light/Dark+RTL, motion, forced-colors roles, keyboard Tab focus, reproduced D2 detached Dialog gap). Published SSR static asset smoke 4/4. Correct Penpot design file gained D2 proposal page acf5f619-7d81-80da-8008-c5fec09d9837 / board acf5f619-7d81-80da-8008-c5fec0b7ec61. Details: docs/v3/tokens/BLZ-RUNTIME-PORTAL-AUDIT.md. D2 runtime fix not yet implemented; PR #500 stays Draft; v2 Dev/NuGet unaffected.

- 2026-10-11 (#418 follow-up): Expanded real Chrome/Blazor Debug probe to 74/74 checks: 20 actual shipped brand×Light/Dark Button colors, 20 source-backed primary text contrast pairs (minimum 5.552:1), 20 root-alias isolation checks, real Popover+Dialog global Light vs nested Dark D2 defect detections, D5 reduced-motion still active on BOTH detached portals, density 40→32px and 390px RTL no-overflow. Added Penpot D2 board evidence (same correct file) and docs/v3/tokens/PORTAL-THEME-OWNERSHIP-PROPOSAL.md. Defects remain **unfixed**; no stable API or Dev branch changes.

- 2026-10-11 (#418): additive experimental PortalThemeScope implemented ONLY in v3 task branch: DialogConfiguration.ThemeScope and DialogConfigurator.SetThemeScope (explicit snapshot), Popover nearest CascadingValue with live surface update, per-dialog/popover scoped data-bui-theme/dir/density/token gate. Reduced-motion portal CSS is opt-in Demo.Pages-only, not shipping Bluent.UI bundle. Real Chrome/Blazor 83/83 including 2 dialogs opposite modes, 2 nested Popover host scopes, mode updates, keyboard, forced-colors per portal, 0s motion and Dialog close, legacy unscoped fallback. NUnit 26/26. Correct Penpot D2 board acf5f619-7d81-80da-8008-c5fec0b7ec61 updated and PNG-reviewed. docs/v3/tokens/PORTAL-THEME-SCOPE-PREVIEW.md. Draft PR #500 stays unmerged; no Dev/NuGet release. Final brand scoping/API and #420 review pending.

- 2026-10-11 #418 concurrent brands: Penpot design page 34 acf5f619-7d81-80da-8008-c60b3680e7e2 board acf5f619-7d81-80da-8008-c60b36beac74 (24 editable shapes, exported/reviewed); generated 49 brand-sensitive source CSS variables out of 450 existing properties per mode into research-only scoped 20 brand-mode combinations; PortalThemeScope.Brand validated, branded Dialog and Popover and Excel/Word nested hosts. Chrome/Blazor 126/126, NUnit 40/40. docs/v3/tokens/BRAND-SCOPES-PREVIEW.md. PR #500 still Draft, no Dev changes, stable NuGet not published.

- 2026-10-11 #418 SSR follow-up: new SSR-only research route /v3/interactive-portal-lab with InteractiveServer and same-circuit Containers. Browser probe mode BLUENT_V3_LAB_MODE=server temp-publishes Release/Production and hosts from publish working directory (raw Dev no-build had static asset 500). Real Chrome/CDP 126/126 InteractiveServer as well as 126/126 WebAssembly; NUnit 40/40, Penpot page34 board updated with dual host checks. docs/v3/tokens/INTERACTIVE-SERVER-PROBE.md. Does not exercise RenderMode.Auto or full SSR app/AT. Stable Dev/NuGet untouched.

- 2026-10-11 (#418 typography/RTL): Added real Persian+ZWNJ, Persian numerals, bdi-isolated Latin IDs, Fluent-icon Button and TextField samples to /v3/styling-lab. Chrome/CDP probes actual platform font for Persian glyphs and box centers/RTL visual order; observed Tahoma fallback in WASM, Segoe UI in InteractiveServer (cause/font choice not approved). Discovered prior mobile:true CDP emulation did not guarantee 320 CSS px; replaced with mobile:false AND exact CSS viewport assertions. True consumer 400% Button text initially overflowed; mitigated **demo-only** via width constraints and normal wrapping, verified 400% icon/text alignment. 139/139 Chrome WASM AND 139/139 InteractiveServer confirmed; see docs/v3/tokens/PERSIAN-TYPOGRAPHY-RESEARCH.md. Penpot tab suspended and Figma Starter MCP quota reached; new typography design still pending, existing Penpot #418 accessibility board is reference only. No production Button/brand CSS or stable Dev/NuGet change.

- 2026-10-11 (#418 cross-browser follow-up): Ran identical Chrome/CDP test against installed Microsoft Edge using CHROME_PATH, 139/139 WebAssembly and 139/139 published Interactive Server. Google Chrome also 139/139 on both. These are separate browser binaries sharing Chromium engine; Firefox/Safari/native OS AT still untested. docs/v3/tokens/PERSIAN-TYPOGRAPHY-RESEARCH.md.

- 2026-10-11 #418 source/field accessibility follow-up: Added scripts/quality/check_v3_typography_source_contract.py verifying all ten existing brand x two mode (20) theme source files share 17 baseline family/weight/size/line-height properties, including 14px/20px Base300 and six declared size steps (no 700..1000 source tokens). Added opt-in real disabled Button and invalid Persian TextField with label, aria-describedby, semantic forced colors and research-only danger styling. Chrome WASM 144/144 and locally published InteractiveServer 144/144 passed; existing stable v2 Button/field component API and CSS untouched. docs/v3/tokens/TYPOGRAPHY-SOURCE-AUDIT.md. Correct Penpot file remains suspended, authorized Figma fallback Starter quota reached; no new approved typography board claimed.

- 2026-10-11 #418 extended Edge parity: full current 144/144 Chrome CDP state/typography suite independently repeated on Microsoft Edge WASM and published InteractiveServer, both 144/144. Chrome WASM and Chrome InteractiveServer each also 144/144. Chromium shared engine; Firefox/Safari/native AT pending.

- 2026-10-11 #418 design D5 follow-up: Penpot plugin reconnected to correct Bluent v3 Design System file b64f6665-c9ab-80b5-8008-c4ac99d9d000; created page35 Persian validation/reflow 916ee53e-8991-8009-8008-c61c0754ce9d board 916ee53e-8991-8009-8008-c61c075e54cc, 44 editable native shapes, zero bounds errors, initial PNG visual inspection; latest refinement export pending. Local Noto Sans Arabic is draft comparison only, no chosen/packaged font. Updated D2 page33 board acf5f619-7d81-80da-8008-c5fec0b7ec61 with D5 open accessibility. Chrome actual AX discovered Dialog role absent, icon-only close AX name private-use glyph, focus outside after programmatic open; real open Popover Button has no aria-expanded/controls. Separate from positive 144/144 WASM and 144/144 InteractiveServer tests; do not claim AX fixed. docs/v3/tokens/D5-PORTAL-ACCESSIBILITY-AUDIT.md. Design/API and native AT review still gated; v2 Dev/NuGet unchanged.

- 2026-10-11 #418 design/AX crosscheck: re-exported final Penpot page35 board PNG after field borders/centering correction; visually inspected, 44 native shapes and zero bounds errors; Inter/preview Noto Sans Arabic fonts only. Dialog/Popover D5 four open observations independently reproduced on Chrome and Microsoft Edge both WASM and published InteractiveServer (each positive suite 144/144, AX gaps not fixed). docs/v3/tokens/D5-PORTAL-ACCESSIBILITY-AUDIT.md. Demo/theme integration unchanged, no approved global component API changes.

- 2026-10-11 #418 user-reported Penpot button visual defect: directly edited correct design file pages 34 and 35. Excel+Word buttons were auto-width/left and vertically offset, now fixed center in native Penpot. Disabled Light/Dark Persian labels and RTL multiline Reflow were visibly high; Penpot verticalAlign=center alone failed, corrected using rerendered textBounds per native label. Final offsets 5/5 horizontal 0 px / vertical <=0.21 px; all within their colored button backgrounds and visually checked exported PNG for both boards. Docs: docs/v3/tokens/PENPOT-BUTTON-LABEL-CENTERING.md. No Bluent.UI code or stable Dev changes.

- 2026-10-11 #418 D5 opt-in implementation: provisional DialogConfigurator.SetAccessibleDialog(name,closeLabel), explicit DialogConfiguration accessible fields, Dialog root role=dialog + aria-label + tabindex -1 + aria-modal if modal, Blazor ElementReference.FocusAsync on first interactive render, existing icon-only Close Button receives caller-supplied localized aria-label (tested English and Persian). Without SetAccessibleDialog legacy DOM role/aria/tabindex/Close remain unchanged. Browser Chrome+Edge both WASM/InteractiveServer 149/149 checks, NUnit 43/43, Release 0 warnings/errors. Popover expanded/controls gap, focus restoration, complete modal trap and native AT not fixed. docs/v3/tokens/D5-ACCESSIBLE-DIALOG-PROTOTYPE.md. Penpot source remains existing D2/D5 board; suspended tab prevented new design revision. PR #500 Draft, no Dev/NuGet changes.

- 2026-10-11 #418 D5 continuation: Added explicit opt-in DialogConfigurator.SetReturnFocusTargetId and safe last-dialog-only focus restoration via lazily imported minimal Bluent.UI v3 JS module (caller ID, enabled/connected target guard, no visible Dialog, new Dialog invalidates pending return). Fixed HTML-only legacy tests by lazily obtaining IJSRuntime only in opted-in path. Popover AccessibleTriggerState opt-in forwards to JS, true/false expanded plus controls owned by actual show/hide, bounded missing-transitionend fallback, safe against stale timer after reopen; nonoptin Popover still has no new ARIA. Source TS, tracked generated ESM/global bundles and static assets updated only in v3 task branch. Four real Chromium browser/Blazor runs 157/157 each, NUnit 47/47. docs/v3/tokens/D5-FOCUS-RESTORE-POPOVER-ARIA-PROTOTYPE.md. Existing Penpot D2/D5 page33 acceptance reference; attempted new page36 but plugin suspended, no new design page claimed. Nested modal trap/full AT pending. No Dev merge/NuGet publish.

- 2026-10-11 #418 D5 Modal keyboard/nested stack: New real editable Penpot page36 535db143-a732-807e-8008-c6403ec3fa0c board 535db143-a732-807e-8008-c6403f3c74af in file b64f6665-c9ab-80b5-8008-c4ac99d9d000. 35 native shapes, no board-boundary issues; five rendered label glyph centers <=0.36px difference; exported PNG visually inspected. Opt-in DialogConfigurator.SetModalKeyboardNavigation on named Modal, lazy JS keyboard owner register/unregister, DotNet Escape, Tab/ShiftTab wrap and outside recapture, nested child Escape/launcher return, repeated Escape/closing guard, normal page Tab after disposal and reduced-motion Escape. Demo V3ModalKeyboardContent with true nested IDialogService and Bluent Buttons. Real Chrome/Edge x WebAssembly/published InteractiveServer each 169/169, NUnit 48/48, Release 0 warning/error. #420 still Backlog; no final API/AT/Fluent parity claims, no Dev merge/stable NuGet. docs/v3/tokens/D5-MODAL-KEYBOARD-STACK-PROTOTYPE.md.

- 2026-10-11 #418 D5 escape priority/initial focus: correct Penpot Bluent v3 file b64f6665-c9ab-80b5-8008-c4ac99d9d000 has NEW actual editable page37 535db143-a732-807e-8008-c644769400c0, board 535db143-a732-807e-8008-c644771eb48a, 26 native shapes, zero bounds errors, exported/rendered PNG visually inspected (DRAFT). Modal keyboard listener changed from document Capture to window bubble so child control handlers can consume Escape first. Popover opted-in JS registers document-bubble Escape while visible, hides own surface before modal, restores trigger; unregistered when hidden; legacy unaffected. Explicit Dialog SetInitialFocusTargetId opt-in checks inside Dialog, visible/enabled focus candidate, otherwise root fallback. Tests cover real Popover inside modal, internal synthetic child Escape consumption, valid and external initial focus, returning launcher; Chrome+Edge x WASM/published InteractiveServer each 176/176 checks. NUnit 51/51, Release zero warnings/errors. docs/v3/tokens/D5-ESCAPE-FOCUS-PRIORITY-PROTOTYPE.md. Native AT, combo/menu variants, browser engines and final API remain OPEN; #420 Backlog, no Dev merge/stable package release.

- 2026-10-11 #418 D5 open-Popover disposal hardening: opt-in Popover class now unregisters its document Escape listener by triggerId on real Blazor component Destroy via PopoverInterop, even while its surface is open. Added live removable Popover with in-surface Remove button and CDP DOMDebugger.getEventListeners test asserting +1 active keydown listener and return to baseline after unmount. Chrome/Edge x WASM/published InteractiveServer each 177/177 passing; transient initial InteractiveServer port ERR_CONNECTION_REFUSED fully resolved on clean rerun. Same Penpot page37 D5 design remains Draft. Legacy popovers unaffected, final AT/navigation certification pending. Docs D5-ESCAPE-FOCUS-PRIORITY-PROTOTYPE.md. Task branch isolated, no Dev or stable NuGet changes.

- 2026-10-11 #418 D5 Dialog accessible naming: actual connected Penpot Bluent v3 Design System file b64f6665-c9ab-80b5-8008-c4ac99d9d000 new editable page38 535db143-a732-807e-8008-c64b3e0c419d board 535db143-a732-807e-8008-c64b3e839d5a, 22 native shapes, zero bounds issues, PNG visually checked. Draft design distinguishes standard title-bearing Dialog -> unique native h2.id and aria-labelledby vs custom RenderFragment -> existing explicit aria-label fallback, all only when opted into SetAccessibleDialog. Live Chrome/Edge x WASM/published InteractiveServer each 183/183; real Chrome AX calculated name matches visible heading; concurrent headings have unique scoped IDREFs; Persian custom fragment AX name correct. NUnit 53/53 incl two HtmlRenderer SSR tests with proper HTML entity decode, Release zero warnings/errors. Checked conventional Dev01 NVDA paths missing and MacBook3 macOS VoiceOver not running; do not claim native screen-reader tests. Docs: docs/v3/tokens/D5-DIALOG-HEADING-AX-AUDIT.md. #418 In progress/PR #500 Draft, #420 Backlog; no Dev merge/production package release.

- 2026-10-11 #418 D5 description/live-title checkpoint: real editable Penpot Bluent v3 page 535db143-a732-807e-8008-c650a310958b, board 535db143-a732-807e-8008-c650a32a10f7, 22 native shapes, zero bounds errors, reviewed actual PNG. Draft opt-in visible localized description + actual per-dialog aria-describedby linked node; standard title-bearing and custom RenderFragment distinct; real Blazor content Button updates Persian h2, Chrome AX name follows with stable aria-labelledby and description; real TextField initial focus. Found opt-in zero-duration CSS animationend close race in InteractiveServer; added once-only close fallback. Diagnosed temporary duplicate JS export by capturing real Server Circuit SyntaxError, removed and re-ran all browser tests: Chrome/Edge x actual WASM/published InteractiveServer each 190/190; NUnit 58/58; Release 0 warnings/errors. Docs docs/v3/tokens/D5-DESCRIPTION-LIVE-TITLE-AUDIT.md. Safaridriver query MacBook3 timed out, native VoiceOver/NVDA still not executed. #418 stays In progress/PR #500 Draft, #420 Backlog; no Dev merge/NuGet release.

- 2026-10-11 #418 D5 Dialog direct owner unmount: added opt-in mounted/unmounted temporary Blazor Dialog and CDP DOMDebugger window.keydown count checks (baseline,+1,baseline), three cycles, normal Tab after disposal. Fixed two new test false positives (0 treated falsey and true vs 0 comparison), verified no pre-existing leak claim. Hardened JS modal unregister by stable root ID for detached DOM. Chrome/Edge x WASM/published InteractiveServer each 194/194. MacBook3 SafariDriver status ready=true but creating Safari session requires enabling Safari Settings > Developer > Allow Remote Automation; did not modify settings, native Safari/VoiceOver not tested. Existing Penpot D5 page36 board 535db143-a732-807e-8008-c6403f3c74af is draft design basis; plugin suspended for new board and Figma fallback denied on Starter rate limit. Doc: docs/v3/tokens/D5-DIALOG-OWNER-UNMOUNT-AUDIT.md. #418 In progress PR#500 Draft, no Dev/NuGet stable publish.

- 2026-10-11 #418 D5 WebKit checkpoint: REAL Penpot Bluent v3 file b64f6665-c9ab-80b5-8008-c4ac99d9d000 NEW page 535db143-a732-807e-8008-c661af0787e1 / board 535db143-a732-807e-8008-c661af7e66a4: 26 native editable shapes, 0 board boundary errors, PNG inspected. MacBook3 SafariDriver 27.0.1 real W3C WebKit session against published task-branch Blazor InteractiveServer in disposable Git worktree (not new clone), original Dev checkout untouched. New repeatable Python stdlib scripts/quality/probe_v3_safari_webdriver.py PASSED 15/15: hydrated Blazor theme event, named modal, Tab/ShiftTab/Escape, focus restore, live Persian heading with correct IDREF and description, TextField initial focus, 3 real @if owner unmounts. Initial full probe timeout was because VoiceOver Quickstart also ended temp web host, not application bug; republished host rerun passed. VoiceOver app launched its first-run Quickstart but no observable speech/navigation; VoiceOver spoken evidence OPEN. docs/v3/tokens/D5-SAFARI-VOICEOVER-AUDIT.md. #418 In progress / PR500 Draft; no stable Dev merge/NuGet publish.

- 2026-10-11 #418 D5 page-local Dialog navigation: actual Penpot v3 page 535db143-a732-807e-8008-c66a41867ed4, native board 535db143-a732-807e-8008-c66a418dadb2, 26 native editable shapes, 0 bounds errors and reviewed PNG. RED NUnit test first proved DialogContext.ResultTCS awaited forever when route-local DialogContainer was disposed. Opt-in-only Container.Dispose now unsubscribes, settles named/keyboard-enabled pending ShowAsync as dismissed (null), clears focus/context state; a 2nd NUnit verifies legacy unconfigured Dialog remains unchanged. Real Blazor Modal child Button navigates away without Close; Chrome and Edge x locally published InteractiveServer each 197/197 checks incl old host disappearance and independent focus on new route; WASM each 194/194. Safari prior 15/15 does not yet include new navigation route, native VoiceOver first-use Quickstart still requires distinct spoken test. See docs/v3/tokens/D5-ROUTE-LOCAL-DIALOG-DISPOSAL-AUDIT.md. Truly global route-persistent Dialog owner policy still OPEN, no Dev merge/NuGet stable release.

- 2026-10-11 #418 D5 route-followup MacBook3 Safari 27.0.1/WebKit: fetched pushed task commit 8fc5d7e5 into disposable Git worktree, published true Blazor InteractiveServer locally, ran extended dependency-free W3C SafariDriver probe with **18/18 PASS** including 3 new route-local service Dialog navigation + independent destination focus assertions. Mac original Dev workspace unchanged. Chrome/Edge x WASM 194/194, Chrome/Edge x published Server 197/197; NUnit 60/60 Release. Docs D5-ROUTE-LOCAL-DIALOG-DISPOSAL-AUDIT.md and D5-SAFARI-VOICEOVER-AUDIT.md. VoiceOver still gated by first-use Quickstart; no spoken AT signoff. #418 In progress, PR500 Draft to bluent-v3 only.

- 2026-10-12 #418 native MacBook3 VoiceOver progress: Apple VoiceOver process running, Safari 27.0.1 WebKit actual release-published v3 InteractiveServer in detached temporary worktree b18f71cd, original Mac Dev checkout untouched. macOS AX tree exposed named web Dialog, h2, accessible description, Close button and focused TextField. Native VoiceOver Caption Panel directly rendered speech of a button inside web dialog. VoiceOver Control+Option+Space activated real Bluent dynamic-title Button; macOS AX heading/group and VoiceOver caption changed to Persian «تأیید درخواست - عنوان جدید», with web dialog and heading level 2 announced. THIS IS PARTIAL real spoken VoiceOver evidence, not complete AT approval: reading full description, VoiceOver close/return focus and nested Popover still open. See docs/v3/tokens/D5-VOICEOVER-OBSERVATIONS.md. #418 In progress PR500 Draft, no Dev merge or NuGet publish.

- 2026-10-12 #418 D5 Persian-first Dialog QA: Penpot Bluent v3 Design System native page 6519bd63-6e0d-802b-8008-c6ddeb6733bd board 6519bd63-6e0d-802b-8008-c6ddeb872846; 26 editable shapes, zero bounds errors and exported PNG visually checked. New v3-only real opt-in Dialog heading «بررسی درخواست مرخصی», visible Persian description incl ABC-123, localized icon Close «بستن پنجره», actual TextField focus and explicit focus return. Chrome/Edge x WASM each 198/198; Chrome/Edge published InteractiveServer each 201/201; Release NUnit 60/60, SSR 4/4, zero warnings/errors. New Safari W3C probe +4 checks syntax-valid but actual WebKit run BLOCKED: MacBook3 disconnected mid-test, then SafariDriver returned Allow Remote Automation disabled. Native VoiceOver spoken full description/Close return NOT reverified, previous Persian dynamic heading Caption Panel proof unchanged. See docs/v3/tokens/D5-PERSIAN-VOICEOVER-CLOSE-AUDIT.md. Commits only to isolated v3 draft PR#500, no stable Dev/NuGet.

- 2026-10-12 #418 pointer/keyboard focus evidence: added real CDP mouse press/release vs subsequent Tab focus-visible regression to the opt-in #418/#501 Blazor integration lab; 201/201 WebAssembly rerun and 204/204 published InteractiveServer pass on Dev01 Chrome. Original probe ordering caused reproducible Edge scoped-Dialog close timeouts; isolated focus gesture after Dialog teardown. Chrome/Edge x WASM 201/201 and x InteractiveServer 204/204 all pass; full independent repeat stability remains unproven. Only test/docs in v3 task branch, no accepted #501 variants, no stable Dev/NuGet changes. See docs/v3/tokens/README.md.

- 2026-10-12 #418 source CSS hardening: shared strict emitted-theme parser for both v3-only token and brand-scope generators, with 8 positive/negative unit tests covering real 20 x 450 matrix, comments, duplicate/wrong-mode/malformed/extra rules; generated preview outputs identical, no stable changes. Dedicated read-only v3 task/PR CI added in .github/workflows/v3-token-contract.yml. docs/v3/tokens/README.md.

- 2026-10-12 #418 Button face center QA: real Blazor/CDP measures Persian label and Fluent icon centers against button face at normal, 200%, 400% text size (320px RTL for enlarged text). Chrome/Edge WASM 206/206 each, published InteractiveServer 209/209 each; normal CSS box offset 0px. Visual/native Penpot #501 and glyph ink not certified. Source scripts/quality/probe_v3_blazor_runtime.mjs; docs/v3/tokens/README.md.

- 2026-10-12 #418 correction of prior Button geometry proof: previous selector could measure hidden regular icon (0x0) while filled active icon showed; updated real Chrome CDP to select visible nonzero bui-icon and assert measurable 20x20 box, containment, RTL ordering, 200%/400% zoom, pointer/keyboard Shift+Tab and forced-colors focus without layout shift. Four Chrome/Edge WASM 220/220, InteractiveServer 223/223 passed. This supersedes earlier icon centering claims based only on potentially hidden element. Native Penpot #501 rings, OS AT and ink geometry NOT certified. Details docs/v3/tokens/README.md.

- 2026-10-12 #418 CI extension: added restricted Windows GitHub Actions four-way Chrome/Edge x WASM/InteractiveServer matrix for the actual v3-only headless/CDP Blazor research lab. Runs only v3-targeted PRs when relevant files change, or by manual dispatch; no stable Dev/release publication. This commit is a workflow proposal until GitHub job results have been inspected. See docs/v3/tokens/README.md.

- 2026-10-12 #418/#501 added real opt-in RTL Button focus research matrix in V3StylingLab for six legacy appearances (Default, Primary, Danger, Outline, Subtle, Transparent), disabled and keyboard path sentinel. Native CDP Tab/Shift+Tab tests focus-visible, >=2px outline, no geometry shift, disabled skip and forced-colors emulation. Dev01 Chrome+Edge WASM 240/240 each, interactive Server 243/243 each; no Bluent.UI shipping CSS/API changes. Existing Penpot #501 focus overlay approval and native OS AT remain open. See docs/v3/tokens/README.md.

- 2026-10-12 #418/#501: added real browser Focus+Hover and Focus+Space-Pressed tests across six current Bluent Button appearances and six Toggled=true Selected+Focus fixtures, with a representative selected+hover+focus and keyboard Space toggle baseline. Chrome+Edge WASM 278/278; Server 281/281. Confirmed important baseline defect: nullable Toggled visual state is NOT mapped to aria-pressed on any of six Buttons, openly reported by probe as unresolved #428 accessibility gate. No shipped Button code changed. See docs/v3/tokens/BUTTON-FOCUS-INTERACTION-MATRIX.md.

- 2026-10-12 #418/#501: real focused Button CSS adjacent surface contrast audited across 10 brands x 2 modes. Current ring <3:1 in all 10 dark modes (1.94-2.15); explicit opt-in candidate using existing Fluent --colorStrokeFocus2 passes 20/20 with minimum 14.55, forced-colors Highlight retained. Dev01 Chrome/Edge WASM 320/320 and Server 323/323; one initial Chrome Server attempt failed but rerun succeeded, reliability not certified. Both original dark contrast deficit and #428 missing aria-pressed remain machine-reported accessibility gaps. Source docs/v3/tokens/FOCUS-RING-CONTRAST-CANDIDATE.md. No default/shipping style change.

- 2026-10-15 #418 added real EventCallback theme/brand rerender coverage
  (Excel/default x Light/Dark, five native focused Buttons per case and
  independent Word scope). Earlier direct-DOM test mutations are explicitly
  resynchronized via Blazor controls. Windows CDP launcher now tolerates
  a detached exit-0 Chromium process and cleans only unique QA profiles.
  Local Dev01 Chrome and Edge WASM: 868/868 each, zero failures.
  Release -warnaserror build 0 errors/warnings, six contract tests and
  token generator check pass. Approved Penpot #501 reference unchanged.
  #418 In progress; exact-head CI, native Windows contrast/AT and final
  public API acceptance still pending.

- 2026-10-15 #418 real nested Word Focus fixture added inside an independently
  owned Word Light/Dark product theme host. Approved neutral Focus alias is
  computed from Word's own source brand/mode rather than Excel/default parent.
  Browser UI clicks verify five parent focus cards and Word focused Button,
  opposite host modes; Chrome/Edge WASM 868/868 local each. Debug build zero
  warnings/errors, six Focus token contract tests passed. Opt-in demo only;
  original Penpot accepted design unchanged, no public Button API or stable
  Dev/NuGet modifications. See Focus host token crosswalk.

- 2026-10-15 #418 detached Word Popover Focus QA: opt-in Demo.Pages-only CSS
  for the real Word-owned Button in an actual global detached Popover; tests
  verify inherited source tokens, keyboard-generated focus-visible, 2px
  outline / 2px offset, >=3:1 host contrast, and forced-colors Highlight.
  The probe also waits for actual completed CSS transitions instead of
  sampling arbitrary in-flight brand/danger colors. Chrome WASM and Edge
  WASM each 870/870, zero failures. Release -warnaserror build 0 warnings/errors,
  six focus contract tests, token check and 61 .NET tests passed. Penpot approved Focus source unchanged; public Button API,
  native OS/AT and stable Dev/NuGet untouched. See Focus host crosswalk.

- 2026-10-15 #418 exact CI diagnostic: Chrome/Server on 075f98f4 failed one
  CDP platform-Persian-font-family assertion (empty glyph-family telemetry),
  while Dev01 real Chrome/Server ran 869/869. Added typed standalone
  fail-closed font-evidence policy and 5 positive/negative Node tests.
  Browser now reports either genuine positive glyph telemetry or explicit
  semantic-layout-only evidence with an unresolved native-font visual
  acceptance gap, never inferred font-family proof. CI runs these tests
  independently on all browser matrix jobs; no font files imported.
  Dev01 Chrome/InteractiveServer new policy 869/869 passed; real Segoe UI
  50 glyphs reported. See docs/v3/tokens/PERSIAN-TYPOGRAPHY-RESEARCH.md.
  The original failed job stays failed historically; next exact-head CI required.

- 2026-10-15 #418 reconnected correct Penpot Bluent v3 file; new page 42 / board e775e67c-d9da-804b-8008-cb84059cbdab (revision 377). Native research board contains 29 editable shapes, eight token-bound bilingual size specimens, zero bounds overflow; actual PNG exported and visually reviewed. Added repeatable read-only Penpot validation script, documentation and Skill. The fonts Inter/Noto Sans Arabic remain Penpot preview only; runtime font fallback/AT/reviewer signoff not approved. No CSS/public API, stable Dev or NuGet changes.

- 2026-10-15 #418 native Penpot fontFamilies raw serialization defect established in Bluent file (rev. 386): original #419 draft Segoe UI resolves Segoe,UI; temporary isolated set proved quoted multiword family resolves Segoe UI and was removed. Research board page42 visibly labels risk (30 shapes); native audit detects source drift and does not claim typography acceptance. Original #419 sets and stable Dev/NuGet untouched. Full native token audits on live file: alias 48/48, 10-brand source matrix 60/60, 20 selectable themes 80/80, focus host 40/40, field Focus 29/29; pre-warning font board 8/8. Focus host audit includes EXPECTED contrast FAIL samples; those are NOT a WCAG pass.

- 2026-10-16 #418 maintainer approved existing Segoe UI-first system fallback
  and no bundled fonts. Corrected original native Penpot token
  bluent.type.family.base: quoted multiword source now resolves as Segoe UI,
  not Segoe,UI; other tokens untouched. Penpot page42 explicitly shows
  format fix yet retains glyph/AT acceptance gate. Read-only Penpot audit
  now fails on serialization regression. Also confirmed previous
  GitHub Edge/Server browser CI 869/869 assertions passed; only owned
  browser cleanup powershell.exe ETIMEDOUT, now hardened using asynchronous
  bounded verification with a single scoped CIM enumeration.

- 2026-10-16 #418 approved system-font continuity is an executable
  v1 source+asset contract: issue-418-system-font-continuity.json,
  audit_v3_system_font_continuity.py and 7 negative-control Python tests.
  CI Token Contract now checks all 20 CSS theme variants and excludes
  added text font binaries, while allowing three legacy Fluent icon
  font files. New migration/rollback instructions distinguish live Penpot
  readback from CI manifest; native Persian glyph/AT still unapproved.
  Stable Dev/NuGet font assets unchanged.

- 2026-10-16 #418 NuGet package font boundary now rejects all new font
  binaries regardless of zip directory, allows three historical Fluent
  icon assets, and has 9/9 NuGet negative/positive source tests.
  Separate source and package asset checks prevent silent font bundling.

- 2026-10-17 #418 translucent host Focus audit: 10 brands x Light/Dark x 2 actual RGBA alpha roles x 2 opaque underlays = 80 source scenarios. **10/80 Light Brand underlay/NeutralBackgroundAlpha(.5) have BOTH brand and inverse-white rings below 3:1** (default composed #89B3DA, 2.627/2.205). Nine source Python tests PASS. Actual isolated Chrome CDP computed 80/80 and Edge CDP 80/80 with no errors or leaked processes. Opaque native Penpot design approval unchanged; disconnected plugin so no new source design edit/signoff. New v3-token and v3-browser-workflow gates fail closed; exact-head CI pending. No public CSS/API/stable Dev/NuGet changes.

- 2026-10-17 #418 Focus2 alpha-only design study: real emitted Focus2 black Light/white Dark >=8.511:1 across 80 source composited hosts (0/80 below 3:1), while brand+white dual-failure remains 10/80. Added 3 strict tests for 12/12 alpha source gates, real isolated Chrome/Edge computed actual alpha/underlay and Focus2 2px outline/offset 80/80 each, browser cleanup 0. Editable Figma 10-brand Source visual board 38:2 verified/corrected source ratios and screenshot visually inspected. Candidate is DRAFT explicit alpha-only; no authorized Penpot production design/public CSS/AT signoff, #418 In progress and PR #500 Draft, stable Dev/NuGet untouched.

- 2026-10-17 #418 actual Bluent alpha-focus candidate demo: task-only Styling Lab now mounts two real Bluent Buttons on Brand-overlaid-with-actual-colorNeutralBackgroundAlpha, one branded ring and one Focus2 candidate, with keyboard entry/exit sentinels; page-local CSS, RTL Persian, forced-colors system Highlight fallback. Existing real CDP Blazor browser matrix expanded +70 checks/mode: 10 brands x Light/Dark native Tab, 2px focus-visible ring brand/Focus2 source ownership and measured alpha-composed HOST contrast, plus ten known Branded <3:1 Light risk reproductions. First test failed only hex minification (#000/#fff vs authored #000000/#FFFFFF), normalized RGB comparison corrected; Dev01 final Chrome/WASM 940/940, Edge/WASM 940/940, Chrome/published Server 939/939, Edge/published Server 939/939, aggregate 3,758/3,758 actual browser PASS. 14 alpha source tests and v3 docs PASS. Figma draft board 38:2 remains research; Penpot production design/OS AT not approved; #418 In progress/#428 Backlog, stable Dev/NuGet untouched, exact SHA CI pending.

- 2026-10-17 #418 real Bluent alpha-host keyboard/Forced Colors gate: native CDP Tab through branded and Focus2 actual demo Buttons for 20 brand/theme contexts; Chromium forced-colors:active emulation checks real Highlight outline 2px + 2px gap, Canvas alpha/underlay and CanvasText border for both samples in Light/Dark. First browser run found test-state bug hardcoding Light, fixed by saving/restoring actual previous theme. Chrome/WASM and Edge/WASM actual Blazor 942/942 EACH PASS; 20/20 fail-closed Python source tests PASS. Only demo opt-in; no approved Penpot/product CSS, real native OS/AT or stable Dev/NuGet release, CI pending, #418 In progress, PR #500 Draft.

- 2026-10-17 #418 real Bluent alpha screenshot pixels: enhanced four-mode native keyboard browser probe with actual PNG Page.captureScreenshot and in-browser Image/Canvas getImageData, painted outer ring and nearby alpha-composited host pixels, Focus2 screenshot >=3:1 vs known Light Brand <3:1, four samples per job (Brand/Focus2 x Light/Dark). Initial local Chrome/WASM **950/950 PASS**, zero failures, 22/22 source alpha tests. Edge/Server and exact-head GitHub CI pending; no approved production public CSS, Penpot, Windows AT, stable Dev/NuGet changes.

- Independent local Dev01 **Edge/WebAssembly** actual Blazor
  950/950 PASS (including four screenshot Focus2/Brand
  pixel comparisons), zero failed assertions. Together
  Chrome/WASM and Edge/WASM are **1900/1900** real local
  browser checks. The forthcoming exact-head
  GitHub CI must verify both production-published
  Server jobs and independent Windows browser jobs;
  no native OS/AT or Penpot acceptance inferred.

- 2026-10-25 #418 exact-head verification on `78e1bf3dc1c806202e2ec9fbc03d39f612ad5602`: all six required GitHub Actions workflows passed (real browser lab, token contract, documentation contract, local package boundary, public component census, Button-focus design contract). Re-ran the current checkout: Release build with `--warnaserror` **0 warnings / 0 errors**, .NET tests **61/61**, token-preview generator check **PASS** (20 brand/mode combinations × 35 logical tokens), token-demo asset sync **PASS**, v3 docs contract **0 findings**, `git diff --check` **PASS**. PR #500 is open and non-draft, base `bluent-v3`; GitHub returned no submitted PR reviews or inline review threads. Dev01 Windows native-environment inventory: Windows 11 Pro build 28000, `SystemParametersInfo(SPI_GETHIGHCONTRAST)` says High Contrast is OFF; Narrator is installed but not running and NVDA is not installed. This is not native AT signoff. Authoritative Penpot plugin remains suspended and Figma MCP authoring is rate-limited; the existing Figma materials remain research-only until actual design review. Keep #418 at its last recorded Project #5 status Review and verify the real Status field before any transition. Remaining blockers: accepted editable design/token mapping and real native Windows Contrast Themes/AT evidence. Keep PR #500 open; no merge, stable release or package publishing.

- 2026-10-25 #418 native accessibility QA correction (build/code branch `e61c31381160ed099b073dcda735deb6ea552093`): official `node scripts/quality/probe_v3_blazor_runtime.mjs` completed **950/950** real Blazor WebAssembly Chrome/CDP assertions (0 failed, errors=[]). A separate temporary native Windows High Contrast run used actual OS High Contrast (SPI flag 127) with headful Edge and no DevTools media emulation; **6/6 assertions passed** for the real Bluent Button focus ring matching native `Highlight` (`rgb(142, 227, 240)`), native `forced-colors:active`, keyboard Tab focus, and invalid TextField ARIA linkage. The High Contrast flag/registry were restored exactly to pre-test (`Flags=126`, active OFF, blank scheme values); local WASM server was stopped. Narrator/NVDA were not exercised. The zero-byte stub `scripts/quality/probe_v3_component_lab.mjs` was deleted from #418 and the real 152,137-byte #421 probe remains untouched. Final editable design/token approval and screen-reader acceptance remain open; no product API/public CSS, stable `Dev`, NuGet or release changed.
