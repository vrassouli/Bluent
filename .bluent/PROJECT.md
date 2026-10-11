# Bluent Project Status

This file is the current project-state entry point. Historical sprint/relaunch detail that previously accumulated here is preserved in [`PROJECT-HISTORY-2026-08-29.md`](PROJECT-HISTORY-2026-08-29.md) and in the versioned sprint plans under `.bluent/sprints/`.

## Parallel v3 foundation (isolated development)

**Epic:** [#416](https://github.com/vrassouli/Bluent/issues/416), all work in the protected `bluent-v3` integration branch and issue-specific task branches. **Stable `Dev`, NuGet and deployments remain untouched.**

**#417 CSS architecture:** [ADR D1–D5 accepted 2026-10-11](../docs/v3/architecture/ADR-0001-styling-boundaries.md), [PR #498](https://github.com/vrassouli/Bluent/pull/498) merged into **`bluent-v3` only** (squash `3988195e`), GitHub Project **Done**, issue closed. [Browser CSS probe](../scripts/quality/probe_v3_consumer_css_overrides.py), [published SSR smoke](../scripts/quality/probe_v3_ssr_publish.ps1) and [migration compatibility risks](../docs/v3/architecture/css-migration-impact-ledger.md) underpin the accepted architectural direction. This does **not** approve exact final #418 token names, general Fluent parity or runtime accessibility.

**#419 editable design library:** [Review PR #499](https://github.com/vrassouli/Bluent/pull/499) contains an independent project-owned `Bluent v3 Design System` Penpot file and verifiable linked Fluent source/library research. The imported `Microsoft Fluent 2 Web (Community)` remains read-only. [Working Penpot manifest](../docs/v3/design/penpot-workspace.manifest.json): 27 editable pages, 65 core native variants + 16 research fixtures and alignment/RTL/size stress evidence. Issue #419 remains **Review**, not Done; accept/merge only to `bluent-v3` following review.

**#418 token system:** Next foundation task after acceptance of D1–D5. Must enter Ready only after design-first, source-to-token mapping and 10-brand Light/Dark/RTL/high-contrast acceptance goals are traceable. Token/brand decisions and implementation require a dedicated `v3/issue-418-...` branch and PR.

**Design rule:** use [Penpot first / Figma authorized fallback](../docs/v3/PENPOT-WORKFLOW.md), record real design file/page/variant IDs in relevant issue/PR. The original [Microsoft Fluent 2 Web Figma reference](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD) must not be edited. Independent editable [Bluent v3 architecture Figma research](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) is supplementary, not final font/token/browser design sign-off.

**GitHub workflow:** [Backlog → Ready → In progress → Review → Done](../docs/v3/ISSUE-WORKFLOW.md). No task automatically merges to `Dev` before the complete v3 epic is accepted and separately authorized.

## Current Phase

**Phase:** AI readiness and consumer usability
**Current Work:** Issue #406 — canonical Bluent consumer skill
**Status:** Implementation and acceptance evidence complete; PR review-readiness confirmation in progress
**Working Branch:** `docs/issue-406-consumer-skill`
**Pull Request:** [#407](https://github.com/vrassouli/Bluent/pull/407) — Draft pending final evidence-only CI
**Tracking Issue:** [#406](https://github.com/vrassouli/Bluent/issues/406)
**Product/API Gap Backlog:** [#411](https://github.com/vrassouli/Bluent/issues/411)

## Current Outcome

- `.agents/skills/bluent/` provides a portable, retrieval-oriented Bluent-first consumer skill.
- Canonical documentation remains the API/behavior source of truth; the skill is a router rather than a duplicated encyclopedia.
- The source-reconciled consumer inventory contains 65 retrieval families and all 65 are source verified:
  - 57 `Bluent.UI` families;
  - 2 Charts families;
  - 2 Diagrams families;
  - 4 Utilities families.
- `docs/components/consumer-api-surface.md` classifies service/container/helper/configuration APIs separately from ordinary component families.
- `scripts/quality/check_consumer_skill.py` deterministically checks main-UI source/inventory drift, required skill structure, and canonical index routes in Quality CI.
- `samples/Bluent.TaskExamples` contains representative dogfood scenarios, including Tree selection/DnD contracts and Utilities busy-indicator registration/usage.
- `docs/ai/bluent-consumer-skill-dogfood.md` records scenario coverage and runtime boundaries.
- `docs/ai/issue-406-acceptance.md` maps #406 acceptance criteria to repository evidence.
- Product/API/runtime/accessibility defects discovered during verification are tracked in #411 instead of being silently changed in #406.

## Validation State

Quality run #199 and Release packages run #546 both passed on PR head `d6b8176e5e30ee96340344287baf6338e6a55dd0` after the complete implementation, inventory/link reconciliation, dogfood work, project-state refresh, and acceptance audit.

Quality #199 verified:

- tool/solution restore;
- zero-warning Release solution build;
- canonical TaskExamples compilation and the DrawerContent collision negative control;
- consumer-skill coverage/drift validation;
- solution tests;
- release-tool tests;
- packing/validation of all five public packages;
- local Markdown-link validation;
- workflow YAML parsing;
- focused rendered accessibility checks;
- changed-line whitespace validation.

Release packages #546 verified the exact-ref Release build/tests, all five packages, package metadata/dependencies, deterministic release notes, and artifact upload. NuGet publication and GitHub Release jobs remained skipped; no package, tag, or release was published.

This commit only records the resulting evidence/state. One final CI pass on the evidence-only head is required before changing PR #407 from Draft to review-ready.

Existing runtime evidence in `docs/compatibility/hosting-and-render-modes.md` verifies representative Drawer, Popover, Tooltip, Chart, Diagram, navigation, disposal, overlay, and DOM-measurement behavior in the named interactive modes. That evidence must not be generalized into component-wide/browser-wide accessibility guarantees.

## Current Operational Files

- `.bluent/HANDOFF.md` — immediate #406 continuation instructions.
- `.bluent/QUALITY.md` — validation vocabulary, baseline policy, and #406-specific gate.
- `docs/components/inventory.md` — current 65-family consumer retrieval ledger.
- `.agents/skills/bluent/SKILL.md` — portable skill entry point.
- `.agents/skills/bluent/COMPONENT-INDEX.md` — targeted family routing.
- `docs/components/consumer-api-surface.md` — non-component consumer API classification.
- `docs/ai/bluent-consumer-skill-dogfood.md` — dogfood scenario matrix.
- `docs/ai/issue-406-acceptance.md` — acceptance evidence audit.
- `docs/compatibility/hosting-and-render-modes.md` — runtime/render-mode evidence.

## Remaining #406 Work

1. Confirm Quality and Release-package workflows on this evidence-only head.
2. Refresh PR #407 with exact final-head workflow evidence and mark it review-ready if those checks pass.
3. Keep runtime-sensitive limitations explicitly bounded where browser evidence is absent.
4. Keep #411 open for product/API gaps found during or after the skill work.
5. Do not merge PR #407 or close #406 as part of the implementation task.

## Working Agreement

- Do not invent public APIs, support claims, render modes, assets, or accessibility behavior.
- Keep canonical docs authoritative and the consumer skill retrieval-oriented.
- Prefer Bluent components for user-facing interactive UI where Bluent has a suitable equivalent.
- Preserve public API consistency; product/API fixes discovered while documenting #406 require separate approval/work.
- Record validation at the evidence level actually exercised: source, build, test, pack, runtime, visual, or deployment.
- Update this file, `.bluent/HANDOFF.md`, the tracking issue, and PR when active project status materially changes.
- Do not merge, publish packages, tag/release, or close #406 unless separately instructed.

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
