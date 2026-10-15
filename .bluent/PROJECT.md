# Bluent Project Status

This file is the current project-state entry point. Historical sprint/relaunch detail that previously accumulated here is preserved in [`PROJECT-HISTORY-2026-08-29.md`](PROJECT-HISTORY-2026-08-29.md) and in the versioned sprint plans under `.bluent/sprints/`.

## Parallel v3 foundation (isolated development)

**Epic:** [#416](https://github.com/vrassouli/Bluent/issues/416), all work in the protected `bluent-v3` integration branch and issue-specific task branches. **Stable `Dev`, NuGet and deployments remain untouched.**

**#417 CSS architecture:** [ADR D1–D5 accepted 2026-10-11](../docs/v3/architecture/ADR-0001-styling-boundaries.md), [PR #498](https://github.com/vrassouli/Bluent/pull/498) merged into **`bluent-v3` only** (squash `3988195e`), GitHub Project **Done**, issue closed. [Browser CSS probe](../scripts/quality/probe_v3_consumer_css_overrides.py), [published SSR smoke](../scripts/quality/probe_v3_ssr_publish.ps1) and [migration compatibility risks](../docs/v3/architecture/css-migration-impact-ledger.md) underpin the accepted architectural direction. This does **not** approve exact final #418 token names, general Fluent parity or runtime accessibility.

**#419 editable design library:** [Review PR #499](https://github.com/vrassouli/Bluent/pull/499) contains an independent project-owned `Bluent v3 Design System` Penpot file and verifiable linked Fluent source/library research. The imported `Microsoft Fluent 2 Web (Community)` remains read-only. [Working Penpot manifest](../docs/v3/design/penpot-workspace.manifest.json): 27 editable pages, 65 core native variants + 16 research fixtures and alignment/RTL/size stress evidence. Issue #419 remains **Review**, not Done; accept/merge only to `bluent-v3` following review.

**#418 token system:** Next foundation task after acceptance of D1–D5. Must enter Ready only after design-first, source-to-token mapping and 10-brand Light/Dark/RTL/high-contrast acceptance goals are traceable. Token/brand decisions and implementation require a dedicated `v3/issue-418-...` branch and PR.

**Design rule:** use [Penpot first / Figma authorized fallback](../docs/v3/PENPOT-WORKFLOW.md), record real design file/page/variant IDs in relevant issue/PR. The original [Microsoft Fluent 2 Web Figma reference](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD) must not be edited. Independent editable [Bluent v3 architecture Figma research](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) is supplementary, not final font/token/browser design sign-off.

**#420 interop progress (2026-10-15):** real v3 task-branch changes replace AudioCapture.Stop/Overflow.Init fire-and-forget with awaited Task lifecycle and independently cleaned up JS handles; remaining 3 async void / 6 broad catches. Real compiled-DLL fake-JS harness 55 pass; component real browser/AT and Popover event semantics remain open. See ADR-0002 / draft PR.

**#420 interaction foundations (2026-10-15, In progress):** [Proposed ADR-0002](../docs/v3/architecture/ADR-0002-interaction-primitives.md) source-audits legacy async void/Exception swallow in interops (five methods, eleven broad catches) and supplies a compiled existing-public-API Blazor form sample. JS lifecycle, focus restore, portalled overlays and component API contract still need a real dedicated design-tool artifact and runtime/AT signoff. No production APIs changed on this task branch.

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

2026-10-15 additional #420 v3-only Popover lifecycle fix: child + module + DotNetObjectReference Dispose independent and all five PopoverService event subscriptions released in finally under both disconnect and unexpected JS errors. 47 compiled fake-JS lifecycle assertions passed; synchronous Popover service callback API still awaiting design/browser tests. No stable Dev/v2 public merge.


2026-10-15 #420 DataGrid follow-up: internal JS child/module and callback disposal independent under errors, DataGrid component base cleanup from finally, real compiled DataGrid<string> harness checks added (55 cumulative); 3 async void/6 typed broad catches + 2 bare catches still tracked, no v2 release.


2026-10-15 #420 source guard now protects both typed catch(Exception) (6) and bare catch{} (2) across real Interops, instead of missing the two untyped DataGrid/Popover error swallows. 14 negative/positive Python tests, with 55 real compiled mocked-JS assertions. Browser/OS-AT, public event semantics remain outstanding.


2026-10-15 #420 actual pointer/Theme fixes on v3/issue-420-interaction-primitives: DomHelper pointer callbacks now keyed by ID and disposed promptly at Unregister/replacement/failure; independently cleans JS module/proxy and all pointers on teardown; BluentTheme only swallows expected disconnection, Overflow always invokes base Dispose in finally. Compiled Bluent.UI harness 89 real .NET fake-JS assertions, source debt 3 async void/1 typed broad catch/2 untyped catch; full browser pointer/Popover focus and Penpot #420 signoff still pending. #425 PR #549 independently passes Chrome/Edge Server/WASM in actual GitHub CI, but not a substitute for #420 component acceptance.


2026-10-15 Penpot correctly connected to canonical Bluent v3 file b64f6665-c9ab-80b5-8008-c4ac99d9d000: new editable #420 interaction/lifetime draft page ed5216bd-3d5b-8015-8008-cb247e27efb4, board ed5216bd-3d5b-8015-8008-cb247e906204 with 51 source-owned shapes and four flow sections. This resolves a missing draft board but NOT maintainer design signoff or real Chrome/Edge overlay/AT acceptance. Do not declare #420 Done merely from a board.


2026-10-15 newest #420 source checkpoint: zero remaining async void / catch(Exception) / catch{} across the eight audited Bluent.UI Interops + DomHelper files, down from 5 typed async void, 11 typed broad catches plus two bare catches originally. Public sync IPopoverService and protected Overflow.CheckOverflow retained; private Popover ordered JS queue and deferred Overflow checks awaited in Blazor render lifecycle. Actual compiled DLL fake JS 115 assertions, source guard 18 Python tests, real Dev01 interactive WASM Popover Chrome 7/7 and Edge 7/7 incl manual Show and Close. Dedicated Chrome/Edge Windows CI jobs added to draft #420 PR. Penpot reviewer acceptance, Server-mode Popover keyboard/focus return and native OS/AT remain open before Review/Done.


2026-10-15 newest #420 interactive Server verification: dedicated SSR QA-only /compatibility/popover-server with real InteractiveServer Popovers + Containers, real Chrome and Edge both 7/7. With real standalone WebAssembly Chrome/Edge each 7/7 the Popover matrix is 28/28 on Dev01; QA harness launches real Release-published Production SSR and Debug-root WASM as appropriate, four GitHub Windows CI jobs configured. No public component API change. Browser focus restoration/Escape, native Contrast Themes/screen reader and maintainer Penpot design parity remain open; #420 Draft until acceptance.


2026-10-15 #420 latest focus/JS lifecycle: Escape closes topmost non-modal Popover and restores trigger focus; outside click does not steal focus. Explicit JS Popover.dispose removes trigger/click/keyboard listeners, ResizeObservers and Floating UI updater; real C# PopoverInterop calls it before proxy disposal. Full Chrome/Edge x WASM/Server local matrix 40/40 real interactions; compiled fake-JS .NET 123 assertions; 19 source Python tests. Static webpack ESM/global outputs and maps mirrored to Bluent.UI wwwroot; new npm CI builds and checks reproducibility. Still Draft/In progress until canonical Penpot approval, other overlays and native Windows Contrast/AT acceptance.


2026-10-15 latest #420 per-surface geometry correction: replaced singleton JS ResizeObservers/MutationObserver/Floating UI cleanup with per-triggerId Map resources, so multiple simultaneous Popovers do not disable each other's updates. Added real QA stack fixture with two SameWidth overlays and SSR host; browser waits for interactive ready and fires OpenBoth once. Dev01 Chrome/Edge × InteractiveServer/WASM **68/68 real browser checks** verify stack, LIFO Escape focus and independent ResizeObserver while sibling stays open, plus earlier show/hide/keyboard. Snapshots/JSON produced; new exact GitHub SHA requires independent CI. Original #420 Penpot draft remains awaiting maintainer approval, and native Windows Contrast/AT/other overlays remain separate.
