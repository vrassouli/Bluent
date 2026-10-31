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

- 2026-10-17 #421 existing-API Button Toggled/ToggledChanged and Href Lab specimens, native CDP Enter double-toggle with exact parent callback count and native A link semantics; fully copied Razor sample includes parent callback code. Real Chrome/Server 32/32 after fixing test-only ambiguous status selector, Edge/WASM 32/32 after runner was changed to build current WASM Razor instead of stale --no-build fixture. 2 current-source environments passed, remaining two exact new SHA CI pending. Existing toggled Button observed aria-pressed=null: preexisting semantic/AT debt for #428, no acceptance claim. Four pilots/66 families and Penpot design remain incomplete, no stable release.

- 2026-10-17 #421 advanced existing public Button pilot: responsive Compound+Compact Notifications Badge End/Bottom and Dropdown BottomEnd with real Export/Share MenuItem callbacks. Native CDP Enter opens Popover, real hit-tested pointer selects actions and counts exact parent callbacks 1/2. Edge freshly built WASM 40/40 PASS, zero errors/browser remaining=0. Existing canonical Penpot Component Lab page42 board DRAFT reused; plugin unavailable, no source design mutation or human acceptance claimed. Coverage now samples 16 of 20 public Button Parameter properties plus disabled AdditionalAttributes; four pilots/66 source families, zero completed. Latest SHA CI and native AT/Fluent parity remain pending. Stable Dev/NuGet untouched.

- 2026-10-17 #421 advanced Button Server renderer parity fix: first Chrome/Server test timed out opening Dropdown because compatibility server page lacked PopoverContainer (normal WASM layout had it). Added Bluent Containers only inside the Server interactive probe, not main app/product; added source guard. Fresh production-published Chrome/Server 40/40 PASS, zero errors/browsers remaining=0; local Edge/WASM also 40/40. Two other modes and exact-head CI still pending, no design/AT approval or stable merge.

- 2026-10-17 #421 Icon/Label current public API explorers: Icon Value Settings/Search and Variant Regular/Filled source-backed dynamic DOM; Label Text/ForExpression/RequiredSymbol/Size/Required/Info six public params sampled using annotated LabEmail + native input association, Auto/NotRequired/Required switching and real Info Popover. Initial Edge/WASM test RED because assumed SVG innerHTML while current Icon renders CSS-class-backed native i, fixed harness to compare actual outerHTML; reran final Edge/WASM 53/53 and Chrome/production-published Server 53/53 PASS, zero errors or owned browser leftovers. Demo-only input focus underline, no full ring. Canonical Penpot page42 DRAFT remains unmodified due disconnected plugin, zero component acceptance; #429/#430 Backlog unaffected, exact four-mode GitHub CI pending; no stable Dev/NuGet.

- 2026-10-17 #421 Color prototype only: audited official MIT @fluentui/svg-icons 1.1.344: 196 color SVGs at 20px, deprecated upstream HCM/dark contrast warnings; source-owned Figma fallback design board 26:3 with three REAL Apps20 vectors. Component Lab previews official Color SVG via existing FromSvg and CSS-only Filled forced-colors fallback. First Edge/WASM real test RED due scoped Blazor CSS isolation hiding neither; demo-only ::deep correction fixed it, **57/57 Edge/WASM real checks PASS**. #429 Backlog tracks future public IconVariant.Color; product/stable/NuGet untouched; new exact-head CI pending.

- 2026-10-17 #421/#429 official Fluent Color Icon prototype decorative a11y: exact real Bluent Color SVG and Filled HCM fallback aria-hidden and natively untabbable, actual Chromium AX ignores visible Color vector, native CDP Tab skips both, emulated forced-colors visible Filled stays decorative with visible adjacent readable title. Four new fail-closed real browser QA checks; local Dev01 Edge/fresh WASM 61/61 and Chrome/published InteractiveServer 61/61 PASS, zero errors and scoped Chromium remaining=0. Public IconVariant.Color STILL NOT implemented, named OS AT and Penpot human visual acceptance pending, exact-head four-mode CI pending, stable Dev/NuGet untouched.

- 2026-10-17 #421 representative Button 20/20 existing C# [Parameter] names now have a live Lab specimen (plus disabled HTML AdditionalAttribute), in four total pilot families of 66; ZERO completed. Added Icon/TextClass/Vertical and Rotated current API Bluent Buttons with computed geometry/class/font/writing mode, real native Tab focus-visible and copyable Razor. Four browser checks raise 61 to 65. Local Chrome/fresh WebAssembly 65/65 and Edge/published Server 65/65 PASS, QA browser cleanup zero. Initial test 64/65 red only due harness seven-vs-nine old count, fixed/retested. Source contract reads real Button.razor.cs [Parameter] set to fail closed on API drift. Existing Penpot page42 DRAFT not edited; #421 In progress/PR #551 Draft, #428 Backlog. No public API/stable Dev/NuGet. New-head GitHub CI pending.

- 2026-10-17 #421 first exact-head browser CI concurrent cold Chrome/WASM run failed before CDP port appeared at hardcoded 20-second startup timeout (no Lab assertions executed); a separate Chrome/WASM plus Edge/WASM on same head each passed 65/65. Hardened only actual DevToolsActivePort launch wait to 60s, retained fail-closed real browser connection and all 65 checks, negative source guard added. Must independently revalidate new SHA; this is NOT a product Button failure or a license to skip failing CI, no stable Dev/NuGet changes.

**#421 Split Button real Lab demo (2026-10-18):** Existing public
OnClick plus Dropdown Split Button now has a current-API specimen
and independent callbacks in /component-lab, copyable Razor,
and five CDP keyboard/actual pointer behavior checks. Dev01 exact
local source Chrome/Edge x WASM/published Server each 83/83,
332/332 total; owned browser cleanup=0. 20/20 existing public Button
parameter names remain representative-only, zero 66-family
component acceptances, Penpot page42 DRAFT/AT unverified. #421
In progress, PR #551 Draft; #428 Backlog. No stable release.
**#421 RTL English sample copy legibility (2026-10-18):** English advanced
Button specimen headings and status/help text now carry explicit LTR
base direction without altering RTL control order. RTL text is
right-aligned, LTR text left-aligned, margins normalized and wrapped
inside spaced cards. Current source Chrome/WASM and Edge/published
Server 92/92 each on real Dev01 browser, zero browser leftovers;
[real current screenshot](../docs/v3/quality/evidence/component-lab-split-rtl-english-legibility-chrome-wasm.png).
Still #421 In progress/PR Draft; #428 Backlog; 0/66 accepted.


## #421 Component Lab platform acceptance boundary — 2026-10-30

The canonical Penpot workspace is the source-owned Bluent v3 Design System file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 42 `e775e67c-d9da-804b-8008-cc7c2dd7ecf7`. Added editable board `#421 · Lab platform vs component DoD · REVIEW REQUIRED`, ID `fce13529-02e2-80e4-8008-de96e1fdaca3`, with 21 native editable shapes. It separates the reusable Lab platform acceptance (searchable family catalog, controlled live specimens, copyable Razor, machine-readable source/API coverage, evidence-state distinctions, four-mode browser gates, accessibility/failure-visible QA) from the per-family Definition of Done (approved family design, complete API/state/keyboard/ARIA, Light/Dark/RTL/forced-colors, responsive/browser/native evidence, docs/migration/Skill and maintainer acceptance). Live Penpot readback: 12/12 text shapes fit their text bounds; 0 overflow.

This is a review proposal, not approval. The board requests maintainer acceptance of the Lab platform as a prerequisite to beginning a component while retaining full per-family coverage as each component's own DoD. Current coverage is **18 representative pilots / 66 source families / 0 accepted families**. Do not inflate the metric or mark #421 Done. The two existing page42 Desktop/Mobile designs remain drafts. No public component source/API/CSS was changed by this design step.

## #425 — .NET 10 Blazor debugger package security update — 2026-10-30

The 2026-10-25 update to GHSA-g27p-qf6j-c96c establishes 10.0.14 as the fixed .NET 10 version for both `Microsoft.AspNetCore.Components.WebAssembly.Server` and `Microsoft.AspNetCore.Components.WebAssembly.DevServer`. On the isolated `v3/issue-425-quality-gates` branch, raised the SSR host package from 10.0.13 to 10.0.14 and all three active DevServer consumers (`Bluent.UI.Demo`, `Bluent.TaskExamples`, `Bluent.OrderDesk`) from 10.0.7 to 10.0.14. No Bluent library API, runtime component code, stable `Dev`/2.x project, package, tag or deployment was changed.

The quality gate now enforces the 10.0.14 minimum on the SSR Server package and on every active `src/**` / `samples/**` DevServer project; added current-version and negative regression tests so 10.0.13 cannot silently pass. The previous 10.0.13-only server guard was insufficient after the Oct 25 advisory update.

Local verification on 2026-10-30: forced `dotnet restore Bluent.sln` PASS; `dotnet list Bluent.sln package --vulnerable --include-transitive` reports **no vulnerable packages**; full `dotnet build Bluent.sln --configuration Release -warnaserror` **0 warnings / 0 errors**; full Release tests **31/31**; quality-gate source contract PASS; quality-gate regression tests **50/50**. Five-package pack/manifest validation and exact-head GitHub Actions are still pending. No NuGet package was published.

The installed local .NET shared runtime on Dev01 is 10.0.12; this change updates the repository's vulnerable package references, not the machine-wide runtime. CI's `setup-dotnet` uses the latest `10.0.x`. Do not describe the host runtime itself as updated.
### #425 completion update — 2026-10-31

PR [#549](https://github.com/vrassouli/Bluent/pull/549) merged exclusively into `bluent-v3` as `e278e202b6730ae91b4c287487d573e0ebb3a7a4`. Issue #425 is closed, Project #5 Status is Done, and Epic #416 checklist is checked. The four-mode QA gate is integrated; no stable 2.x branch, NuGet publication or deployment was changed.