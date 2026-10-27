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
## Latest v3 Button execution checkpoint — 2026-10-26

Issue [#428](https://github.com/vrassouli/Bluent/issues/428) is now In progress on the isolated `v3/issue-428-button-p0` task branch, based on `bluent-v3`. The first non-visual slice implements truthful native Button toggle semantics: when `Toggled` has a value, component-owned `aria-pressed` reflects that value and overrides contradictory caller attributes; when `Toggled` is null, caller state passes through; anchors receive no generated toggle state. No CSS, semantic color, focus token, public parameter, or stable v2 asset changed.

Local evidence: Release renderer tests **29/29**, Release demo build **0 warnings / 0 errors**, full Solution Release build and tests completed, and real live WebAssembly Chrome **100/100** / Edge **100/100** checks including actual Space/Enter activation and computed accessibility-tree pressed state. The full Solution still reports two pre-existing NU1903 high-severity advisories for `Microsoft.AspNetCore.Components.WebAssembly.Server` 10.0.7 in the SSR demo; the separate [#425 / PR #549](https://github.com/vrassouli/Bluent/pull/549) owns that dependency update. Evidence and boundaries: [Button toggle semantic slice](../docs/v3/quality/BUTTON-TOGGLE-ARIA-SLICE.md). This is only the first implementation slice, not full Button/Fluent parity. Published Production browser matrix now passes Chrome and Edge on both InteractiveServer and InteractiveWebAssembly: 19/19 each run, 76/76 total. The public Buttons demo now exercises all six appearance toggle values with independent two-way bindings and visible bound-state feedback, validated by a clean Release build. It checks the active renderer, HTTP 101 SignalR handshake only for Server, computed accessibility-tree pressed state, component-owned aria-pressed precedence, ordinary-button caller state preservation, link omission of generated toggle state, disabled toggle state, and exactly-once ToggledChanged/OnClick callbacks for pointer click, Space and Enter. Human design review, native Windows Contrast Themes and named screen-reader acceptance remain outstanding. The expanded live WebAssembly Button demo probe now passes 105/105 in Chrome and 105/105 in Edge, covering the six toggle bindings, accessible names, Compact/Vertical/Rotated, all four Start/End × Top/Bottom badge positions, Tooltip string and RenderFragment hover/focus/hide with placement/appearance/arrow, dropdown caret and all twelve Top/Bottom/Left/Right Start/End open-select-close interactions with edge alignment and constrained-space collision-flip verification, outside-click dismissal after the panel transition, popup aria-expanded/controls with a stable hidden surface; menu type/role and arrow-key navigation remain an explicit gap, dropdown triggers with and without a caret, selection/Escape dismissal with focus restored to the trigger, listener cleanup, native disabled-Href rendering, Tab skip, and zero-callback real/synthetic click regression checks, and OnClick feedback, root Class/Style/data-* forwarding, a 390px responsive viewport, and the existing focus/keyboard/ARIA checks. Do not mark #428 Review/Done or merge until its full Definition of Done is accepted. Keep all v3 work isolated from stable `Dev` and published NuGet.
## Latest v3 Button execution checkpoint — 2026-10-27

Issue [#428](https://github.com/vrassouli/Bluent/issues/428) continues on the isolated `v3/issue-428-button-p0` branch, based on `bluent-v3`; exact local HEAD at the start of this checkpoint was `ef82926a5bbd0e1ed197052a3c1582c63543d927`. No production component source files were changed during this checkpoint; the project/skill handoff was refreshed separately after validation.

Fresh exact-worktree validation on 2026-10-27: `dotnet build Bluent.sln --configuration Release --no-restore --nologo` succeeded with **0 warnings / 0 errors**; `dotnet test Bluent.sln --configuration Release --no-build --nologo` passed **29/29**; `node --check` passed for both `scripts/quality/probe_v3_button_focus_runtime.mjs` and `scripts/quality/probe_v3_button_toggle_interactive_server.mjs`; `git diff --check` passed. The isolated published Production runtime matrix was rebuilt and rerun for Chrome and Edge against both InteractiveServer and InteractiveWebAssembly: **76/76 assertions passed** (19/19 per browser/render-mode pair), including actual trusted pointer/Space/Enter activation, computed accessibility-tree pressed state, exact-once callback counts, the real InteractiveServer WebSocket 101 handshake and no such handshake for WebAssembly. Temporary published output and browser profiles were outside the repository and cleaned by the probe.

The first live WASM Button demo probe attempts on 2026-10-27 used the local Release/default launch-profile host, which served the GitHub Pages `/Bluent/` base path and timed out. This was a host configuration mismatch, not a product regression. It was resolved by launching the already-built Debug demo with `dotnet run --project src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug --no-build --no-launch-profile` and `ASPNETCORE_URLS=http://127.0.0.1:5080`, which serves the root base path `/`. The initial `scripts/quality/probe_v3_button_focus_runtime.mjs` baseline, before the subsequent accessible-name fix, passed **100/100 in Chrome and 100/100 in Edge** on `http://127.0.0.1:5080/components/buttons` on 2026-10-27. At that initial checkpoint no production source, CSS, or test-probe code was changed. After the accessible-name fix, the expanded probe was rerun at 105/105 in both browsers (see the later checkpoint below).

Current boundaries remain: no production focus CSS/token was added; #418 candidate focus aliases remain unapproved; native Windows Contrast Themes and named screen-reader acceptance remain untested. Shared `MenuList`/`MenuItem` source still lacks `role=menu`/`menuitem` and complete arrow-key navigation, so `aria-haspopup=menu` is intentionally not emitted. That cross-component keyboard/ARIA work is not folded into the current non-visual Button slice without separate design/issue scope. The Button PR remains Draft. After that checkpoint, commit [`a7886b2d`](https://github.com/vrassouli/Bluent/commit/a7886b2d509f8ad118b69f61707e4e022ea236bc) applied and pushed the Button icon accessible-name fix plus the documentation/contract changes. All four exact-head checks passed: [Button Focus Design Contract](https://github.com/vrassouli/Bluent/actions/runs/40503849125), [Documentation Contract](https://github.com/vrassouli/Bluent/actions/runs/40503849136), and [Public Component Census](https://github.com/vrassouli/Bluent/actions/runs/40503849172) (Source/family snapshot and compiled CLR export baseline). The follow-up evidence wording update is docs-only; product code has not changed since the green exact-head run. Reviewer acceptance and full Button design/API parity remain required before Review/Done. Stable `Dev`, v2 assets, NuGet publication and deployment remain untouched.

A separate visual-design check re-exported and inspected the actual source-owned Penpot board `f4136a9a-101d-8004-8008-ca2956fe05f9` on page 38 (`535db143-a732-807e-8008-c64d2fb91b9a`): **APPROVED DESIGN · Host-aware branded Focus**, 85 editable shapes, 2040×1070, ten Light/Dark × Neutral/Brand/BrandHover/Danger/Inverted specimens. The approved design preserves the brand ring on neutral hosts, uses inverse contrast on Brand/BrandHover/Danger, and maps Inverted by theme; TextField remains underline-only. The existing source-backed native audit history is 78/78 on 2026-10-14; this session exported/inspected the current board image but could not rerun the live Penpot code audit because the connected plugin tab reported suspended. This visual approval does not approve #418 candidate token names/aliases, production CSS, native Windows Contrast Themes or screen-reader acceptance. See [approved host-context review](../docs/v3/design/BUTTON-FOCUS-HOST-CONTEXT-NATIVE-REVIEW.md).

## Button API documentation drift guard — 2026-10-27

Added a focused extension to `scripts/quality/check_v3_docs_contract.py` that derives declared `[Parameter]` properties from `Button.razor.cs`, `BluentUiComponentBase.cs`, and `BluentComponentBase.cs`, then reconciles them with the canonical `docs/components/button.md` Parameters table (including inherited Tooltip properties and unmatched attributes). The current table covers all **28 declared parameters**. Negative tests verify that removing/renaming a direct Button property or an inherited Tooltip property is caught. The v3 documentation workflow now triggers when the Button docs, markup, code-behind, or the relevant base classes change; its own contract test asserts those paths stay wired.

Validation: docs contract passes with **0 findings**, docs contract tests **9/9**, Button v2 API presence baseline has **0 errors**, Focus handoff tests **7/7**, local Markdown links pass across **157 files**, consumer-skill mapping passes (**58 UI families / 67 routes**), and `git diff --check` passes. The current Debug WebAssembly demo was rebuilt and launched on 2026-10-27; the real-Chromium CDP Button probe passes **Chrome 105/105 and Edge 105/105**, including real Space/Enter, toggle/accessibility-tree pressed state, stable name before/after Regular-to-Filled, explicit icon-only labels, the split-menu accessible name, dropdown Escape/focus restoration, disabled links, and 390px wrapping. The temporary demo host and browser profiles were cleaned. The full Release solution build passed with **0 warnings / 0 errors** and tests passed **29/29** after the product change. The host has neither Ruby, PyYAML, `actionlint`, nor a Node YAML package, so a local YAML parser check could not be run; the modified workflow uses the existing structure and added only path-filter entries. Before the accessible-name fix was added, these documentation-only changes were local/uncommitted on `v3/issue-428-button-p0`; the source fix and CI closure are recorded in the following checkpoint. No product CSS/token changes were made.

## Button accessible-name stability fix — 2026-10-27

Fixed the reproduced private-use icon-font glyph leaking into Button names. Button-owned Regular/Filled icons and dropdown indicators now use `aria-hidden="true"`; the secondary split-button trigger has the contextual label `Open menu`; caller-provided labels on icon-only Buttons remain untouched. This scope is intentionally local to Button; standalone Icon semantics remain under #429.

Validation on the freshly rebuilt Debug WASM demo: **Chrome 105/105 and Edge 105/105**, including clean/unchanged AX names before and after Regular-to-Filled toggle, preserved caller label, hidden decorative icon children, and split-menu label. `ButtonToggleSemanticsTests` is **29/29**; the full Release build completed with **0 warnings / 0 errors** and the full test run passed **29/29**. Docs contract and its negative controls, Button API baseline, Focus handoff contracts, markdown-link and consumer-skill checks pass. Work remains on `v3/issue-428-button-p0`; no CSS/token, standalone Icon, stable v2 asset or deployment changes. Human screen-reader / native Windows contrast acceptance remain open; #428 is not marked Done.


## Button Tooltip placement coverage - 2026-10-27

Continued Issue [#428](https://github.com/vrassouli/Bluent/issues/428) on `v3/issue-428-button-p0` / Draft PR [#554](https://github.com/vrassouli/Bluent/pull/554). Added an interactive Button **Tooltip placement matrix** generated from the actual public `Placement` enum (all 12 values). Expanded `scripts/quality/probe_v3_button_focus_runtime.mjs` to assert matrix completeness, native Button trigger IDs, placement-class fidelity, arrow presence, and hide-on-pointer-exit for every value. Updated canonical Button docs, component Skill evidence, migration ledger (M16 for accessible-name stability), and Unreleased notes. No public API, runtime library logic, CSS/token, stable v2 asset or deployment changes were made in this checkpoint.

Validation actually run: Debug demo build succeeded with **0 warnings / 0 errors**; Node syntax check passed; real live WASM browser probe passed **Chrome 142/142** and **Edge 142/142** with zero failures (including all twelve Tooltip placement cases). Validation completed: full Release solution build passed with **0 warnings / 0 errors**, solution tests **29/29**, docs-contract unit tests **10/10**, docs contract **0 findings**, local links **157 Markdown files**, consumer-skill mapping **58 families / 67 routes**, Button v2 API presence baseline **0 errors**, Node syntax check and `git diff --check` passed. The live WASM probe passes **Chrome 142/142** and **Edge 142/142**. This proves Tooltip visual lifecycle/placement, not screen-reader announcement: the shared Tooltip surface lacks an explicit `role="tooltip"` and trigger `aria-describedby` relation in current source; track that cross-component accessibility contract in Tooltip issue #456. Push and exact-head CI remain pending in this checkpoint. Design review, approved #418 token/visual integration, native Windows Contrast Themes and named screen-reader acceptance remain open. Do not mark #428 Review/Done or merge PR #554 until its full Definition of Done is accepted.


## Button Appearance x Size x Shape coverage - 2026-10-27

Continued [#428](https://github.com/vrassouli/Bluent/issues/428) on `v3/issue-428-button-p0` and [Draft PR #554](https://github.com/vrassouli/Bluent/pull/554). The live Button showcase now enumerates all current public `ButtonAppearance` (6), `ButtonSize` (3), and `ButtonShape` (3) values for the full **54-combination** matrix, without adding public API or changing the library runtime/CSS/tokens. Each control has a stable `data-demo-button-variant` key. The CDP probe verifies the exact 54 unique combinations, native `button` rendering, text, each class mapping, and responsive wrapping for all 18 appearance/size rows. The docs contract has a regression test for matrix enumeration, and the documentation workflow now triggers when its demo/probe inputs change.

Actual validation: Debug demo build **0 warnings / 0 errors**; Chrome live WASM probe **198/198**; Edge live WASM probe **198/198**; 54 individual variant-class assertions passed per browser; 390px viewport page width remained 390px with no overflow, and all 18 matrix rows wrapped without row overflow. Node syntax check, docs contract test suite **11/11**, and `git diff --check` passed at this checkpoint. Full Release solution build completed with **0 warnings / 0 errors** and the solution test suite passed **29/29** after this checkpoint’s source/docs updates. Docs contract **0 findings**, docs-contract unit tests **11/11**, Button API baseline **0 errors**, focus handoff tests **7/7**, Markdown links **157 files**, consumer-skill map **58 families / 67 routes**, UTF-8 validation, Node syntax check, and `git diff --check` all pass. Exact-head CI is to be checked after pushing the current commit. Full design token approval (#418), full visual parity, native Windows Contrast Themes and named screen-reader acceptance remain open; keep #428 In progress and PR #554 Draft.
