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
- 2026-10-16 #421 Component Lab entered Ready then In progress in
  actual Project #5 at maintainer direction to begin component work.
  Dedicated v3/issue-421-component-lab worktree off bluent-v3
  2c37dbef. Native Penpot page42 has desktop/mobile draft boards.
  Actual Blazor searchable four-family pilot with Button/Icon/
  Label/Link and real controls, Razor source + machine-readable
  explicitly incomplete coverage file. Real Dev01 Chrome/WASM
  9/9 passed, width320 scrollWidth320; QA Chrome cleanup remaining=0.
  Release solution build 0 errors but 2 known NU1903 advisories in
  existing WebAssembly.Server 10.0.7. #421 work remains partial;
  #428 Button remains Backlog pending approved foundation gates.

- 2026-10-16 #421 canonical 66-family tracking QUEUE added
  at docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json,
  generated from exact #494 candidate manifest (issue #428-#493).
  Four pilot scenarios exist, two actual Chrome/WASM interaction
  verified. All 66 families still need per-API full demos,
  visual parity, browser-mode and native OS acceptance. The
  queue is NOT complete component implementation or release
  proof. Source paths/issue mapping now guarded by CI.


- 2026-10-16 #421: canonical 66 source families now actually
  integrated in the Component Lab screen. Machine-generated
  C# queue mirrors #494 candidate sources; 4 representative
  live pilots, 62 queued entries with real #428-#493 GitHub
  issue links, searchable by family or issue number. Penpot
  original page42 desktop/mobile boards include draft queue
  cards; live Penpot 2/2 geometry check passed (rev426).
  Chrome/WASM 17/17 and Edge/WASM 17/17 real UI browser tests
  pass queue rendering, search #432 vs #428, pilot launch and
  narrow 320px reflow; owned browser cleanups remaining zero.
  Consumer/public API, all 66 complete demos, design approval,
  Server render modes and native AT NOT accepted. Full
  solution Release build 0 errors, existing two NU1903
  advisories from WASM.Server 10.0.7. #421 PR remains Draft.

- 2026-10-16 #421 render-mode QA follow-up: page42 desktop/mobile
  native Penpot boards now describe the draft Server mode gate.
  Component Lab OnAfterRenderAsync hydration marker added; real
  Dev01 Chrome WebAssembly 17/17 passed again (66-family queue
  and four real pilot specimens intact). Added QA-only SSR
  shared-component wrapper and isolated Publish-mode runner.
  Actual Dev01 SSR page HTTP200 but no interactivity; dev host
  missing asset files, published host window.Blazor undefined,
  data-lab-interactive=false, app.css HTTP404. Server is NOT
  verified or added to accepted CI/coverage. Detailed evidence:
  docs/v3/quality/COMPONENT-LAB-RENDER-MODES.md.
  Existing NU1903 advisories not hidden.
- 2026-10-16 #421 existing-API Button explorer: Penpot page42
  desktop/mobile draft source shapes already cover the selector concept.
  Actual Blazor Appearance/Size/Shape selectors and code example now
  change dynamically. Dev01 Chrome/WASM 20/20 and Edge/WASM 20/20,
  including queue and mobile checks; browser cleanup remaining 0.
  The four families are PILOTS only; 62 others remain queued.
  SSR Production Published still HTTP200 without interactivity:
  window.Blazor undefined, app.css 404. Do not claim Server passed.
  Existing NU1903 10.0.7 high-severity advisories unsuppressed.
  Release build 0 errors/2 warnings, -warnaserror failed correctly.
  PR #551 Draft, issue #421 In progress, Dev stable untouched.

- 2026-10-16 #421 Component Lab pilot: local Dev01 actual Chrome/Edge x WebAssembly/published InteractiveServer = **22/22 per browser/mode** (88 live browser checks in four isolated runs). Production publish host bootstrap fixed by setting process working directory to published content root; nonexistent SSR app.css request removed; strengthened fail-closed runtime JS/CSS/exception checks. Automatic GitHub Actions matrix now requests four jobs (exact SHA result not yet asserted). Four representative live pilots / 66-family source queue, not API coverage or completed component acceptance. QA-owned Chromium remaining=0 all modes. Preexisting SSR 10.0.7 NU1903 high-severity advisories remain unsuppressed. PR #551 Draft to bluent-v3 only; stable Dev/NuGet unchanged.

- 2026-10-16 follow-up #421: GitHub Actions previous aac0d057 exact-head runs 38946521658 and 38946530029 completed **8/8 passed**. Strengthened real Chrome/Edge x WebAssembly/published InteractiveServer Component Lab keyboard/clipboard/Button smoke from 22 to **27/27 per mode (108/108 local)**; CDP pointer target validation fixed a test-only animated-scroll sidebar misclick; native Enter includes carriage-return text and asserts exactly one callback; disabled is natively unfocusable; actual Clipboard write returns success. Correct source-owned Penpot page 42 desktop annotations updated without overflow. 4 representative live pilots / 66-family queue, status remains pilot_incomplete, design/AT/API acceptance not claimed. New SHA CI must pass independently; no stable release.
