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

At the end of the 2026-10-27 checkpoint, no production focus CSS/token had been added; #418 candidate focus aliases remained unapproved; native Windows Contrast Themes and named screen-reader acceptance remained untested. At that checkpoint, shared MenuList/MenuItem still lacked menu/menuitem roles and complete arrow-key navigation. The dedicated 2026-10-28 menu keyboard slice below now addresses that specific gap; the visual/token and native accessibility acceptance boundaries remain open. The Button PR remains Draft. After that checkpoint, commit [`a7886b2d`](https://github.com/vrassouli/Bluent/commit/a7886b2d509f8ad118b69f61707e4e022ea236bc) applied and pushed the Button icon accessible-name fix plus the documentation/contract changes. All four exact-head checks passed: [Button Focus Design Contract](https://github.com/vrassouli/Bluent/actions/runs/40503849125), [Documentation Contract](https://github.com/vrassouli/Bluent/actions/runs/40503849136), and [Public Component Census](https://github.com/vrassouli/Bluent/actions/runs/40503849172) (Source/family snapshot and compiled CLR export baseline). The follow-up evidence wording update is docs-only; product code has not changed since the green exact-head run. Reviewer acceptance and full Button design/API parity remain required before Review/Done. Stable `Dev`, v2 assets, NuGet publication and deployment remain untouched.

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


## Button theme and RTL runtime coverage - 2026-10-27

Continued #428 on `v3/issue-428-button-p0` / Draft PR #554. Extended `scripts/quality/probe_v3_button_focus_runtime.mjs` to check computed CSS for all 54 appearance/size/shape variants under both `data-bui-theme=light` and `data-bui-theme=dark`, verify that the Default Button foreground/background genuinely changes between theme token sets, and compare an actual icon+text Button's geometry under LTR and RTL. At 390px, the full 54-button matrix also remains responsive in Dark+RTL. Theme checks wait 350ms after toggling because the shipped Button styles animate color/background/border; reading before the transition settled caused a false negative even though the computed dark token was already `#292929`.

Live Debug WASM results: **Chrome 203/203; Edge 203/203**, zero failed assertions. The two theme snapshots confirm the Default-Medium-Rounded Button moves from `rgb(255, 255, 255)` / `rgb(36, 36, 36)` in Light to `rgb(41, 41, 41)` / `rgb(255, 255, 255)` in Dark (background / foreground). The real icon+text Button puts its icon before the text in LTR and after the text in RTL while preserving accessible name `Default`. Dark+RTL at 390px keeps root/client/document width at 390px, all 18 rows wrapped, and zero overflowing rows. This is real Chromium browser evidence, not native OS contrast or screen-reader acceptance.

The implementation surface is limited to the Button demo selector, browser probe and docs-contract test; accompanying file changes update the canonical API/quality documentation, migration ledger, changelog, Skill and project evidence. Debug demo build passed **0 warnings / 0 errors**; full Release solution build passed with **0 warnings / 0 errors**, and solution tests passed **29/29**. Docs contract **0 findings**, docs-contract tests **11/11**, Button API baseline **0 errors**, focus handoff tests **7/7**, Markdown links **157 files**, consumer-skill mapping **58 families / 67 routes**, Node syntax, UTF-8 validation and `git diff --check` all passed. Exact-head CI will be checked after push. Keep #428 In progress and PR #554 Draft pending remaining design/API/AT gates.


## Explicit Button ToggledChanged callback coverage - 2026-10-27

Continued #428 on the isolated `v3/issue-428-button-p0` branch. The Buttons showcase now includes a direct `Toggled` + `ToggledChanged` scenario (without `@bind-Toggled`), with live state and callback-count feedback. The CDP probe verifies the native button starts `aria-pressed=false` with zero calls, one trusted pointer click produces `On` and exactly one callback, then a native Space activation returns to `Off` with exactly two callbacks total; the accessible name remains `Explicit callback toggle` across both states. This complements the existing six-way `@bind-Toggled` appearance matrix rather than replacing it.

Live WebAssembly checks on the Debug demo: **Chrome 206/206; Edge 206/206**, zero failed assertions. The new direct callback starts correctly, pointer invokes it once and Space invokes it once more; `aria-pressed`, CSS selected state and visible state/count stay synchronized. Debug demo build: **0 warnings / 0 errors**; docs-contract test suite is rerun after separating this regression from the appearance/shape test. No library runtime code, public API, production CSS/tokens, stable v2 assets, release or deployment changed. Keep #428 In progress and PR #554 Draft until full design/API parity, approved #418 token work and native OS/screen-reader acceptance are complete.


## Button Badge LTR/RTL geometry coverage - 2026-10-27

Continued #428 on `v3/issue-428-button-p0`. Expanded the real browser probe to check Badge placement geometrically, not just by the generated `start`/`end` and `top`/`bottom` classes. For each of the four existing Badge specimens, the probe compares actual `getBoundingClientRect()` coordinates for the Badge wrapper against the owning native Button and verifies physical-edge alignment at 1.5px tolerance in both LTR and RTL. Chrome and Edge confirm logical Start is physical left in LTR and right in RTL, logical End is the opposite, and Top/Bottom remain vertically attached to their corresponding button edges. The probe explicitly restores LTR before subsequent tooltip/dropdown tests. No Button/Badge library source or production CSS changed.

Live WASM results including the complete Button suite: **Chrome 208/208; Edge 208/208**, zero failures. The first attempt caught a bug in the newly written test harness (using an unbound `direction` variable and fragile class-string parsing); those diagnostics were fixed and the test now uses `classList` and explicit direction literals. Demo build is **0 warnings / 0 errors**, docs-contract tests are **13/13**, Node syntax and `git diff --check` pass. Full Release/link/API/focus/consumer and exact-head CI checks will be rerun after docs update and push. Keep #428 In progress and PR #554 Draft; this is geometry evidence, not approval of the complete Button RTL/Fluent design.


## Persian Button writing direction - 2026-10-27

The #419 Penpot direction/typography fixture specifies that the Persian label `ذخیره تغییرات` keeps its own RTL writing direction in both LTR and RTL Button layouts while the icon mirrors sides. A focused renderer regression reproduced the gap: Button's `.text` wrapper did not have a content-driven direction attribute. The v3 Button now renders that inner text wrapper with `dir="auto"` (no API addition); surrounding Button direction remains free to drive its flex/icon ordering. `Buttons.razor` has paired runnable Persian specimens in explicit LTR and RTL containers. The real browser probe checks each wrapper's computed RTL direction, the exact Persian accessible name via the Chromium accessibility tree, icon-before-text in LTR, icon-after-text in RTL, and that the samples remain inside their rows at 390px.

The source renderer test passed after adding the attribute; Debug demo build is **0 warnings / 0 errors**. Live WASM probe passes **Chrome 211/211 and Edge 211/211**, zero failures, including Persian text/direction/name and the Badge geometry, theme, variant and callback matrices. This implements the direction part of the existing source-owned Penpot design; it does not approve the candidate font stack, finish Persian typography/visual comparisons, or establish native screen-reader/OS high-contrast acceptance. Full local validation after this change: Release solution build **0 warnings / 0 errors**, product tests **30/30**, docs contract **0 findings**, docs-contract unit tests **14/14**, Button API baseline **0 errors**, focus handoff tests **7/7**, Markdown links **157 files**, consumer-skill coverage **58 families / 67 routes**, Node syntax, UTF-8 validation and `git diff --check` all pass. Live browser probe: **211/211 in Chrome and 211/211 in Edge**.


## Published InteractiveServer + WebAssembly Persian Button verification - 2026-10-27

Extended `src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor` with paired `ذخیره تغییرات` Button specimens under explicit LTR and RTL layout rows, and expanded `scripts/quality/probe_v3_button_toggle_interactive_server.mjs` to inspect computed text direction, actual icon/text geometry and the native accessibility-tree name in the **published Production ASP.NET Core host**. The same `dir="auto"` behavior is now exercised in both InteractiveServer (verified by a real SignalR WebSocket HTTP 101 handshake) and InteractiveWebAssembly, with both Chrome and Edge. Results on the fresh full matrix: **84/84 assertions passed, 0 failed** (21 checks for each of Chrome/Edge × Server/WebAssembly). Each renderer keeps the Persian text RTL in both container directions, preserves the exact Persian AX name, places the icon left of the text in LTR and right in RTL, and reports no row overflow. The production test uses a temporary local publish, not a production deployment.

The first matrix run saw one intermittent Chrome/Server click timeout; a standalone Chrome rerun passed 42/42, then the complete Chrome+Edge matrix passed 84/84 from a newly published host. This indicates the timeout was not reproducible in the full rerun; the final recorded result is the fresh full-matrix pass. The docs contract now guards the fixture/probe and CI path filters include both inputs. Native Windows Contrast Themes, named screen-reader acceptance, approved font selection and complete Button visual parity remain open. PR #554 stays Draft and Issue #428 stays In progress.


## Button-managed Dropdown lifecycle cross-render verification - 2026-10-27

Continued Issue [#428](https://github.com/vrassouli/Bluent/issues/428) on `v3/issue-428-button-p0` / Draft PR [#554](https://github.com/vrassouli/Bluent/pull/554). Added a stable Button-managed dropdown fixture to `CompatibilityProbe.razor` using existing public `Button`, `Dropdown`, `MenuList` and `MenuItem` composition. The fixture tracks a selected Copy action visibly without introducing library API or product styling changes. Extended the published-host browser matrix to verify initial collapsed state, stable `aria-controls`, native trigger/caret, open-surface visibility and synchronized `aria-expanded`, focusable Copy command, Escape dismissal with focus restored to the trigger, reopening, and exactly-once Copy selection followed by popup closure. The probe deliberately does not assert `aria-haspopup="menu"`; shared menu-role/keyboard semantics remain a separate contract gap.

Validation on 2026-10-27: full Release solution build succeeded with **0 warnings / 0 errors**. A fresh temporary Production publish passed **112/112 browser assertions, 0 failures**, across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (28 assertions per route/browser pair). This is local publish/runtime evidence, not a deployment. The final local gate then passed Node syntax checking, the v3 docs contract (**0 findings**), docs-contract unit tests (**16/16**), solution tests (**30/30**), Markdown link checks (**157 files**), consumer-skill coverage (**58 main families / 67 routes**), UTF-8 validation for all six changed files, and `git diff --check`. Native Windows Contrast Themes, named screen-reader acceptance, final approved #418 token mapping, and full visual/Fluent parity remain open. Keep Project #5 status In progress, PR #554 Draft, and do not merge or close #428.


## Button-managed menu keyboard and popover lifecycle - 2026-10-28

Continued Issue [#428](https://github.com/vrassouli/Bluent/issues/428) on the isolated branch v3/issue-428-button-p0 / Draft PR [#554](https://github.com/vrassouli/Bluent/pull/554). Added a source-linked keyboard/ARIA contract for the existing Button → Popover → MenuList/MenuItem composition. MenuList exposes role="menu" and an accessible name; MenuItem exposes role="menuitem", roving-focus tabindex="-1", disabled state, and nested-menu relationship. Keyboard behavior covers ArrowDown/ArrowUp wrapping, Home/End, disabled-item skipping, type-ahead, leaf Enter/Space activation, Escape focus restoration, Tab dismissal without a focus trap, and direction-aware submenu navigation.

Hardened the async Popover boundary without changing the public IPopoverService API: internal awaited show/close events now keep the JS surface lifecycle in the same awaited Blazor callback path; PopoverInterop shares its in-flight JS instance creation during first render; managed Button clicks await the internal show path; leaf menu-item clicks await closure before the consumer callback; JS keyboard activation performs a single click and deterministic dismissal. The published browser probe now waits for the initial persistent surface before asserting the initial ARIA contract rather than racing first-render DOM creation.

Fresh temporary Production-host matrix on 2026-10-28: **184/184 assertions passed, 0 failed** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (46 per combination). InteractiveServer asserted a real SignalR WebSocket HTTP 101 handshake; the matrix exercised collapsed/open/closed ARIA state, focus and roving menu navigation, keyboard activation, nested submenu, and the existing Button toggle contract. This was local publish/runtime evidence, not a deployment. Validation: Release solution build **0 warnings / 0 errors**; product tests **30/30**; docs-contract unit tests **17/17**; v3 docs contract **0 findings**; Markdown links **158 files**; consumer Skill **58 main families / 67 canonical routes**; Node syntax and git diff --check pass.

This is one validated implementation slice, not full #428 acceptance. Approved #418 token mapping, final Button Fluent/visual parity against source-owned Penpot, native Windows Contrast Themes, named screen-reader acceptance and maintainer review remain open. Keep Issue #428 In progress and PR #554 Draft; do not merge or close the issue.

## Button keyboard dismissal focus destination — 2026-10-30

Continued Issue [#428](https://github.com/vrassouli/Bluent/issues/428) on `v3/issue-428-button-p0` / Draft PR [#554](https://github.com/vrassouli/Bluent/pull/554). The published Production browser probe now exercises both `Tab` and `Shift+Tab` dismissal from the Button-managed menu and requires the resulting active element to be focused and to be, or belong to, a genuine keyboard-focusable control outside the menu. This strengthens the reverse-Tab case after the earlier run showed that checking only for `document.body`/`documentElement` was too permissive when Chromium reported an SVG active element. The new check is applied to both forward and reverse Tab; no component runtime/CSS/API behavior was changed.

The complete temporary Production-host matrix passed **208/208 assertions, 0 failures** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly (52 per route), including the RTL submenu key matrix and toggle accessibility-tree checks. This is local published-host evidence, not a deployment. Validation: docs-contract tests **22/22**, full Quality suite **67/67**, docs contract **0 findings**, Button API metadata baseline **0 errors**, Node syntax and `git diff --check` passed. Native Windows Contrast Themes, named screen-reader acceptance, approved #418 token mapping, final Fluent visual parity and maintainer review remain open. Keep #428 In progress and PR #554 Draft; do not merge or close the issue.

## Source-owned Penpot evidence persisted — 2026-10-30

The #428 Evidence boundary note is now **actually persisted and verified in the editable source-owned Penpot file**, superseding the earlier stale-export checkpoint. File `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), page `46 · Button dropdown menu keyboard contract · #428` (`ebe6a73c-d7b0-804d-8008-daec5fe2edb9`), board `#428 · Menu semantics and focus contract` (`ebe6a73c-d7b0-804d-8008-daec60488d87`). The new `Evidence boundary` text is shape `fce13529-02e2-80e4-8008-de51ad66dab5`; file revision readback is `488`. A fresh Penpot PNG export of the board visibly shows commit `f300d8c7`, **208/208** published-host assertions across Chrome/Edge × InteractiveServer/InteractiveWebAssembly, verified Tab/Shift+Tab focus destination, and the still-open native Contrast Themes, screen-reader, #418 token and Fluent visual-parity gates. The keyboard-matrix `Tab / Shift+Tab` expectation was also revised to state that focus moves to the next/previous keyboard-focusable control outside the popup (shape `fce13529-02e2-80e4-8008-de5217c131ce`). The temporary write-path test label was removed and is absent from the final export. The note explicitly says this is test evidence, not final visual design approval.

Latest code branch remains `v3/issue-428-button-p0` at `f300d8c7987e0796b791094937faad5d9fb6c620`; exact-head CI is **5/5 green**. Keep #428 In progress and PR #554 Draft until the full original Definition of Done and maintainer acceptance are met.

## Fresh live Button showcase matrix rerun — 2026-10-30

Revalidated the expanded existing `scripts/quality/probe_v3_button_focus_runtime.mjs` against the live Debug **Interactive WebAssembly** demo on `http://127.0.0.1:5080/components/buttons` using actual Chromium DevTools Protocol sessions:

- Chrome: **211/211 passed, 0 failed**.
- Edge: **211/211 passed, 0 failed**.
- The demo route returned HTTP 200. The probe used its own disposable browser profiles and cleaned them after each run; the local Debug host was stopped after the checks and port 5080 was confirmed to have no remaining listener.
- The rerun covers the real Split Button two-target keyboard/focus sequence, disabled-item Tab skipping, trusted pointer/Space/Enter toggle and OnClick activation, `aria-pressed` computed accessibility-tree state, accessible names, all twelve TooltipPlacement values, the 54 Appearance × Size × Shape matrix and computed Light/Dark styles, Badge geometry in LTR/RTL, icon/text mirroring, link/disabled-link behavior, Compound examples, and 390px responsive wrapping without horizontal overflow.
- The script injects the #501 focus-ring research CSS only into each disposable browser tab. Its forced-colors case is browser-emulated; it is **not** native Windows Contrast Themes, Narrator/NVDA/JAWS validation, production CSS, or approved #418 token styling.

This is a fresh **Debug Interactive WebAssembly** rerun of the broad Button showcase probe. Keep it distinct from the separate published **Production** cross-render menu matrix (**208/208** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly). Both are useful browser evidence; neither proves full Fluent 2 visual parity or native assistive-technology acceptance. This run changed no product source, CSS, public API, or design tokens. Issue #428 stays In progress and PR #554 stays Draft.
## Latest #428 production Focus Visible implementation — 2026-10-30

Continued the existing Button work on `v3/issue-428-button-p0` / Draft PR [#554](https://github.com/vrassouli/Bluent/pull/554), still targeting `bluent-v3` only. The shipped component stylesheet now implements the approved Penpot keyboard focus ring instead of relying on temporary test-only CSS: 2px outline / 2px offset for ordinary buttons, a -3px inset ring for split-button segments, and the OS `Highlight` system color in `forced-colors`. Host-context color is inherited through `--bui-button-focus-ring-color` where the surface is explicitly known; no Razor API or global token was added. The Button showcase now has Neutral, Brand, BrandHover, Danger and Inverted host examples in Light/Dark.

Actual validation on 2026-10-30: `dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug -warnaserror` succeeded with 0 warnings / 0 errors and regenerated the component CSS bundle. The live bundled-CSS WebAssembly probe passed **215/215 in Chrome and 215/215 in Edge** with no injected focus stylesheet. Button API baseline: 0 errors; v3 docs contract: 0 findings; focus handoff tests: 7/7; docs-contract tests: 22/22. The full Solution Release build remains blocked by the two existing high-severity NU1903 advisories on `Microsoft.AspNetCore.Components.WebAssembly.Server` 10.0.7 in the SSR demo, tracked by #425; no warning was suppressed.

This materially closes the product-CSS gap for focus-visible, but it does **not** complete all #428 acceptance: native Windows Contrast Themes, named screen-reader testing, final screenshot/zoom review against Penpot, exact-head CI and maintainer acceptance remain. Keep Issue #428 In progress and PR #554 Draft until those gates are genuinely met. Stable `Dev`, v2.x assets, NuGet, tags and deployments remain untouched. Canonical branch-only summary: [Button v3 implementation record](../docs/v3/components/button.md).
## #428 Button — Review handoff — 2026-10-30

The complete implementation work for the current Button branch is submitted for maintainer review. PR [#554](https://github.com/vrassouli/Bluent/pull/554) is **Ready for review**, target bluent-v3, branch v3/issue-428-button-p0, exact head bec504da9eb2bb97e4ec6765987a2edce8e1b21b. GitHub Project #5 Status for [#428](https://github.com/vrassouli/Bluent/issues/428) is **Review**. This is not Done, accepted, merged or released.

Exact-head GitHub Actions are **6/6 green**: Button runtime/ARIA/menu contract, button-focus-contract, compiled CLR export baseline, source/family snapshot, v3-docs and v3-skills. The published-host browser matrix passed **208/208**: 52 assertions in each Chrome/Edge × InteractiveServer/InteractiveWebAssembly route, including the actual Server SignalR handshake. Local live Debug WASM probe reads the shipped bundled CSS with no injected styles: Chrome **215/215**, Edge **215/215**. Debug and Release WASM Demo builds are 0 warnings / 0 errors; solution tests 31/31; API baseline 0 errors; docs contract 0 findings; focus handoff tests 7/7; docs contract tests 22/22.

Remaining review gates: maintainer visual screenshot/zoom review against the approved Penpot source, native Windows Contrast Themes and named screen-reader testing. Full-solution local Release build with warnings-as-errors still surfaces the existing NU1903 advisories on Microsoft.AspNetCore.Components.WebAssembly.Server 10.0.7 in the SSR demo (#425); these were not suppressed. Stable Dev, v2.x, NuGet publication, tags and deployments remain untouched.
## Button #428 — Fluent compatibility and native Windows review — 2026-10-30

Continued the isolated v3 task branch v3/issue-428-button-p0. Added docs/v3/quality/FLUENT2-BUTTON-COMPATIBILITY.md, a source-backed crosswalk of all 30 public/inherited Button members against the pinned @fluentui/web-components 3.1.3 family. The current contract has 12 supported or related-component mappings (including Boolean Toggled semantics) and 18 intentional Bluent extensions. It explicitly records the separate Fluent Button/ToggleButton/CompoundButton/MenuButton/AnchorButton models, the absence of mixed toggle state, disabled-link behavior, brand-token color differences and Penpot font-catalogue limitation. The Button demo header now links its fuller API and states the Bluent extension boundary.

Fresh live Debug WebAssembly run on 2026-10-30: **Chrome 215/215**, 0 failures, against shipped CSS bundle with no injected styles. Existing branch evidence remains **Edge 215/215** and published Production **208/208** across Chrome/Edge × InteractiveServer/InteractiveWebAssembly. Native Windows Contrast Themes were actually tested with the Desert theme: Windows forced-colors was observed in the live browser, the keyboard-focused Button retained its 2px outline, and the system setting was restored to None; forced-colors returned to false. A Narrator session and native UI Automation tree were inspected (154 named page buttons; toggle false → true → false), but spoken output was not recorded/listened to, so screen-reader speech acceptance remains open.

The Penpot source contains an equal-content Fluent comparison fixture (page 24) and a separate approved focus-visible board (page 38). The full Button appearance/state and zoom/viewport visual parity still needs maintainer sign-off. The local Button implementation is Fluent-aligned with documented Bluent extensions, not an exact color/pixel clone. Current brand colors are owned by #418 and were not silently changed.

Issue #428 remains **Review**, PR #554 remains **Ready for review**, and its base remains bluent-v3. Do not mark Done or merge without maintainer acceptance. Stable Dev, 2.x, NuGet, tags and deployments remain untouched.
## Button #428 — final Production verification — 2026-10-30

Fresh published Production test matrix completed successfully: **208/208** (0 failures) across Chrome and Edge × InteractiveServer and InteractiveWebAssembly, 52 assertions per combination. The two InteractiveServer runs completed real SignalR WebSocket HTTP 101 handshakes. The temporary published host was removed when the probe exited. Its publish step surfaced the two existing NU1903 advisories for WebAssembly.Server 10.0.7 (#425); no suppression or dependency change was made. Issue #428 and PR #554 remain in Review / Ready for review pending maintainer sign-off; no merge or release.
## Button #428 — maintainer acceptance and closure — 2026-10-30

The maintainer explicitly decided that no additional human visual-design or spoken screen-reader sign-off is required to close this component issue. Engineering evidence and green exact-head CI are the acceptance basis; any concern later observed by a human is to be filed and handled as a follow-up defect. This decision does not change test reporting: Narrator UI Automation semantics were inspected, but spoken Narrator output was not recorded/listened to.

PR #554 is being merged only into the protected v3 integration branch bluent-v3 (never Dev/main/stable 2.x). After the squash merge, close #428 and set its real GitHub Project #5 Status to Done; update Epic #416 coverage. The Button work remains v3 integration content, not a NuGet publish or deployment.

- 2026-10-16 #420 final real browser child removal: Chrome/Edge x
  Server/WASM passed 33/33 each, total 132/132, zero failures.
  Prior Edge WASM test failed because --no-build served stale Debug
  Razor without Remove button; actual CDP DOM exposed it, fixed
  harness to always build latest Debug. Compiled DLL fake JS 127
  assertions, source Python 22+13. Owned-profile cleanup remaining
  zero. Penpot page40 draft not yet approved; native Windows/AT
  evidence pending. PR #550 Draft; issue In progress.

- 2026-10-16 #420 promoted Popover browser accessibility
  evidence beyond DOM-only: correct editable Penpot page40
  board has 54th DRAFT research note; Chromium CDP AX tree
  now checked before open, while expanded, and after Escape.
  Actual accessible button role/name/focusable, true related
  visible surface idrefList, and restored focused/closed
  state verified in real Chrome/Server 36/36 (3 new AX checks).
  2 additional Python source guards. Native Windows UIA/
  Narrator/NVDA and approved Penpot parity remain OPEN.

- 2026-10-16 #420 Calendar private async event debt:
  Penpot page40 board revision402/55 editable DRAFT shapes.
  Month/year selection handlers now Task instead of async void,
  two unused ChangeEventArgs async void handlers removed.
  No public API/CSS change; compiled interop + Calendar tests
  total 139 real assertions, proving awaiting and exception
  propagation with delayed callbacks for both modes. Actual
  Blazor QA-only CalendarAsyncProbe and Server wrapper use
  interactive hydration readiness; Chrome Server 46/46 after
  fixing prerender QA premature-click race. UIA, OS AT, design
  review and exact-head CI remain separately pending.

- 2026-10-16 #420 Calendar MonthChanged Task ordering:
  Penpot page40 board revision403 / 56 native editable DRAFT.
  Old ViewDate setter scheduled MonthChanged with detached
  InvokeAsync, unsafe for exceptions and ordering. Setter now
  side-effect-free; date nav 7 actions await ChangeViewDateAsync,
  selection handlers await it; external SelectedDate changes
  notify once via OnParametersSetAsync, consumed before await.
  No same-month double notification, public API unchanged.
  Compiled real DLL 150 assertions, source Python 26/26,
  Chrome/Server 54/54 and Edge/WASM 54/54 runtime tests PASS.
  Exact new SHA CI and migration-timing acceptance pending;
  Penpot visual/native OS AT approval still open.

- 2026-10-16 #420 Penpot design readability defect repaired
  on the REAL editable file/page40 board: overlapping/outside-
  board appended notes organized under section05 as five
  white-backed native editable cards. Penpot revision409,
  shapeCount63, 14/14 true live geometry checks and direct
  PNG export human review passed. No component visual parity
  approval implied. Consumer timing-migration review added
  at docs/v3/architecture/INTERACTION-CONSUMER-MIGRATION-REVIEW.md;
  actual M13-M17 row risks appended to source migration ledger.
  Public parameter APIs unchanged but Calendar callback timing
  and Popover ARIA/lifecycle observable behavior need consumer
  review before v3 release. Exact prior implementation HEAD
  ee798e95 and follow-up docs/design HEAD cca7aac0 both had
  GitHub 9/9 successful checks. Finalized Penpot revision409
  background repair is a separate docs-only follow-up whose
  exact-head CI still requires independent verification.

- 2026-10-16 #420 actual source-owned Penpot board page40 native textBounds follow-up: 63 real editable shapes, 37 text elements, **30 had 1-2px height deficit** despite previous 14/14 placement audit. Enlarged height only (<=3px), re-read **37/37 fitting**, no text beyond board. New repeatable read-only live Penpot audit scripts/quality/penpot_v3_420_textbounds_audit.js. Measurement fix, NOT visual reviewer approval or native AT. #420 In progress; PR #550 Draft; no public API/stable release.

- 2026-10-17 #420 Popover RightEnd fix: public Placement.RightEnd was emitted as right-end but Sass missing dot yielded dead .bui-popover-surfaceright-end selector; corrected authored/compiled/published CSS (Sass 1.93.2), added real public demo, 3 browser interactions and 4 source negative/positive tests (17/17 PASS). Initial Chrome/Server 56/57 test-only display:none computed-transform blind spot corrected with a temporary display override and exact restoration. Real Chrome/published InteractiveServer 57/57 PASS zero failures. Exact new-head four-browser CI pending; no public API change or stable merge, source-owned Penpot #420 board remains DRAFT.

- 2026-10-17 #420 Overlay reduced-motion D5 defect: real .bui-overlay had normal ~250ms fade under browser prefers-reduced-motion:reduce. Task-only Sass override zeros animation duration/delay only under reduced motion; compiled and minified assets synced with Sass 1.93.2. Added optional actual Blazor Overlay fixture and browser checks normal/reduced/restored plus click removal. Source contract with 21 positive/negative cases PASS. First Server browser run prematurely clicked SSR static markup and timed out; harness updated to retry until Blazor event handlers hydrate. New browser/CI evidence pending. No stable Dev/NuGet or public API changes.

- 2026-10-17 final Dev01 local Chrome/Production-published
  InteractiveServer browser probe **61/61 PASS**, failures=0.
  First prematurely checked prerender static content before
  interactivity (1/1 with timeout); retry on real Blazor
  hydration yielded 60/61 with a first-paint normal
  CSS/media baseline inconsistency; explicit Chromium
  no-preference media baseline then proved normal fade,
  Reduced Motion 0s duration/delay, and restored normal
  fade, all with real Overlay OnClick removal: 61/61.
  Other render modes and exact latest GitHub SHA remain
  separately verified, not inferred from this result.

## #420 P0 behavioral defaults (maintainer-approved 2026-10-25; design/implementation gates remain open)

Maintainer decision 2026-10-25 (behavioral defaults only): the P0 behavioral defaults in `docs/v3/architecture/ADR-0002-P0-CONTRACT-OPTIONS.md` are approved as recorded; this does not approve token mappings, exact values, focus restoration, native AT, or the complete design board. Canonical Penpot board `1d92b6fb-c168-8047-8008-d7d1f38c5d2f` remains **REVIEW REQUIRED**. `#420 remains In progress`. This approval is a design/contract decision only; no product source/API/CSS was changed.

## #552 interaction-owner boundary (audit only, 2026-10-25)

The audit-only crosswalk in `FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md` records the Label InfoLabel and disabled-Link browser observations for owner decisions #430 and #431. It does not authorize fixing either family inside generic Popover; the consuming component owns its domain-specific roles, accessible names and focus behavior. No v3 public API or component source change is authorized by this audit. Native screen-reader/OS acceptance remains open.

## Quality gates #425 — integration refresh after Button — 2026-10-30

The #425 implementation from PR #549 is merged with current bluent-v3 (including Button #428 merge commit 550efb95) in this task branch. The only merge conflict was the append-only project log; the current integration-branch project log was preserved and this concise quality-gate checkpoint was appended. Runtime source, workflows and QA fixtures merged without textual conflicts.

PR #549 head prior to integration: 96796bebd9648a8f6d2f17f82cfada05dae31520; previous exact-head GitHub checks were green across all four browser/render modes and the Release/package quality contract. This refresh must pass a new exact-head CI before merge. The branch owns:
- path-unfiltered Release build/test, docs and Skills contracts, local package identity/version/SHA checks and SSR smoke (pack validation only; no package publish);
- independent Chrome/Edge x InteractiveServer/WebAssembly runtime matrix;
- accessibility-tree checks for named controls, RTL/LTR, responsive viewports and reduced/forced-colors browser-emulation evidence;
- native site zoom 200%/400% checks with no settled horizontal overflow and retained screenshot/evidence artifacts.

Evidence boundary: browser-emulated forced-colors and computed AX do not certify native Windows Contrast Themes or spoken assistive-technology output. The latter is not silently marked passed. The maintainer's component policy accepts automated evidence as sufficient for component closure; future observations remain follow-up defects. Do not claim full WCAG/AT certification from this CI.

PR #549 continues to target bluent-v3 only. Existing Dev, 2.x, NuGet packages, tags and deployments remain untouched.

## Quality gates #425 — unique contrast target and exact local matrix — 2026-10-30

After refreshing PR #549 against current bluent-v3 (Button #428 included), the new exact-head GitHub run exposed a test-fixture selector defect, not a production theme regression. The contrast probe selected the first anchor with /compatibility/static, which was the Button's own link, rather than the intended NavLink specimen. The contrast threshold was correct and has not been relaxed.

Fixed the QA fixture with a stable data-testid="compatibility-link" and changed the Chromium probe to measure that exact element. Added fail-closed source checks and two positive/negative regression tests so neither the fixture ID nor the precise selector can silently drift.

Fresh local real-browser matrix against the merged code and actual published Production host:
- Chrome / InteractiveServer: **72/72 PASS**, errors=[], owned browser cleanup remaining=0.
- Chrome / WebAssembly: **72/72 PASS**, errors=[], owned browser cleanup remaining=0.
- Edge / InteractiveServer: **72/72 PASS**, errors=[], owned browser cleanup remaining=0.
- Edge / WebAssembly: **72/72 PASS**, errors=[], owned browser cleanup remaining=0.
- Native site zoom checks in each mode: **200% 10/10** and **400% 10/10**, settled horizontal overflow 0; all screenshot/JSON artifacts retained locally.

Final local validation after this fix: full Bluent.sln Release -warnaserror build **0 warnings / 0 errors**; Solution tests **31/31**; quality source gate PASS; Python fail-closed QA contract tests **48/48**; Node syntax and git diff --check PASS. This is local evidence only until GitHub exact-head Actions finish on the pushed commit.

No Bluent runtime API, library theme tokens, production component CSS, stable Dev/v2.x assets, NuGet package, tag or deployment changed. PR #549 continues to target bluent-v3 only. Keep #425 in Review pending exact-head CI and maintainer acceptance; do not mark Done from local evidence alone.



## #425 — .NET 10 Blazor debugger package security update — 2026-10-30

The 2026-10-25 update to GHSA-g27p-qf6j-c96c establishes 10.0.14 as the fixed .NET 10 version for both `Microsoft.AspNetCore.Components.WebAssembly.Server` and `Microsoft.AspNetCore.Components.WebAssembly.DevServer`. On the isolated `v3/issue-425-quality-gates` branch, raised the SSR host package from 10.0.13 to 10.0.14 and all three active DevServer consumers (`Bluent.UI.Demo`, `Bluent.TaskExamples`, `Bluent.OrderDesk`) from 10.0.7 to 10.0.14. No Bluent library API, runtime component code, stable `Dev`/2.x project, package, tag or deployment was changed.

The quality gate now enforces the 10.0.14 minimum on the SSR Server package and on every active `src/**` / `samples/**` DevServer project; added current-version and negative regression tests so 10.0.13 cannot silently pass. The previous 10.0.13-only server guard was insufficient after the Oct 25 advisory update.

Local verification on 2026-10-30: forced `dotnet restore Bluent.sln` PASS; `dotnet list Bluent.sln package --vulnerable --include-transitive` reports **no vulnerable packages**; full `dotnet build Bluent.sln --configuration Release -warnaserror` **0 warnings / 0 errors**; full Release tests **31/31**; quality-gate source contract PASS; quality-gate regression tests **50/50**. Five-package pack/manifest validation and exact-head GitHub Actions are still pending. No NuGet package was published.

The installed local .NET shared runtime on Dev01 is 10.0.12; this change updates the repository's vulnerable package references, not the machine-wide runtime. CI's `setup-dotnet` uses the latest `10.0.x`. Do not describe the host runtime itself as updated.
### #425 completion update — 2026-10-31

PR [#549](https://github.com/vrassouli/Bluent/pull/549) merged exclusively into `bluent-v3` as `e278e202b6730ae91b4c287487d573e0ebb3a7a4`. Issue #425 is closed, Project #5 Status is Done, and Epic #416 checklist is checked. No stable 2.x branch, NuGet publication or deployment was changed.

## #421 Component Lab platform acceptance boundary — 2026-10-30

The canonical Penpot workspace is the source-owned Bluent v3 Design System file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 42 `e775e67c-d9da-804b-8008-cc7c2dd7ecf7`. Added editable board `#421 · Lab platform vs component DoD · REVIEW REQUIRED`, ID `fce13529-02e2-80e4-8008-de96e1fdaca3`, with 21 native editable shapes. It separates the reusable Lab platform acceptance (searchable family catalog, controlled live specimens, copyable Razor, machine-readable source/API coverage, evidence-state distinctions, four-mode browser gates, accessibility/failure-visible QA) from the per-family Definition of Done (approved family design, complete API/state/keyboard/ARIA, Light/Dark/RTL/forced-colors, responsive/browser/native evidence, docs/migration/Skill and maintainer acceptance). Live Penpot readback: 12/12 text shapes fit their text bounds; 0 overflow.

This is a review proposal, not approval. The board requests maintainer acceptance of the Lab platform as a prerequisite to beginning a component while retaining full per-family coverage as each component's own DoD. Current coverage is **18 representative pilots / 66 source families / 0 accepted families**. Do not inflate the metric or mark #421 Done. The two existing page42 Desktop/Mobile designs remain drafts. No public component source/API/CSS was changed by this design step.

## Icon #429 implementation closeout — 2026-11-04

The Icon implementation was delivered on `v3/issue-429-icon` and accepted into the protected v3 integration branch through [PR #558](https://github.com/vrassouli/Bluent/pull/558), squash-merged as `0f1df06f2e0e3dd14cefef33349fa22184f2ff71`. The merged source head was `98256eee490eddf48cfb2a52ca79c19f0dac4ed6`.

- Source-specific Icon roots (CSS font i, trusted SVG span, image img) receive a low-specificity 1em viewport; caller CSS and Style can override it.
- Regular/Filled and Filled-to-Regular fallback remain unchanged; no public Size or Color parameter/variant was added.
- The shared interactive `/components/icons` page covers font/SVG/image sources, inherited sizing, variant switching, fallback, explicit style override, decorative/informative semantics, parent-owned action name and RTL direction-specific glyphs.
- Canonical Icon reference, inventory, changelog and migration row M19 are updated. The SSR host provides a dedicated InteractiveServer wrapper for the shared Icon page.
- Four local browser runs passed: Edge/InteractiveServer 234/234, Edge/WebAssembly 237/237, Chrome/InteractiveServer 234/234, Chrome/WebAssembly 237/237. Both Server runs observed a SignalR _blazor HTTP 101 handshake.
- Exact-head GitHub Actions on `98256eee`: **7/7 workflows succeeded** — Button Runtime, Real Compatibility Browsers, Skill Routing, Documentation Contract, Baseline Quality Gate, Interaction Source Contract and Component Lab Pilot.
- Local verification: full Release solution tests 38/38; Release build 0 warnings / 0 errors; v3 Docs contract 0 findings; v3 Skills contract 0 errors; Docs contract tests 22/22; Skills contract tests 5/5; `git diff --check` passed.
- The four-mode probe records existing unrelated InteractiveServer pointer-value gaps for Slider #442 and RangeSlider #443; they are not Icon failures.
- The source-owned Penpot page 47 and three boards were accepted by the maintainer as DESIGN APPROVED; geometry readback retained 250 / 98 / 153 descendants with zero out-of-bounds elements on each board.
- GitHub Project #5 Status for #429 is **Done** and Issue #429 is closed as completed. The maintainer authorized the owner-side merge after all exact-head CI workflows passed; an independent review submission is not claimed.

**Follow-up boundary:** #552 remains In progress for its broader 18-family Fluent parity audit. The Icon row is implementation-merged and design-approved but remains partial for exhaustive 5,694-glyph matched-state pixel parity, native OS Contrast Themes, native screen-reader speech/AT acceptance and final Fluent gap disposition. No other family is accepted by this closeout. The existing #418 token/theme work also remains independent. Stable `Dev`/2.x, NuGet packages and deployments were not changed; no package was published and no deployment was made.

## Fields showcase repeated-bound ID and label fix — 2026-10-30

Follow-up to the whole-page duplicate-ID finding in [Issue #552](https://github.com/vrassouli/Bluent/issues/552). The original comment highlighted `_timeOnly`, `_timeSpan` and `_dateField`; inspection of the structured Chrome/Edge audit evidence found three additional repeated-binding groups in the same `Fields.razor` page (`_textField`, `_smallTextField`, `_switch`). Fixed the demo composition only: all six repeated-bound groups now use explicit, distinct input IDs; each visible label points to its matching ID; the search-addon field has an explicit accessible name. Removed the now-unused `_nullId` field. No Bluent library component, public API, token or CSS was changed.

Validation on 2026-10-30: `dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug -warnaserror` succeeded with **0 warnings / 0 errors**. The new focused live Chromium CDP regression probe passed **Chrome 10/10** and **Edge 10/10**: whole-page ID uniqueness, all 12 affected controls with unique IDs and valid visible-label/ARIA names, and applied Light/LTR, Dark/RTL and emulated forced-colors modes. A 390×844 mobile viewport reported `scrollWidth === innerWidth` in both browsers. Detailed evidence: `docs/v3/quality/evidence/BLUENT-FIELDS-DEMO-ASSOCIATIONS-CHROME.json` and `...-EDGE.json`; repeatable test: `scripts/quality/probe_v3_fields_demo_associations.mjs`. Forced-colors is browser-emulated, not native OS Contrast Themes; no screen-reader certification is claimed. `node --check` and `git diff --check` pass.

This is a demo-composition correction, not evidence that the six underlying component families meet full Fluent 2 parity. Keep the work isolated on `v3/issue-552-fields-demo-ids`, target `bluent-v3`, and retain #552 as In progress until exact-head CI and maintainer review. Stable `Dev`, v2.x, package publication, tags and deployments remain untouched.


## #430 Label implementation checkpoint — 2026-11-07

Started the isolated `v3/issue-430-label` task branch from current `bluent-v3` after the maintainer approved Label's three semantic text roles. The native `<label>` association is preserved; the Info Button is a sibling, named by a localized default with an optional `InfoButtonAriaLabel` override, and uses the shared Popover for Escape/focus restoration/focus-leave cleanup. Required/Disabled remain visual-only states and the required marker is decorative to AT. The three approved roles use source-token fallbacks; no component-only token namespace is introduced. Demo, English/Persian resources, canonical v3 reference, dedicated task Skill, migration M20, additive CLR API snapshot and source regression contracts are recorded. Local Release build is 0 warnings/0 errors and the existing .NET suite is 38/38; focused Label/Popover contracts are 10/10 and 25/25. Real browser Label runtime and native AT evidence remain pending; #430 stays In progress, not Review/Done. No merge/release/stable 2.x change is made.


### #430 Label live-browser checkpoint — 2026-11-07

Real Chrome and Edge headless CDP runs against the Debug Blazor WebAssembly demo route `/components/labels` each passed **14/14** assertions. Both engines verified native `for`/input association, Info Button sibling placement and accessible name, truthful collapsed/expanded disclosure state, required marker hidden from AT, RTL logical gap, focus transfer into Info, keyboard Escape restore, Tab to an in-surface link, Tab/focusout dismissal without focus theft, and 1280px/390px no-overflow geometry. Chrome and Edge JSON evidence is stored in `docs/v3/quality/evidence/BLUENT-LABEL-{CHROME,EDGE}.json`. The shared Popover focus-leave fix uses owner-scoped capture-phase `focusout` and is covered by the 25-test Popover bundle contract. Chromium AX-tree observations are not native screen-reader speech; native OS Contrast Themes and spoken AT remain unperformed. PR browser workflow now runs the Label probe in both real browsers. #430 remains In progress pending exact-head CI and review.


### #430 Label follow-up — complete live-browser matrix, 2026-11-07

The Label Info accessible-name probe was extended to cover both the explicit `InfoButtonAriaLabel` override and the default name generated from the visible Label text plus the active localized resource suffix. Updated live Chrome and Edge runs both passed **14/14**. The default name in these runs used the demo/browser's active English resource with Persian visible text; the `fa-IR` resource is compiled into the library satellite assembly and is also protected by the resource contract, but a browser run with the application UI culture explicitly forced to `fa-IR` has not been claimed. The PR browser matrix now skips the Label-specific job on unrelated PRs that do not contain the Label probe/source, and uploads the corresponding browser evidence when it runs.


### #430 Label 2×2 browser/culture matrix — 2026-11-08

After extending the live CDP probe with a trusted Enter click, Space activation, outside-pointer dismissal and strict culture assertions, all four local runs passed **18/18**: Chrome/en-US, Edge/en-US, Chrome/fa-IR and Edge/fa-IR. The Persian runs verify `navigator.language=fa-ir` and the rendered default Info accessible name `نشانی صورت‌حساب، اطلاعات بیشتر`. Evidence is in `docs/v3/quality/evidence/BLUENT-LABEL-{CHROME,EDGE}[-FA-IR].json`. The probe now honors the exact browser executable supplied by `CHROME_PATH`, matching the PR workflow's selection. Native screen-reader speech and OS Contrast Themes remain untested.


### #430 Label Popover terminal-dispose cleanup — 2026-11-08

The lifecycle review found that owner-level focus-leave listeners were removed when an individual Info Popover closed or was destroyed, but were not explicitly removed if the entire shared Popover manager was disposed while a surface remained open. `Popover.dispose()` now enumerates the remaining focus-leave owners and unbinds every capture-phase listener before finishing manager cleanup. The Popover source/bundle contract now has **26/26** regression tests, including a negative mutation for full-manager disposal cleanup. ESM/global bundles were regenerated and source/dist/published assets match.


### #430 exact-head CI compatibility fix — 2026-11-08

The first PR run exposed one stale #420 source assertion: it assumed only Button-managed menus could own generated `aria-expanded`/`aria-controls`. Label Info is a separate, explicit disclosure owner, not a Button menu. Updated the shared regression to distinguish Button menu, opt-in disclosure and Label Info ownership while asserting Label does not use the Button-menu marker. The #420 source-only lifetime debt gate passes, and all **35/35** interaction primitive tests pass locally. This is a test-contract correction; no runtime behavior was loosened. A follow-up commit is being pushed so exact-head GitHub CI reruns.


### #430 nested-dialog Escape compatibility regression — 2026-11-08

Exact reproduction of the full CI step found the remaining failure in the second suite, `test_v3_popover_foundation_compatibility.py`: its nested-dialog Escape assertion expected only `isOptInDisclosure`. Updated the regression to verify the two distinct scoped disclosure owners (Foundation opt-in and Label Info), while retaining the requirement that unrelated Escape events reach the parent dialog. The complete workflow's three suites now pass locally: **35 + 5 + 3 = 43 tests**, plus the source-only lifetime debt audit.

## #431 Link implementation — 2026-11-09

Started v3/issue-431-link from the latest origin/bluent-v3 commit (b2e2f67d), preserving unrelated dirty state in the original checkout. The implementation retains the existing public API, normalizes null/empty/whitespace destinations once, preserves native anchor navigation and additive callbacks, suppresses callbacks in both disabled modes, applies the approved disabled-navigation ARIA/focus contract, and adds a visible focus ring with forced-colors support. Focused HtmlRenderer tests, an expanded Link showcase and Component Lab samples are included. Penpot page 50 behavior and state/theme/layout boards are linked from #431; their current status remains DRAFT and #418 still owns final token decisions. This is a task-branch engineering checkpoint, not a claim of family acceptance or release.

### #431 Link acceptance evidence — 2026-11-09

The Component Lab was extended with a native anchor target that preserves the live host for callback measurement, a real additive navigation callback counter, explicit RTL sample and disabled action/navigation callback specimen. The browser probe now asserts navigation, target passthrough, Subtle hover/active underline, disabled pointer/Enter/Space suppression, AX role/name, Tab order, focus-visible and forced-colors behavior.

Actual Dev01 browser matrix: Chrome/WebAssembly **255/255**, Edge/WebAssembly **255/255**, Chrome/Published InteractiveServer **252/252**, Edge/Published InteractiveServer **252/252**. Both Server runs established SignalR WebSocket HTTP 101. Evidence: docs/v3/quality/evidence/link-browser-matrix-20261109.json. The shared Component Lab coverage ledger records the four runs but retains representative_only, because its classification describes the 66-family platform ledger rather than the family issue's acceptance.

The canonical Link reference now inventories all direct and inherited public parameters/attributes, defaults and inherited tooltip lifecycle. Design decisions are traced to Penpot page 50, both board IDs and maintainer-approved behavior contract comments on #431. The Penpot page remains labeled DRAFT; no #418 global token values or aliases were approved by this work. Browser forced-colors emulation and browser AX-tree inspection are not presented as native Windows Contrast Themes or spoken screen-reader acceptance.


## TextField #432 execution checkpoint — 2026-11-11

Issue [#432](https://github.com/vrassouli/Bluent/issues/432) remains **In progress** on the isolated `v3/issue-432-textfield` branch. Draft design/API audit PR [#562](https://github.com/vrassouli/Bluent/pull/562) targets `bluent-v3`; it is not the runtime implementation and must not be marked complete.

The shared #421 Component Lab now demonstrates seventeen current-API TextField specimens: live oninput and default onchange, native input and textarea, both textarea resize modes, disabled versus readonly, DigitOnly, AsciiDigits, ArabicToPersianConversion, combined and independent StartAddon/EndAddon, Small/Large sizes, first-render GainFocus, required DataAnnotations/EditContext validation, Bluent Label Display/Required association, native attribute forwarding, and wrapper Class/Style. A seventeenth fixture verifies an independently named EndAddon button stays focusable and Enter-operable beside a disabled input. Focused Chromium CDP checks passed on 2026-11-11 in **Chrome and Edge × WebAssembly and published InteractiveServer**; the Server runs completed real SignalR HTTP 101 handshakes. The expanded evidence is recorded in `docs/v3/quality/COMPONENT-LAB-COVERAGE.json` and the task contract. The demo project Debug build succeeded with 0 errors; four existing NU1903 advisories for `Microsoft.AspNetCore.WebUtilities` 10.0.7 remain visible and were not suppressed.

This is evidence for the **existing v2/current API baseline**, not v3 TextField source, approved Fluent parity, native Windows contrast or AT acceptance. No production TextField source/CSS or 2.x release assets changed. #418 is in Review but token names/values and production mappings still require acceptance; do not wire provisional tokens into TextField CSS. Next: finish API/design review, obtain #418 token acceptance, then implement v3 and complete the remaining validation, docs/Skill, migration and acceptance matrix.


## TextField #432 follow-up checkpoint — 2026-11-11

GitHub CI on exact head 23d733aca0060192800cf328fa28f24895ddef06 is fully green: Component Lab Chrome/Edge × WASM/InteractiveServer 4/4; Compatibility browser jobs 4/4; Label/Info Chrome/Edge × en-US/fa-IR 4/4; Release build/tests/five-package validation; Evidence policy; and Documentation Contract. Full shared Component Lab counts are 266/266 per WASM run and 263/263 per Server run, not TextField-only counts. No package was published.

Penpot page 19 reflow preview was moved 85px right; a new export verifies it no longer overlaps the wide second field. This is a geometry/readability correction only. Pages 17–20 remain DRAFT; no token or maintainer approval is implied. #418 is Review and #432 remains In progress.


## TextField #432 interactive-addon regression checkpoint — 2026-11-11

The seventeenth current-API specimen covers an independently named Clear button in EndAddon beside a disabled input. Local browser verification confirms the action remains enabled/focusable, receives Tab from the previous input, and activates on Enter while the native input stays disabled. Final Dev01 four-mode matrix: 269/269 full shared Component Lab assertions in each WASM browser and 266/266 in each Server browser (1070/1070 aggregate); all 19 TextField-targeted checks pass in every run. InteractiveServer completed SignalR HTTP 101 handshakes; browser cleanup remaining=0. #432 remains In progress and #418 remains Review; this is not v3 product acceptance or Penpot sign-off.


## TextField #432 clipboard-paste and composition observation — 2026-11-11

Three actual Ctrl+V clipboard-paste checks now cover DigitOnly, AsciiDigits and ArabicToPersianConversion. A synthetic DOM insertCompositionText/isComposing observation records current v2 setter behavior, but is not a physical/native IME test. Final local Dev01 matrix: 273/273 full shared Lab assertions per WASM browser, 270/270 per Server browser, 1086/1086 aggregate; all 23 TextField-targeted checks passed in all four Chrome/Edge x WASM/InteractiveServer runs. Server completed SignalR HTTP 101; browser cleanup remaining=0. Real OS IME, caret/selection, transform-flag combinations, accessibility and design acceptance remain open. #418 is Review; #432 remains In progress.

## TextField #432 quality-gate security remediation — 2026-11-13

Exact-head CI on `861adc9e9dd0e7c2942d77db8e7c225f3a34a693` had all browser, Component Lab, evidence-policy and documentation jobs green; the sole failing job stopped in the Release build at NU1903 for `Microsoft.AspNetCore.WebUtilities` 10.0.7 (GHSA-x33c-w48q-qrgc). Updated direct .NET 10 ASP.NET Core / Extensions package references from 10.0.7 or 10.0.14 to patched 10.0.15 across ten library/demo/sample project files on the isolated #432 task branch. No warning suppression was added and stable/v2 branches or release assets were not touched.

Local validation after the update: solution restore succeeded; full Release solution build with `-warnaserror` succeeded; solution tests passed 46/46; Component Lab pilot contract and generated queue validation passed; Node Probe syntax and `git diff --check` passed. The separate `dotnet list package --vulnerable` command stalled during NuGet report retrieval and was cancelled, so a standalone vulnerability inventory is not claimed. The new exact-head GitHub workflows must still verify this package bump.

The package remediation unblocks the prior Release-build failure but does not satisfy TextField #432. The 23 targeted assertions per mode / 1086 total shared Component Lab assertions test the existing API, not a v3 TextField implementation. #418 token acceptance, Penpot maintainer sign-off, native IME/caret/selection, v3 runtime/API/CSS, accessibility/RTL/theme checks, docs/Skill/migration and final acceptance remain open. #432 remains In progress; PR #562 remains open and unmerged.


The first CI run on the package-remediation commit then exposed two stale fail-closed test fixtures in `scripts/quality/test_v3_quality_gate_contract.py`: they asserted the repository still contained `10.0.14`, then tried to downgrade it to `10.0.13`. Updated the quality-contract checker minimum for the ASP.NET Core `WebAssembly.Server` and `WebAssembly.DevServer` packages to `10.0.15`, and changed each negative control to inject `10.0.14` into a copy of the current project text. All **50/50** quality-contract tests and the standalone checker now pass; the negative controls still prove that the vulnerable pre-fix patch is rejected.

## TextField #432 — full transform matrix and final local verification — 2026-11-13

Branch: `v3/issue-432-textfield` → `bluent-v3`; PR #562 remains open. The latest engineering changes are recorded in the task branch; exact-head GitHub CI must run on the next evidence commit.

### Current-API Component Lab coverage expansion

Expanded the shared Component Lab TextField section to **21 live specimens** on the existing released/v2 API. The three transform flags (`DigitOnly`, `AsciiDigits`, `ArabicToPersianConversion`) now have all **eight on/off combinations** represented: none, each single flag, each pair and all three. Each multi-flag combination has a real browser Ctrl+V clipboard test. The two final pairwise cases verify both behavior and ordering:

- `DigitOnly + AsciiDigits`: mixed-script paste filters to Unicode decimal digits, then converts Persian/Arabic-Indic numerals to ASCII (`123456`).
- `DigitOnly + ArabicToPersianConversion`: filtering happens first and Arabic letter variants are normalized; digit script remains Persian/Arabic-Indic because `AsciiDigits` is not enabled (`۱۲٣٤56`).
- `AsciiDigits + ArabicToPersianConversion` and all three flags are also exercised with real Ctrl+V; the all-three path is additionally exercised through native browser text insertion and bound-model feedback.

The copyable Razor example includes all combined cases and their backing state. The browser Probe checks the rendered value and bound status after native clipboard operations, not just the DOM input value. The suite has **28 explicitly named TextField-targeted checks per run**; the full shared Component Lab counts are distinct from that subset.

### Four-mode local browser evidence

Final local Dev01 runs on the 21-specimen / 28-check source passed:

| Browser / render mode | Full shared Component Lab | TextField-targeted | SignalR / cleanup |
|---|---:|---:|---|
| Chrome / WebAssembly | 278/278 | 28/28 | no JS errors; cleanup remaining 0 |
| Edge / WebAssembly | 278/278 | 28/28 | no JS errors; cleanup remaining 0 |
| Chrome / published InteractiveServer | 275/275 | 28/28 | WebSocket HTTP 101; no JS errors; cleanup remaining 0 |
| Edge / published InteractiveServer | 275/275 | 28/28 | WebSocket HTTP 101; no JS errors; cleanup remaining 0 |

Aggregate: **1106/1106 full shared Component Lab assertions across four runs**. The 28 TextField checks are a subset, not an extra 112 checks. Each run completed browser/profile cleanup with `remaining=0`.

Additional validation after the ComponentLab markup update: `python scripts/quality/check_v3_component_lab.py` passed; generated family queue `--check` passed; Node Probe syntax passed; quality-gate contract tests passed **50/50**; full `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror` passed; full `dotnet test Bluent.sln --configuration Release --no-build` passed **46/46**; `git diff --check` clean.

### Boundaries / remaining acceptance

This evidence is still a **current v2/released-API regression baseline**, not implementation acceptance for a v3 TextField. No production TextField API/C#/CSS or stable/v2 assets were changed. The composition event is a synthetic DOM `insertCompositionText`/`isComposing` observation only; physical OS IME behavior, composition cancel/commit, caret and selection preservation remain unverified.

Penpot pages 17–20 remain **DRAFT** and #418 remains Review; final token vocabulary/values and maintainer design sign-off are not approved. Do not use provisional tokens to author final product CSS. Still open: actual v3 TextField runtime/API/CSS, final Penpot/token approval and parity review, responsive/RTL/theme/forced-colors visual acceptance, native keyboard/accessibility/screen-reader review, real OS IME/caret/selection, component documentation/Skill/migration and exhaustive product acceptance. #432 remains In progress; PR #562 remains open and unmerged. No package publish or deployment.

The prior exact-head CI on `7d8ead3b` was green; this expanded 21-specimen matrix is not yet on that head. Run GitHub CI on the next pushed evidence commit and verify every job before updating the status again. The standalone `dotnet list package --vulnerable` report remains unverified because NuGet report retrieval stalled; the 10.0.15 security package remediation, restore, warning-as-error Release build and tests are successful, but do not claim the separate inventory command passed.

## TextField #432 exact-head CI closeout and API audit follow-up — 2026-11-13

The full GitHub exact-head matrix on `160c26bc3a0fcc482e78080bfdcd3062ff4942d8` completed **23/23 checks across seven workflows**, with zero failures and zero pending. This includes Release build/tests/five-package validation; Evidence Policy; Documentation Contract; compiled/public-component Census; Button runtime; interaction source compile and four real Popover runs; four real Component Lab runs; and eight Compatibility jobs (Chrome/Edge × WASM/Server plus Label/Info × Chrome/Edge × en-US/fa-IR). The isolated Edge/WASM retry also passed native Chromium site zoom at 200% and 400% (10/10 per zoom, settled overflow 0, owned-process cleanup remaining 0). The earlier attempt's transient 6px initial Chart.js canvas snapshot/label-focus timeout is not a persistent failure; the retry and final workflow passed.

Live GitHub Project #5 state checked 2026-11-13: #418 Review; #419 Done; #420 Done; #421 In progress; #425 Done; #432 In progress. PR #562 remains open and targets `bluent-v3`. Penpot pages 17–20 contain the four TextField design-review boards, all still explicitly DRAFT. This work does not promote #432 to Review/Done and does not approve #418 token values or the Penpot designs.

The canonical `docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md` has now been corrected to enumerate the inherited InputBase/Bluent field-base surface, distinguish public properties from Razor parameters, record all eight current transform combinations, update the 21-specimen/28-check evidence and four-mode totals, and reflect live Project #5 dependencies. This is documentation/audit only; it adds no v3 runtime or production styling. The standalone `dotnet list package --vulnerable` report remains unverified because NuGet report retrieval stalled; package remediation to 10.0.15, restore, Release `-warnaserror` build and 46/46 solution tests are verified.


## TextField #432 — automated source/API drift guard — 2026-11-13

Added `scripts/quality/check_v3_textfield_contract.py` plus `test_v3_textfield_contract.py`, wired into `.github/workflows/v3-docs-contract.yml` and its `paths` filters. It compares the six direct TextField parameters and documented types/defaults, verifies the inherited Bluent base parameters and framework API rows, native input/textarea branches, binding/attribute behavior, and setter transform order. It also requires the workflow to remain wired to the checker. **Twelve tests** pass (positive baseline plus negative API/source/transform/textarea/evidence/workflow mutations). All mutation tests use temporary copies; the real checkout is left untouched. `check_v3_textfield_contract.py`, existing docs checker and `git diff --check` pass. PyYAML is not installed in the Dev01 environment, so no local PyYAML parse is claimed; GitHub Actions will parse and execute the updated workflow after push.

This guard adds no runtime code or CSS. It protects the existing current-v2 API baseline and the accuracy of the v3 design/API contract only. The v3 implementation and design/token sign-offs remain open.

## TextField #432 — isolate value normalization for direct .NET regression tests — 2026-11-13

On the isolated `v3/issue-432-textfield` branch, extracted the existing `DigitOnly` → `AsciiDigits` → `ArabicToPersianConversion` sequence from `TextField.ValueStringProxy` into the internal, renderer-independent `TextFieldValuePipeline.Normalize` helper. The TextField setter delegates to this helper and still assigns the result to `CurrentValueAsString`. It reuses the same existing string extensions and preserves the current order; it adds no public parameter, component, markup, CSS, token or v3-facing API. `InternalsVisibleTo` is limited to the existing test assembly.

Added ten NUnit cases: all eight on/off combinations of the three flags, plus null and empty input. The source/API guard now verifies setter delegation and helper ordering, including negative mutation coverage; its suite passes **13/13**. The v3 Docs Contract workflow path filter now includes the helper's project/test dependencies.

Local verification on this working tree: focused pipeline tests **10/10**; full Release build with `--warnaserror` **0 warnings / 0 errors**; full solution tests **56/56**; v3 docs contract **0 findings**; Markdown link checker **171 files**; TextField source guard and **13/13** guard tests pass; `git diff --check` clean. Exact-head GitHub Actions have not yet run for this change.

This is a behavior-preserving refactor and direct .NET unit coverage of the existing value transformations, not the v3 TextField runtime/API/CSS or browser/IME acceptance. Penpot pages 17–20 and #418 token vocabulary/values remain unapproved; visual implementation remains behind those design gates. Issue #432 remains In progress and PR #562 remains open. No stable/v2 branch, NuGet release or deployment was changed.

## TextField #432 — mid-string normalization caret observation — 2026-11-13

A temporary, one-run probe was added to the existing #421 Component Lab browser script and restored immediately after the run. In the live current-v2 `AsciiDigits` TextField, value `12345` with a collapsed caret at index 2 received a Persian digit insertion dispatched through Chromium CDP Input.insertText `۹`. The bound value correctly normalized to `129345`, but the resulting native `selectionStart`/`selectionEnd` were both 6, moving the caret to the end rather than retaining its mapped position at index 3. The WebAssembly Component Lab run passed its existing assertions plus this one observational check; the temporary source was restored and `git status` was clean. This is a browser/CDP current-v2 observation, not a physical OS IME test.

The canonical TextField contract now has **24 planned acceptance scenarios**. New `TF-TRANSFORM-005` requires the v3 implementation to map caret and selection offsets through normalized prefixes, including mid-string digit conversion and selected ranges. `TF-TRANSFORM-004` now separates transform composition/IME commit-cancel testing from caret mapping. The fail-closed TextField source/API checker now requires the new scenario and has a negative test proving its removal is rejected. No component API, Razor, CSS, design token, v2 release, or product runtime code changed.

Penpot pages 17–20 remain DRAFT and #418 token vocabulary/values remain unapproved; no runtime styling work is authorized by this documentation-only acceptance refinement. Issue #432 remains In progress; PR #562 remains open and targets `bluent-v3`.

## TextField #432 — exact-head CI closeout — 2026-11-13

Exact-head GitHub Actions for `233bf2207acbb4106bcb875e3a1eac8c42bb4da2` completed **23/23 jobs successfully across all seven workflows, with zero failures and zero pending jobs**:

- Baseline Quality Gate: 2/2 — evidence policy; Release build, tests and five-package validation.
- Real Compatibility Browsers: 8/8 — Chrome/Edge × WebAssembly/InteractiveServer plus Label/Info en-US/fa-IR.
- Documentation Contract: 1/1 — includes the TextField source/API guard and caret-scenario negative test.
- Component Lab Pilot: 4/4 — Chrome/Edge × WebAssembly/InteractiveServer.
- Interaction Source Contract: 5/5 — source/consumer compile plus four real Popover modes.
- Button Runtime Contract: 1/1.
- Public Component Census: 2/2 — source/family snapshot and compiled CLR export baseline.

Exact run records: `43416474367`, `43416474377`, `43416474380`, `43416474385`, `43416474274`, `43416474322`, and `43416474179` respectively.

Local verification on the same head: TextField source/API contract guard passed; focused guard tests **14/14**; v3 docs contract **0 findings**; Markdown links **171 files**; `git diff --check` passed; worktree was clean at push. This exact-head CI closeout supersedes the earlier 'still running' checkpoint for `233bf220`.

This proves the shared repository quality and compatibility workflows on the current branch head; it does **not** implement the v3 TextField or prove caret/selection preservation, physical OS IME, native accessibility, or Penpot parity. #418 remains Review with its token/API approval still outstanding, Penpot TextField pages 17–20 remain DRAFT, #432 remains In progress and PR #562 remains open/unmerged. No stable/v2 branch, NuGet package, release or deployment was changed.


## TextField #432 — Penpot model and contrast audit — 2026-11-13

Audited the connected **Bluent v3 Design System** Penpot file without changing its contents. Pages 17–20 are the four #432 design boards; page 17 contains all 28 unique State × Appearance combinations and the four boards have zero measured descendants outside their bounds. The source variant set on page 16 has four non-empty Penpot variantError metadata records, while their variantProps still contain the intended values.

Calculated text contrast for the 28 TextField sample text nodes using each node's actual containing input-surface fill. Active Outline, Filled lighter and Underline placeholders are 4.74:1. The five active Filled darker state placeholders are **4.347:1** (#62758a over #f5f5f5), below the 4.5:1 normal-text threshold and requiring a design correction. Four Disabled examples are 2.314–2.523:1 and are retained as disabled-state review examples; four ReadOnly values are 9.218–10.05:1. The Dark anatomy and black forced-colors samples pass when compared with their actual inner surfaces.

The Penpot model and SVG markup can be inspected, but the PNG export endpoint returned a network fetch error and page activation timed out. No rendered PNG/pixel-parity review or maintainer sign-off is claimed; pages 17–20 remain DRAFT. No shapes or product source were modified. Keep the contrast/variant metadata findings open for design review and do not substitute unapproved #418 tokens or arbitrary colors.

Latest prior exact-head GitHub CI on 1a4bfe87329a36b8f174dfa83652941a556003ae: all seven workflows succeeded (23/23 jobs). This audit is documentation/evidence only; #418 remains Review, #432 remains In progress, and PR #562 remains open/unmerged. No v3 runtime implementation, merge, package publish, deployment, or stable/v2 changes are claimed.

## TextField #432 — Penpot visual review and exact-head CI — 2026-11-13

The Penpot MCP connection is live again on the owned **Bluent v3 Design System** file. All four TextField boards (pages 17–20) were successfully exported as PNG and visually reviewed. Page 17's 28-state/appearance matrix is complete and readable; pages 18–20 visibly cover anatomy/addons/textarea/sizes/RTL, keyboard/forced-colors/reflow, and Fluent reference/state precedence. This supersedes the earlier PNG-export failure noted in the prior audit. The boards remain DRAFT; visual review is not maintainer sign-off or runtime parity.

The four page-16 `variantError` metadata records remain open even though their `variantProps` show the intended pairs. A reversible `setVariantProperty` probe (temporary value then original value) and a reversible element-name probe did not clear the diagnostic; `variantError` has a getter and no setter. No persistent design mutation was left. Do not reconstruct the component set to hide these warnings without a safe design review.

The five active Filled darker placeholders still measure **4.347:1** (`#62758a` on `#f5f5f5`). No color was substituted; use only the final #418 approved token mapping after its maintainer acceptance. The current #418 project state is still Review, so runtime CSS based on preview token names/values remains gated.

GitHub Actions for exact head `741aa3331b3dd87910ba0d7f71ef7377c835cc5d` completed **7/7 workflows successfully**: Documentation Contract, Public Component Census, Baseline Quality Gate, Component Lab Pilot, Button Runtime Contract, Interaction Source Contract and Real Compatibility Browsers. This is shared repository/branch quality evidence, not v3 TextField acceptance. #432 remains In progress, PR #562 remains open/unmerged and targets `bluent-v3`; no stable/v2 branch, package, release or deployment changed.

## TextField #432 — Penpot variant metadata repaired; placeholder role sent to #418 — 2026-11-13

Repaired the four invalid page-16 TextField variant-name metadata records in the owned Penpot file. The fix had to be applied to each original main-instance shape while page 16 (`e31294c6-7c55-805f-8008-c51213e75deb`) was the active page; changing the library wrapper name or editing from another active page did not clear the diagnostic. After editing the four originals and reopening page 16, the source model reports **28 variants / 28 unique State × Appearance pairs / zero `variantError` values**. All State and Appearance property values are unchanged; no geometry, fills, text, size, position or membership changed.

Investigated the remaining Filled darker placeholder contrast issue. Current `#62758a` on `#f5f5f5` measures **4.3472:1**. Across all 20 emitted theme files (10 brands × Light/Dark), existing neutral roles yield:

- `--colorNeutralForeground4`: Light `#707070` = **4.5423:1** on the TextField specimen; Dark `#999999` = **5.1064:1** on `#292929`.
- `--colorNeutralForeground3`: Light `#616161` = **5.6807:1**; Dark `#adadad` = **6.4827:1** on `#292929`.

The preview schema has no explicit placeholder semantic/component token. Fluent React v9 evidence points to FG4, but that is not a universal Fluent rule and the TextField design crosswalk distinguishes React Input from Web Components TextField. A downstream role decision request is now posted on #418 PR #500 (comment `6855027097`), comparing FG4, FG3 and a dedicated placeholder role. No role is selected, no preview or Penpot colors were changed, and no product CSS/runtime work is authorized. #418 remains Review; #432 remains In progress.

A separate Penpot decision aid was added below the existing page-19 TextField acceptance board: **`#432 · Placeholder role comparison · DRAFT`**, page `343383cb-23d3-80b8-8008-ec440d228749`, board `07d10be0-910e-8048-8008-f09180896f55` (1850 × 540). It compares the existing neutral FG4 and FG3 source roles with measured Light/Dark contrast pairs and the current placeholder baseline. All 25 children are in bounds and the exported PNG was visually reviewed. The original page-19 board and the TextField variant specimens were not changed. Both source roles remain unapproved; no token bindings, placeholder color, CSS or runtime code changed. The review request is tracked in #418 PR #500 comment `6855027097`.
The pinned upstream source was verified by downloading `@fluentui/web-components@3.1.3` with `npm pack` (package metadata confirms `3.1.3`; its SHA-512 integrity matches the stored #552 reference-version record). Its compiled `text-input.styles.css` maps normal `.control::placeholder` to `colorNeutralForeground4`, disabled placeholder to `colorNeutralForegroundDisabled`, and the `filled-darker` root background to `colorNeutralBackground3`.

This corrected the earlier Dark contrast comparison, which mistakenly used BG1 `#292929`. The actual emitted #418 Dark BG3 is `#141414`; Light BG3 is `#f5f5f5`. Across the ten brand themes, FG4 (`#707070` Light / `#999999` Dark) measures **4.5423:1** Light and **6.4663:1** Dark against BG3. FG3 (`#616161` / `#adadad`) measures **5.6807:1** Light and **8.2092:1** Dark. Current `#62758a` on Light BG3 is still **4.3472:1**. FG4 is the direct pinned Fluent source role; its Light contrast pass is narrow (0.0423:1 headroom). FG3 provides more headroom but is a visually stronger departure.

Updated the editable page-19 DRAFT comparison board `07d10be0-910e-8048-8008-f09180896f55`; corrected Dark surface and ratio captions, re-exported and visually reviewed, 25/25 shapes in bounds. The original matrix and product colors are unchanged. The #418 request comment `6855027097` recommends an approved semantic mapping sourced from FG4 for ordinary placeholders and FGDisabled for disabled placeholders. No token is approved or consumed, and no CSS/runtime implementation is authorized until #418 decides.

Added a second separate **DRAFT** Penpot visual study below the page-19 decision board: `#432 · Filled darker placeholder contrast study · DRAFT`, board `07d10be0-910e-8048-8008-f095c3e3c41c` (1850 × 520). It shows Rest/Hover/Pressed/Focus/Error in five columns, with the current placeholder `#62758a` (4.3472:1) and pinned Fluent 3.1.3 FG4 candidate `#707070` (4.5423:1) on identical BG3 `#f5f5f5` surfaces. All 53 children are in bounds, PNG exported and visually reviewed. Disabled placeholder remains FGDisabled; ReadOnly shows a value.

The original page-17 28-state matrix and earlier page-19 comparison board are unchanged. Re-opening page 16 after creating the study still verifies 28 variants / 28 unique State×Appearance pairs / zero variant metadata errors. This is design-review evidence only; no component color, token binding, CSS or runtime was changed while #418 semantic approval remains pending.

Exported and visually reviewed all four primary TextField Penpot boards on 2026-11-13: page 17 full 28-state matrix, page 18 anatomy/sizing/RTL, page 19 keyboard/forced-colors/reflow, and page 20 Fluent crosswalk/state precedence. Each export was legible with no clipped fields, labels or captions. No additional visual geometry defect was found. This is a visual-export check only; all four boards remain DRAFT and no maintainer design approval, runtime parity, native forced-colors or AT sign-off is inferred.
## TextField #432 — #421 platform-acceptance clarification — 2026-11-13

The original #421 acceptance-boundary entry above records the state before the maintainer decision. On 2026-11-02, the project owner explicitly accepted the reusable Component Lab platform contract as an independent prerequisite for starting component work (GitHub issue #421 comment `6573052748`). That acceptance is distinct from closing #421: the issue remains In Progress for the wider 66-family ledger (last measured 66 source families / 18 representative pilots / 16 browser specimens / 0 fully accepted families).

For TextField #432, the shared Lab platform is therefore **not an outstanding start gate**. Its accepted platform can be used for TextField-specific scenarios. The TextField family still owes its own exhaustive runnable demo, API/state/evidence mapping, browser/accessibility verification, docs/migration/Skill, and maintainer acceptance under its own Definition of Done. This does not imply the current-API pilot is a v3 TextField implementation.

The active external foundation decision for token-bound TextField styling remains #418: the ordinary/disabled placeholder semantic/public mapping has been recommended from the exact pinned Fluent Web Components 3.1.3 source (FG4 / FGDisabled) but has not been approved. The four primary TextField Penpot boards remain DRAFT. No public token alias or production styling is consumed until #418 acceptance.

Latest exact-head verification for `2a7584e31bae74a8901d761ba09f60f64dd3a407`: **23/23 GitHub jobs passed across seven workflows**. PR #562 remains open and mergeable against `bluent-v3`; #432 remains In Progress. No stable/v2 branch, package, release or deployment changed.

## TextField #432 — native selection preservation implementation slice — 2026-11-13

Implemented the current-API TextField repair for TF-TRANSFORM-005 on the isolated v3/issue-432-textfield branch. This is not the completed v3 TextField API, not a full 24-scenario family acceptance, and not an authorization to merge or release.

The pure TextFieldValuePipeline.NormalizeWithSelection helper maps both native UTF-16 selection offsets by normalizing each source prefix, preserving selection direction and clamping out-of-range offsets. The component commits the normalized string to InputBase<string?>, retains EditContext, and maps the native input/textarea range after render. A per-element capture-phase input listener snapshots the post-edit selection synchronously before Blazor delegated input handler; the one-shot snapshot is consumed and listener/cache are cleaned up on component disposal. Unsupported native selection APIs remain no-op.

The regression was exercised with real CDP native text insertion: 12345, caret index 2, insert Persian ۹ → DOM and Blazor model 129345, caret/selection index 3. Final current-source Component Lab runs:
- Chrome/WebAssembly: 283/283, cleanup remaining=0.
- Chrome/InteractiveServer: 280/280, cleanup remaining=0.
- Edge/WebAssembly: 283/283, cleanup remaining=0.
- Edge/InteractiveServer: 280/280, cleanup remaining=0.

All four runs reported the same final value and selection offsets, no HTTP asset failures and no unhandled JavaScript exceptions. The shared Lab also records pre-existing unrelated InteractiveServer Slider/RangeSlider known gaps under #442/#443; those are not TextField failures. The shared Lab 18 representative pilots do not complete TextField own exhaustive demo/DoD.

Local automated checks include value-pipeline NUnit tests, fail-closed source/contract mutation tests, docs contract tests, Component Lab source contract and the Release Bluent.UI build. Exact results are in PR #562 and its exact-head CI checkpoint once pushed. Browser composition simulation is not physical OS IME certification; native screen-reader/OS forced-colors acceptance and selected-range coverage across all transformations remain open. The four primary Penpot boards remain DRAFT and #418 semantic token/public placeholder approval remains outstanding. Therefore #432 stays In Progress and PR #562 stays open/unmerged; no stable/v2 source, package, release or deployment changed.

## TextField #432 — native range, textarea and UTF-16 verification expansion — 2026-11-13

Expanded the current-API selection-preservation regression evidence without changing the public API or production component implementation. The NUnit pipeline suite now covers selected-range mapping for all eight combinations of `DigitOnly`, `AsciiDigits` and `ArabicToPersianConversion`, plus UTF-16 offsets after a supplementary Unicode character. The focused suite is **24/24** (previously 15).

The Component Lab now exposes a real `DigitOnly + AsciiDigits` textarea specimen with `oninput` model feedback. Its copyable Razor example matches the rendered specimen. The real browser probe now covers (1) native Persian-digit insertion after an emoji in an input, preserving the mapped UTF-16 caret, and (2) a backward textarea selection, preserving both mapped endpoints, `selectionDirection=backward`, focus and Blazor model value.

Fresh current-source production browser matrix, all assertions passed:
- Chrome / InteractiveWebAssembly: **289/289**, cleanup remaining=0.
- Edge / InteractiveWebAssembly: **289/289**, cleanup remaining=0.
- Chrome / InteractiveServer: **286/286**, cleanup remaining=0.
- Edge / InteractiveServer: **286/286**, cleanup remaining=0.

All four runs observed the input value `😀192345` with caret `[4,4]`, and textarea value `192` with selection `[1,2]`, direction `backward`, focused and bound. The existing mid-string insertion still yields `129345` with caret `[3,3]`. Each run had zero HTTP asset failures and zero unhandled JavaScript exceptions. These are Component Lab representative runtime checks, not exhaustive TextField acceptance or native operating-system IME/screen-reader/forced-colors certification.

Additional checks on the same working tree: TextField source contract **20/20**, TextField contract mutation tests **20/20**, focused NUnit **24/24**, Component Lab source checker PASS, Node syntax check PASS, and `git diff --check` PASS. Exact-head GitHub CI is still pending for the follow-up commit; the previous `d1dacbff` head had all seven workflows green. #432 remains In Progress and PR #562 remains open/unmerged. TextField design boards pages 17–20 remain DRAFT, #418 placeholder-role approval is still pending, and exhaustive 24-scenario family acceptance, migration/Skill, and maintainer sign-off remain open. No stable/v2 branch, package, release or deployment changed.

### TextField #432 — 2026-11-14

- Branch: v3/issue-432-textfield → bluent-v3; PR #562 remains open; GitHub Project #5 issue #432 remains In progress.
- Added source-backed state/validation behavior and the focused /components/text-fields showcase; API remains the six direct v2 parameters plus existing inherited InputBase/field contract. No speculative Appearance/HelperText/ErrorMessage/ReadOnly API was published.
- Added TextField state-layer stylesheet using existing global Fluent role variables, including invalid/focus precedence, readonly/disabled/multiline, forced-colors and reduced-motion.
- Added 30 positive/negative source/API/demo contract tests. They pass. The focused Demo project Release build passed with zero warnings/errors.
- Penpot TextField pages 17–20 remain DRAFT. #418 is still Review; final token roles/mappings and maintainer design decision remain gates. New-route real-browser validation and native OS/AT are pending.
- Do not merge to Dev or publish/release. Existing 2.x behavior and stable branches remain untouched.

### TextField #432 — four-mode browser evidence — 2026-11-14

- Real Chrome/Edge CDP: 23/23 each on WebAssembly and InteractiveServer; 92/92 aggregate assertions.
- Four JSON/PNG evidence pairs are stored in docs/v3/quality/evidence/BLUENT-TEXTFIELD-*.{json,png}. Every run had zero runtime signals and zero QA-owned browser processes after cleanup.
- Added a real InteractiveServer compatibility host that reuses /components/text-fields and added a permanent Windows GitHub Actions matrix to .github/workflows/v3-compatibility-browsers.yml.
- Exact-head GitHub Actions for the new CI matrix await push. Native Windows Contrast Themes, spoken screen-reader acceptance and physical OS IME testing are not claimed.
- Keep #432 In progress until #418 token mapping and TextField Penpot design are approved and PR #562 is reviewed/merged into bluent-v3. Do not merge to stable Dev or publish packages.

## TextField #432 implementation, asset pipeline and four-mode runtime verification — 2026-11-14

The existing task branch `v3/issue-432-textfield` now contains the native Blazor `InputBase<string?>` TextField implementation, validation semantics, explicit readonly/invalid/multiline states, transform/caret-preservation pipeline, focused showcase, InteractiveServer probe route, component reference, family Skill, migration/coverage records, and a fail-closed API/demo/browser-CI guard. Existing 2.x code and stable `Dev` remain isolated.

The actual published asset path is now verified: `src/Bluent.UI/package.json` declares the Sass compiler and a cross-platform `build:scss` entrypoint that compiles `components.scss` to the tracked `components.css`; the existing BundlerMinifier build produces `wwwroot/bluent.ui.components.css` and `.min.css`. The JS package clean-installs and builds ESM/Global bundles; Debug build copies the generated JS files into `Bluent.UI/wwwroot`. The exact-head browser workflow repeats both npm clean installs/builds before building and launching either host. A local `Bluent.UI.1.0.0.nupkg` pack was inspected and contains minified component CSS plus both JS bundles; this was a validation artifact, not a publication.

Local verification on 2026-11-14: TextField guard **39/39**; Docs contract **0 findings**; local Markdown links **172 files**; full Solution Release and Debug builds with `-warnaserror` **0 warnings / 0 errors**; full solution .NET tests **70/70**; clean npm install/build for both JS and Sass packages; focused live browser matrix **92/92** (Chrome/Edge × WebAssembly/InteractiveServer, 23/23 each), with zero HTTP/JS diagnostics and QA browser cleanup `remaining=0`. Four JSON/PNG artifacts are committed alongside the test probe. The Sass compiler emits existing legacy Bootstrap/import deprecation notices; compilation succeeds and .NET builds remain warning-free.

**Acceptance boundary:** #432 remains **In progress** and PR #562 remains open against `bluent-v3`; this checkpoint is not merge/release approval. Penpot pages 17–20 remain DRAFT, #418 remains Review and owns final public token/semantic mapping, and native OS IME, Windows Contrast Themes and spoken assistive-technology acceptance remain unperformed. Exact-head GitHub Actions initially passed both WASM browsers but exposed an InteractiveServer binding timeout on the hosted runner; the same route passes locally in Chrome and Edge with an HTTP 101 SignalR WebSocket. The current probe/workflow revision preserves browser network/SignalR events and host stdout/stderr to diagnose the runner-only discrepancy. Exact-head CI must pass before acceptance. No merge, NuGet publication, stable/v2 release or deployment occurred.

## TextField #432 — InteractiveServer readiness and final local matrix — 2026-11-14

The first hosted-runner attempt exposed a test-harness race: static SSR markup was visible before the InteractiveServer circuit completed its first render, so the probe could dispatch the initial bind event too early. The SSR probe route now emits `#textfield-interactive-ready` only after its first `OnAfterRenderAsync`; the browser probe waits for this marker before touching any field. The source/API guard requires the exact predicate and marker, and two negative mutation tests prevent either readiness half from being removed silently.

Final local validation after this change: TextField guard **43/43**; component reference/docs contract **0 findings**; Markdown links **172 files**; full Solution Release build with `-warnaserror` **0 warnings / 0 errors**; full solution .NET tests **70/70**; live browser matrix **94/94** (Chrome/Edge × WASM 23/23 each; Chrome/Edge × InteractiveServer 24/24 each). Both Server runs recorded `_blazor/negotiate` HTTP 200 and SignalR WebSocket HTTP 101. All four JSON/PNG artifacts are refreshed; no browser JS/console/HTTP failures and browser cleanup `remaining=0`.

**Current acceptance boundary:** the readiness correction is locally verified; exact-head GitHub Actions for the new commit must also pass. #432 remains **In progress**, PR #562 remains open/unmerged against `bluent-v3`, #418 remains Review for token approval, and Penpot pages 17–20 remain DRAFT. Native OS IME, Windows Contrast Themes and spoken assistive-technology acceptance are not claimed. No NuGet publication, stable/v2 merge, deployment or release occurred.

## TextField #432 — GitHub Actions host lifecycle fix — 2026-11-14

The hosted runner terminated the background .NET host as an orphan between GitHub Actions steps. The host was being started in one step and the browser probe was running in the next; local execution therefore passed while hosted InteractiveServer jobs received connection refused. The browser workflow now starts the selected host, polls readiness, runs the real browser probe and tears down the host/browser processes within **one PowerShell step**. This preserves the host process for the whole probe and keeps cleanup deterministic. The scoped TextField contract extracts that exact YAML step and requires `Start-Process`, `Invoke-WebRequest`, the probe command, host `taskkill`, and retained logs within the same step; two negative mutations prevent splitting probe or cleanup out again.

Latest local CI/contract validation: TextField guard **43/43**; docs contract 0 findings; links in 172 Markdown files; JavaScript probe syntax valid. The local live matrix remains **94/94** (Chrome/Edge × WASM/InteractiveServer), and Release build/tests remain **0 warnings/0 errors** and **70/70** from the prior full verification. Exact-head GitHub Actions for the one-step lifecycle correction must pass before the PR can be treated as ready for maintainer review.


## TextField #432 — Fluent placeholder role and rendered CSS regression — 2026-11-14

The selected Fluent Web Components 3.1.3 consumer mapping is now implemented in the TextField stylesheet: ordinary input/textarea placeholders use --bui-v3-text-placeholder with exact --colorNeutralForeground4 fallback; disabled placeholders reuse --bui-v3-text-disabled with --colorNeutralForegroundDisabled fallback. Placeholder remains supporting hint text, never the accessible name. The family Skill, canonical TextField docs and fail-closed source/API guard now record the same decision.

The demo includes a native placeholder on the disabled control. The real CDP probe reads the computed ::placeholder styles and compares them with the active Fluent source variables. The two new assertions passed locally in Chrome/WASM and Edge/WASM: **25/25 each (50/50 total)**. The new test guard is **48/48**, docs contract has **0 findings**, Markdown links checked in **172 files**, Node syntax check passes, Sass compiles, and both WebAssembly and InteractiveServer Debug host builds pass with **0 warnings / 0 errors**. The local refreshed InteractiveServer run is not claimed: the Development static-web-asset handler reported missing SSR host assets; exact-head GitHub CI must verify both Server cells. The prior Server evidence remains 24/24 each and predates the two new placeholder assertions.

No stable/v2 code, package or deployment changed. Penpot pages 17–20 remain DRAFT; the GitHub decision is recorded, but the Penpot plugin's write calls timed out and its comment was not confirmed. #432 remains In progress and PR #562 remains open/unmerged pending exact-head CI and maintainer review.


## TextField #432 — exact-head hosted Windows browser matrix completed — 2026-11-14

GitHub Actions exact head b7e4182af8be5d94e5a06aad66bc122dc71cbc6a completed all **8/8 workflows successfully**. Compatibility Browsers passed **12/12 jobs**, including the dedicated TextField cells: Chrome/WebAssembly **26/26**, Chrome/InteractiveServer **26/26**, Edge/WebAssembly **25/25**, Edge/InteractiveServer **25/25** (**102/102 aggregate**). All four pass both rendered pseudo-element assertions for normal `colorNeutralForeground4` placeholder and disabled `colorNeutralForegroundDisabled` placeholder. The jobs reported zero browser JS/console/HTTP failures and cleanup remaining=0. Interaction Source Contract passed **5/5**; Component Lab **4/4**, Release/Baseline, Census, Docs, Skills and Button Runtime also passed. Four dedicated TextField JSON/PNG sets are uploaded as artifacts in workflow run 43574692277; their artifact names and exact-host evidence are recorded in docs/v3/components/text-field.md.

The local refreshed InteractiveServer run had a Windows Development static-web-assets limitation; the hosted Windows results above supersede that local limitation for this commit. This does not represent physical OS Persian IME testing, Windows Contrast Themes acceptance, or spoken screen-reader acceptance. Penpot pages 17–20 remain DRAFT; the Penpot comment write timed out and was not confirmed. #432 remains In progress and PR #562 remains open/unmerged pending maintainer review and remaining native OS/AT/design acceptance. No stable/v2 merge, NuGet publication or deployment.
