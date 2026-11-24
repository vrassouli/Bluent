# Bluent Handoff

This file is the operational entry point for continuing the current Bluent work with Codex or another coding agent.

## Active v3 foundation gate — #418 Design Tokens (refreshed 2026-11-24)

- Dedicated branch: `v3/issue-418-design-tokens`; PR [#500](https://github.com/vrassouli/Bluent/pull/500) targets `bluent-v3`, remains OPEN/unmerged, merge state CLEAN, and has no formal approval decision. Last fully verified engineering head before this documentation-only follow-up: `2613b6bf5d844b023725b03509c0d517816e9601` (13/13 workflows successful). Exact-head GitHub Actions: **13/13 workflows completed successfully**, with zero failures or active jobs. `gh pr checks 500` is green. Working tree was clean at this checkpoint before the documentation refresh.
- The owned-browser cleanup fix is bounded to 8 seconds, scoped to the probe's unique temporary profile path, and performs a fresh post-loop process inventory. The Label Info probe waits for the visible surface, `aria-expanded=true`, and actual focus on the Info surface before evaluating its existing focus/no-trap assertions. Regression guards prevent removing those readiness/cleanup requirements.
- Latest Label Info evidence: Chrome/Edge × en-US/fa-IR **72/72 assertions** locally; all four hosted Label Info jobs pass on exact head. The Edge/WASM alpha-host probe also passed **1,179/1,179** locally; latest exact-head CI is green. Alpha-host Chrome passed 80/80 with zero owned-profile leftovers; cleanup regression **24/24**.
- Other focused local checks: Label contract 11/11; Popover JS bundle 26/26; Native HC evidence guard 7/7; #418 review contract 21/21; validation-text contrast tests 10/10; token-preview contrast 13/13; generator `--check`; docs contract 0 findings; Markdown link scan 242 files; `git diff --check`.
- Contrast boundaries: **60/60** formal neutral-base text pairs across 10 brands × Light/Dark × Neutral Background 1/2/3 pass 4.5:1 (minimum 5.2036:1). The separate 2,180-pair opaque-host diagnostic is mixed (834 pass; 26 surfaces pass in every theme, 51 fail in every theme, 32 mixed); it is not a universal-compliance result. Sixteen non-opaque/alpha surfaces are excluded from simple arithmetic. `semantic.text.validation` remains review-only and outside the 17-role schema/public allow-list.
- The 40 Dark foreground values meet the 4.6:1 preview target on opaque Dark NeutralBackground1 (minimum 4.6001:1), but exact values and aliases are not approved. The 46-role taxonomy is 16 source / 17 semantic / 13 component roles.
- Acceptance review aid: [#418 acceptance-review board (DRAFT)](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=132-2), page 14:2, frame 132:2 (1540 × 1769; 7 sections; 76 editable text nodes).
- Semantic scope register: [17-role evidence and scope register (DRAFT)](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=134-12), same page 14:2, frame 134:12 (1540 × 2463; 17 role instances, one shared row component, 127 editable text nodes). Inventory: 3 first-wave candidates, 2 restricted roles, 12 deferred roles. Each row records consumer evidence, bounded scope and open gate. It is review context only—not public allow-list approval. Both Figma frames are in the independent authorized working file because Penpot was frozen in this session; neither replaces canonical Penpot sign-off.
- Canonical editable design remains **Bluent v3 Design System**, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. Page 45 remains DRAFT with its principal contrast board REVIEW REQUIRED; page 55 remains DRAFT. Pages 52–54 describe selected prototypes only.
- Selected engineering directions remain prototype-only: token vocabulary Option B; same-painted-host Focus metadata Option A; Dialog/Popover ownership Option A. Do not consume draft `--bui-v3-*` aliases in product CSS or treat prototype Focus/Portal/Dialog API inventories as approved public contracts.
- **Still open:** final public semantic-token allow-list and production alias names; public Focus/Portal/Dialog type/member contract; broader native Windows Contrast Themes coverage (including High Contrast Black and user-defined schemes); UI Automation and spoken Narrator/NVDA/VoiceOver acceptance; physical-keyboard coverage; native Safari.app/SafariDriver; Persian OS IME composition/caret/selection and cross-platform font metrics.
- Native Windows HC prototype evidence (2026-11-23): Windows 11 Pro build 28000 / Edge 158.0.4370.33 / High Contrast White only. The original OS flags/scheme were restored. Dialog semantics and a limited Tab/Shift+Tab/Escape/focus-return path were recorded; Popover trigger relations were recorded, but its surface had no explicit role and a transparent own background. Input was CDP-dispatched, not physical hardware; no UI Automation or spoken AT output was captured. See `docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.md` and its JSON/PNG companion.
- GitHub Project #5 keeps #418 **In progress** and #438 DateField **Backlog**. Do not merge PR #500, begin #438, activate production CSS, change stable Dev/main, publish NuGet packages, release or deploy. Those actions are outside this checkpoint and require the remaining acceptance/authorization.
- Dated detail: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-24.md`; prior detail: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-23.md`; DateField downstream dependency audit: `docs/v3/tokens/DATEFIELD-FOUNDATION-DEPENDENCY-AUDIT.md`.
### 2026-11-20 — #418 Dark-matrix flake correction (local, pre-push)

The current working tree fixes two observed probe defects: (1) it no longer changes data-bui-theme directly in the DOM, and (2) after hosted Chrome/Server timed out on the component id click, it now finds and clicks the actual native button by its Switch-to-Light/Dark label, reads the rendered data-bui-theme as source of truth, and waits for the Blazor DOM update. It verifies the computed Dark surface/brand/direction, checks Word's opposite AlternateScope mode, and restores Light through the native button. Local Dev01 results: Chrome/Server **1178/1178**, Chrome/WASM **1179/1179**, Edge/Server **1178/1178**, Edge/WASM **1179/1179**; focused Python regressions **61/61**; Release solution build **0 warnings / 0 errors**; solution tests **188/188**; v3 docs contract **0 findings**; Skills contract **0 errors**; Markdown links **238 files**. Exact command/evidence and limits are in docs/v3/quality/evidence/BLUENT-418-DARK-MATRIX-LOCAL-20261120.md.

**Not yet verified:** pushed HEAD and its exact-head GitHub Actions, final Penpot/page-45 and page-55 approval, public token/API allow-list, native Windows Contrast Themes, spoken AT, native Safari and Persian OS IME/caret. The native-button follow-up is locally verified in Chrome/Edge × InteractiveServer/WASM; push it and check exact-head Actions before proceeding. Keep #418 In progress and do not merge PR #500 until the remaining acceptance gates are resolved. #438 remains Backlog; no DateField implementation has started.

### 2026-11-21 — #418 source namespace taxonomy review follow-up

The `bluent.color.*` vs `bluent.source.*` distinction now has an explicit classification rule in `docs/v3/tokens/FOUNDATION-REVIEW-DECISIONS.md` and a fixed 9/7 name-to-CSS allow-list in `scripts/quality/test_v3_issue418_review_contract.py`. Local validation: #418 review contract 21/21, token contrast 13/13, token generator `--check`, 360-pair source contrast audit, docs contract 0 findings, Markdown links 239 files. This is documentation/contract hardening only: no schema, preview CSS, product CSS, public token or API promotion. Current dated checkpoint: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-21.md`. Keep #418 In progress and PR #500 open/unmerged until fresh exact-head CI and the remaining design/native/public-contract gates are accepted.


### 2026-11-23 — #418 validation-text host boundary follow-up

The existing `.validation-message` → `--colorPaletteRedForeground1` mapping remains unchanged. The neutral-base audit passes 60/60 brand/mode/surface pairs (minimum 5.2036:1); an exhaustive 2,180-pair host diagnostic finds 834 passing pairs; 26 surfaces pass in every theme, 51 fail in every theme and 32 are mixed. Brand Background is 0/20 (minimum 1.0027:1), Neutral Background Inverted is 0/20 (minimum 2.4877:1), and Palette Red Background 2 is 0/20 (minimum 3.5017:1); 16 non-opaque/alpha backgrounds are excluded pending compositing evidence. Diagnostic failures are deliberately not counted as neutral-base failures; they establish that the current color is not universal on arbitrary hosts. `semantic.text.validation` remains review-only, outside the 17-role schema/public allow-list. Local tests: validation audit 10/10; #418 review contract 21/21. See `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-23.md`. Fresh exact-head CI is required after push. #438 DateField remains Backlog and untouched.



## Current Objective

Complete [Issue #406](https://github.com/vrassouli/Bluent/issues/406): build and validate the canonical portable Bluent consumer skill from verified source, canonical documentation, examples, and runtime evidence.

The skill must stay retrieval-oriented and Bluent-first. Canonical component/task documentation remains authoritative; `.agents/skills/bluent/` routes consumers to the minimum relevant references instead of duplicating a monolithic API catalog.

## Current Branch and Tracking

- Base branch: `Dev`
- Active branch: `docs/issue-406-consumer-skill`
- Active issue: [#406](https://github.com/vrassouli/Bluent/issues/406)
- Draft pull request: [#407](https://github.com/vrassouli/Bluent/pull/407)
- Product/API gap backlog discovered during #406: [#411](https://github.com/vrassouli/Bluent/issues/411)
- Do not merge PR #407 or close #406 as part of implementation work.

## Read First

1. `AGENTS.md`
2. `.bluent/PROJECT.md`
3. this file
4. `.bluent/QUALITY.md`
5. Issue #406
6. PR #407
7. `.agents/skills/bluent/SKILL.md`
8. `.agents/skills/bluent/COMPONENT-INDEX.md`
9. `docs/components/inventory.md`
10. `docs/ai/bluent-consumer-skill-dogfood.md`
11. `docs/compatibility/hosting-and-render-modes.md`

## Completed #406 State

- `.agents/skills/bluent/SKILL.md` is a compact Bluent-first router with version-awareness and no independent API encyclopedia.
- `COMPONENT-INDEX.md`, `DECISION-GUIDE.md`, foundation references, and pattern references provide targeted retrieval.
- The old root `Skills.md` monolithic catalog is retired in favor of a compatibility pointer.
- Current source reconciliation identifies 57 `Bluent.UI` consumer component families; all 57 have source-verified canonical references.
- Optional-package public types are grouped into consumer retrieval families rather than one route per CLR helper/configuration type:
  - Charts: `Chart composition`, `Gauge`;
  - Diagrams: `Diagram / DrawingCanvas`, `Basic shapes`;
  - Utilities: `AppBusyIndicator`, `Hierarchy`, `MdiTab`, `ToolbarButtons`.
- Total maintained consumer retrieval coverage is 65/65 source verified. Dialog retains separately recorded runtime verification.
- `docs/components/consumer-api-surface.md` classifies service/container/helper/configuration APIs separately from ordinary component families.
- `Containers` is explicitly classified as shared consumer infrastructure rather than an ordinary component family.
- `docs/README.md`, `docs/components/README.md`, `docs/components/inventory.md`, `.agents/skills/bluent/COMPONENT-INDEX.md`, and `llms.txt` are aligned to the 65-family retrieval model.
- `scripts/quality/check_consumer_skill.py` derives the main-UI `*Component` source surface and validates inventory/index/skill drift; Quality CI runs it.
- `docs/ai/bluent-consumer-skill-dogfood.md` maps all required #406 consumer scenarios to canonical evidence.
- New standalone dogfood tasks cover Tree selection/DnD contracts and Utilities busy-indicator setup in `samples/Bluent.TaskExamples`.
- `Bluent.TaskExamples` now references `Bluent.UI.Utilities`, imports its public consumer namespaces, and calls `AddBluentUtilities()`.
- Product/API/runtime/accessibility defects found during verification are recorded in #411 rather than silently fixed inside #406.

## Validation State

Repository Quality CI is the authoritative current-head gate. It performs:

- solution restore;
- zero-warning Release build with `-warnaserror`;
- canonical TaskExamples compilation plus the existing DrawerContent collision negative control;
- consumer-skill source/inventory/index drift validation;
- solution tests;
- release tooling tests;
- packing and validation of the five public NuGet packages;
- local Markdown link checks;
- workflow YAML parsing;
- focused rendered accessibility checks;
- changed-line whitespace checks.

A previous run caught the first Tree dogfood sample using bare values for the `object`-typed `TreeItem.Data` parameter. The sample was corrected to bind explicit backing objects. That was a sample error, not a Bluent product defect.

Existing browser evidence in `docs/compatibility/hosting-and-render-modes.md` already verifies representative Drawer, Popover, Tooltip, Chart, Diagram, navigation, disposal, and overlay behavior across Interactive Server, Interactive WebAssembly, and the observed Interactive Auto renderer, with static-SSR limits documented separately. Reuse only the exact scope of that evidence; do not generalize it to every component.

## Product Gaps

Use [Issue #411](https://github.com/vrassouli/Bluent/issues/411) as the umbrella backlog for concrete product/API/runtime/accessibility gaps discovered during #406.

Examples already tracked include form-control semantics, Slider/RangeSlider keyboard/ARIA gaps, MessageBar state synchronization, DockBar disposal, DataPager query naming, non-reactive MediaQuery behavior, Chart/Gauge dynamic configuration gaps, Diagram drag/shape update gaps, MDI lifecycle/parameter side effects, and Hierarchy case/localization/accessibility concerns.

When another meaningful product gap is found:

1. document current verified behavior in the canonical #406 reference;
2. append the defect/gap to #411;
3. do not silently redesign/fix the public product API inside #406 unless separately approved.

Documentation typos, broken links, and skill-routing drift should be fixed directly in #406 rather than added to #411.

## Remaining #406 Work

1. Get the final current-head Quality and Release-package workflows green after the latest dogfood/link/state changes.
2. Reconcile canonical component pages with existing runtime evidence where it directly applies; leave stronger untested behavior explicitly unverified.
3. Spot-check the remaining public service/helper/configuration classifications for accidental consumer omissions.
4. Record final validation evidence in project/quality tracking.
5. Review #406 acceptance criteria line by line.
6. Keep PR #407 Draft until the acceptance evidence is complete; then make it review-ready only if appropriate.
7. Do not merge, publish packages, create tags/releases, or close #406.

## Constraints

- Do not invent Bluent APIs or behavior.
- Do not create a duplicated monolithic skill/API catalog.
- Prefer canonical docs and targeted retrieval.
- Preserve the zero-warning Release baseline.
- Do not claim runtime/accessibility/render-mode validation without actual evidence.
- Keep product defects visible in #411.
- Keep the branch based on current `Dev` and resolve drift explicitly.


## Separate v3 TextField #432 checkpoint — 2026-11-11

This is a separate Bluent v3 task track; it does not change the existing #406 consumer-skill work above. Continue in worktree `C:\Projects\Bluent-issue432`, branch `v3/issue-432-textfield`, based on `bluent-v3`. Preserve the unrelated dirty files in `C:\Projects\Bluent`. Read `AGENTS.md`, `docs/v3/ISSUE-WORKFLOW.md`, `docs/v3/BRANCHING.md`, `docs/v3/PENPOT-WORKFLOW.md`, and the current TextField contract before further edits.

Issue [#432](https://github.com/vrassouli/Bluent/issues/432) is **In progress**. PR [#562](https://github.com/vrassouli/Bluent/pull/562) is an open design/API audit PR targeting `bluent-v3`; it is not a runtime implementation or acceptance PR.

The shared #421 Component Lab TextField pilot now has seventeen live examples and focused browser assertions for native input/textarea, Rows, both textarea resize modes, disabled/readonly, three transforms, combined and independent addons, Small/Large sizes, first-render GainFocus, default onchange and live oninput binding, DataAnnotations/EditContext validation, Bluent Label Display/Required association, and native attributes/Class/Style forwarding. A seventeenth fixture verifies an independent keyboard-operable EndAddon action beside a disabled input. On 2026-11-11 the TextField checks passed in Chrome/Edge × WebAssembly/InteractiveServer using real Chromium CDP. InteractiveServer runs completed HTTP 101 SignalR handshakes. Static Lab contracts, generated queue check, Node syntax and whitespace check passed; Debug WASM demo build succeeded with 0 errors. Four existing NU1903 advisories on `Microsoft.AspNetCore.WebUtilities` 10.0.7 remain unresolved and were not suppressed.

Treat this only as **current v2 API baseline evidence**. Remaining work includes described-by relationships, transform-flag combinations, native IME behavior and caret/selection preservation, exhaustive keyboard/focus states, responsive/RTL/theme/forced-colors and native AT verification, approved Fluent/ Penpot parity, the v3 Razor/C#/CSS implementation, canonical docs/Skill/migration and exact-head CI.

Exact-head CI on 23d733aca0060192800cf328fa28f24895ddef06 is now fully green: Component Lab 4/4 (Chrome/Edge × WASM/InteractiveServer), compatibility browsers 4/4, Label/Info 4/4 (Chrome/Edge × en-US/fa-IR), Release build/tests/five-package validation, Evidence policy and Documentation Contract. The shared Lab totals are 266/266 per WASM run and 263/263 per Server run; these are full-Lab counts, not TextField-only counts.

Penpot page 19's narrow reflow preview was shifted 85px right and re-exported so it no longer covers the wide second field. Pages 17–20 remain DRAFT; this fixes layout readability only, not design or maintainer sign-off.

#418 is now **Review** in Project #5, but production token vocabulary/values and mappings still await acceptance. Do not consume provisional aliases in product CSS. Pages 17–20 were directly exported and visually rechecked in the current Penpot session; page 19's narrow reflow specimen was moved to remove an overlap with the wide second field. The boards remain DRAFT and still need maintainer visual sign-off. Keep #432 In progress until its own accepted PR is merged into `bluent-v3`; never merge to stable `Dev`/main or publish stable packages as part of this task.


## TextField #432 interactive-addon regression checkpoint — 2026-11-11

Added a seventeenth current-v2 API TextField specimen: a named Clear button inside EndAddon beside a disabled native input. Real Chromium CDP verifies the button remains enabled/focusable, is the next Tab stop after the preceding input, and activates exactly once with Enter without enabling the input.

Final local Dev01 matrix: Chrome/Edge × WebAssembly 269/269 full shared Lab checks each; Chrome/Edge × published InteractiveServer 266/266 each; aggregate 1070/1070. All 19 TextField-targeted checks passed in all four runs; every Server run completed SignalR WebSocket HTTP 101 and all browser cleanup ended at remaining=0. These are full shared Lab totals, not TextField-only counts. Static checker, generated queue check, Node syntax and git diff --check pass; Release Server runs also compiled successfully with only the existing NU1903 warnings.

This is current v2/API regression evidence only. It does not claim v3 implementation, accessibility/OS acceptance, token acceptance, or Penpot sign-off. Pages 17–20 remain DRAFT; #418 remains Review; #432 remains In progress.


## TextField #432 clipboard-paste and composition observation — 2026-11-11

Three actual browser clipboard Ctrl+V checks now cover DigitOnly, AsciiDigits and ArabicToPersianConversion. A synthetic DOM insertCompositionText/isComposing observation records current v2 setter behavior, but is not a physical/native IME test.

Final local Dev01 matrix: Chrome/Edge x WebAssembly 273/273 full shared Lab assertions each; Chrome/Edge x published InteractiveServer 270/270 each; aggregate 1086/1086. All 23 TextField-targeted checks passed in all four modes; Server completed SignalR HTTP 101 and each browser cleanup ended at remaining=0. These are full shared-Lab totals, not TextField-only counts.

Still outstanding: real OS/IME testing, transform flag combinations, caret/selection preservation, exhaustive keyboard/focus, RTL/theme/forced-colors, native AT, #418 token acceptance, Penpot maintainer approval, and the v3 runtime implementation/migration. #432 remains In progress.

## TextField #432 security-gate remediation checkpoint — 2026-11-13

Exact-head CI on `861adc9e9dd0e7c2942d77db8e7c225f3a34a693` passed the Component Lab pilot (Chrome/Edge × WASM/InteractiveServer), compatibility browsers (including Label/Info locales), Evidence Policy, and Documentation Contract. The remaining Baseline Quality Gate failed at the full Release build because `Microsoft.AspNetCore.WebUtilities` 10.0.7 triggered NU1903 for [GHSA-x33c-w48q-qrgc](https://github.com/advisories/GHSA-x33c-w48q-qrgc).

On the isolated `v3/issue-432-textfield` task branch, aligned direct .NET 10 ASP.NET Core / Extensions package references from 10.0.7 or 10.0.14 to patched 10.0.15 in ten library, demo, and sample project files. No audit warnings were suppressed and no v2 release assets were changed. Local `dotnet restore Bluent.sln` succeeded; `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror` succeeded; `dotnet test Bluent.sln --configuration Release --no-build` passed **46/46** tests. Component Lab contract/queue checks, Node syntax check and `git diff --check` also passed. The separate `dotnet list package --vulnerable` invocation stalled during NuGet report retrieval and was cancelled, so do not describe it as a completed standalone vulnerability inventory. Exact-head GitHub CI for the new package-update commit still needs to run.

This does not change the #432 acceptance boundary: the 23 TextField assertions per browser mode and 1086 aggregate shared-Lab assertions remain current-v2 API regression evidence, not v3 implementation acceptance. Native OS IME/caret/selection, token approval in #418, Penpot maintainer sign-off, and the actual v3 TextField runtime/API/CSS, migration and acceptance matrix remain open. Issue #432 stays In progress; PR #562 stays open. Do not merge, publish, deploy, or mark Done as part of this checkpoint.


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

## TextField #432 — internal value pipeline and direct unit coverage — 2026-11-13

A behavior-preserving, non-visual refactor now moves the existing `DigitOnly` → `AsciiDigits` → `ArabicToPersianConversion` sequence into internal `TextFieldValuePipeline.Normalize`. The component setter delegates to the helper and continues to assign the transformed value through `CurrentValueAsString`. The sequence still calls the same existing string extensions in the same order. No public component API, markup, CSS, design token, or released v2 asset is introduced or changed. Test visibility is granted only to `RegexSampleGeneratorTest`.

Added **10/10** direct NUnit cases (all eight flag combinations, plus null and empty input). The TextField source/API guard now checks both the helper delegation and transform order; **13/13** Python guard tests pass, including negative mutations on temporary copies. CI path filters include the new helper dependencies.

Verified locally on the task branch: Release solution build with `-warnaserror` (**0 warnings / 0 errors**); full solution suite (**56/56**); focused helper suite (**10/10**); v3 documentation contract (**0 findings**); repository Markdown links (**171 files**); TextField source/API guard and its **13/13** tests; `git diff --check` clean. This result is local evidence only until exact-head GitHub Actions complete after push.

This change does not satisfy the full TextField #432 scope. The actual v3 Razor/API/CSS, approved #418 tokens, Penpot maintainer sign-off (pages 17–20 remain DRAFT), browser interaction, OS IME/caret/selection, RTL/theme/forced-colors and assistive-technology acceptance remain open. Keep #432 In progress and PR #562 open; do not merge, publish, deploy or mark Done. Stable `Dev` and released v2 remain untouched.

## TextField #432 — current implementation and acceptance checkpoint — 2026-11-14

The active TextField worktree is `C:\Projects\Bluent-issue432`, branch `v3/issue-432-textfield`, at `e9963990065e9cb82ab113f8ce77183bee22a643`; it is clean and matches `origin/v3/issue-432-textfield`. PR #562 targets `bluent-v3`, is open and mergeable, and has no approving review. GitHub Actions on the current docs-only head passed 8/8 workflows; the implementation head `b7e4182af8be5d94e5a06aad66bc122dc71cbc6a` passed the hosted Chrome/Edge × WebAssembly/InteractiveServer TextField matrix (26 + 26 + 25 + 25 = 102/102) and all eight workflows. Local verification on the current branch also passed: TextField guard 48/48, docs contract 0 findings, Markdown links across 172 files, Release solution build with 0 warnings/0 errors, and full .NET tests 70/70.

The implementation, focused demo, canonical reference, migration row M06, task Skill, and Unreleased v3 changelog entry are present. The direct API remains the six source-backed parameters; the inherited InputBase/field-shell contract is preserved. Placeholder source mapping is recorded in #418 and tested against Fluent Web Components 3.1.3; it does not approve the full #418 token foundation.

Penpot is connected to the correct owned file `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`). Page 16's native variant container currently has 28 State × Appearance combinations and reports zero variant metadata errors. The four #432 review boards on pages 17–20 are still explicitly DRAFT; their presence/export is not approval. #418 remains In progress and #432 is Done. #433 NumericField was accepted and merged into bluent-v3 via PR #563 on 2026-11-16; its final evidence and limitations are recorded in docs/v3/components/numeric-field.md. #434 Checkbox remains Backlog: do not start its implementation until #418 tokens and #421 Component Lab/coverage contracts are accepted.

For TextField #432, PR #562 is merged and the issue is Done. Penpot pages 17–20 remain marked DRAFT, #418 still owns the token foundation, and physical Persian OS IME composition/caret/selection plus spoken screen-reader output remain unverified follow-up areas; they are not evidence that #432 is still open. The hosted browser matrix does not certify native OS/AT behavior. Do not merge v3 work to stable Dev/main, publish packages, or deploy.

## TextField #432 — delegated design acceptance and token-source alignment — 2026-11-14

The user explicitly delegated the remaining TextField-specific design and token decisions while away from the workstation. I reviewed the actual editable Penpot file Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000) and exported/visually inspected the four primary boards plus both page-19 placeholder studies. Decision comments were created and verified (one open comment thread each) on pages 17–20. The boards retain their visible DRAFT labels so they are not mistaken for native test evidence; the comments record task-specific acceptance for #432.

Accepted for #432: page 17's 28 Appearance × State matrix; page 18 anatomy, native input/textarea, addons, size and RTL; page 19 keyboard/native-state distinctions and reflow as design requirements; page 20 Fluent Web Components vs React boundary and orthogonal composite-state precedence. This does not certify the schematic forced-colors example or actual OS/assistive-technology behavior.

Placeholder consumer decision: pinned @fluentui/web-components@3.1.3 uses colorNeutralForeground4 for ordinary placeholder and colorNeutralForegroundDisabled for disabled placeholder. FG4/BG3 arithmetic is 4.5423:1 Light and 6.4663:1 Dark. The task branch's ordinary placeholder CSS now reads --colorNeutralForeground4 directly until #418 integration; it no longer consumes the proposed unmerged --bui-v3-text-placeholder semantic alias. The disabled state reuses the existing shared --bui-v3-text-disabled role with exact upstream fallback. Canonical decision and contrast records are docs/v3/tokens/TEXTFIELD-PLACEHOLDER-DECISION.md and docs/v3/tokens/CONTRAST-AUDIT.md.

GitHub decision records: Issue #432 comment 6875863220; PR #562 comment 6875862842. This is delegated task-specific acceptance only. #418 remains In progress and owns the global token foundation. Native Windows Contrast Themes, actual filled-field host-boundary contrast, physical Persian OS IME with caret/selection, and spoken screen-reader acceptance remain unverified. #432 is now Done in Project #5; its v3 implementation is integrated on bluent-v3. No stable/v2 change, NuGet publication, release, merge or deployment was performed.

## TextField #432 — native evidence completion and final review handoff — 2026-11-14

Latest task worktree: C:\Projects\Bluent-issue432, branch v3/issue-432-textfield. The existing exact-head green commit is 14b8357522dc81f991a2e028ebc8f4254179ec11; native evidence/docs below require a fresh exact-head CI run after commit/push.

### Native evidence added
- BLUENT-TEXTFIELD-WINDOWS-HIGH-CONTRAST.json/.png: native Windows High Contrast White; Edge observed forced-colors active; actual component CSS loaded (883 rules). Field border = CanvasText; disabled border/input = GrayText; focus underline = Highlight at 2px. 21/21 textboxes were named in Chromium accessibility tree; native disabled/readonly states exposed.
- BLUENT-TEXTFIELD-WINDOWS-PERSIAN-KEYBOARD.json/.png: Windows input method 0429:00000429 active; actual OS key events A/S/D produced شسی without Unicode injection. A real A key replaced selection [1,2] in Persian normalization; beforeinput/input data ش, result کشس, caret collapsed at index 2. Direct Persian keyboard layout only; no composition events occurred, so composition-based IME lifecycle is not claimed.
- Windows state restored: High Contrast flags 126/off, Custom.theme current, keyboard layout English 0x04090409.
- Chromium accessibility tree exposed 21/21 named textboxes. Narrator speech was not captured/listened to; spoken screen-reader acceptance is not claimed.

### Runtime and build evidence
- Exact-head CI on 14b8357522dc81f991a2e028ebc8f4254179ec11: 8/8 workflows, 28/28 jobs green; hosted TextField matrix 100/100 (Chrome/WASM 25, Edge/WASM 25, Chrome/Server 24, Edge/Server 26).
- Follow-up local Edge/InteractiveServer on the real SSR host: 26/26; final component CSS loaded, zero browser JS/console/HTTP failures, SignalR HTTP 101, 320px no-overflow reflow.
- Previously verified locally: Release solution build -warnaserror zero warnings/errors; .NET tests 70/70; TextField contract tests 48/48; docs contract 0 findings; Markdown links 174 files; Sass/JS builds.
- The new evidence/documentation commit needs exact-head CI; previous checks do not automatically apply to it.

### Acceptance boundary
- Task-specific Penpot decision is recorded in comments on pages 17–20 under user-delegated review. Visible DRAFT labels remain, distinguishing this task decision from full design-system approval. #418 remains Review and owns global token approval.
- Native High Contrast and direct Windows Persian keyboard input/caret replacement are supported by evidence. Composition-based IME candidate lifecycle and spoken Narrator output remain unverified.
- Keep #432 In Progress until exact-head CI is green, then move Project #5 Status to Review. PR #562 stays open/unmerged until normal review/branch protection permits merge. Do not fabricate an approving review or bypass protections. No stable Dev/main/v2 merge, NuGet publication, release or deployment.
## TextField #432 — accepted and merged into bluent-v3 — 2026-11-14

PR #562 was squash-merged into bluent-v3 after delegated technical review of exact head 5d0aef5d7b15c7511b55570cf3090dab75dafcc7. The branch's final CI was 8/8 workflows and 28/28 checks successful; all four TextField browser cells passed. Local Release build with -warnaserror had zero warnings/errors; .NET tests 70/70; TextField guard 48/48; docs contract zero findings; Markdown links 174 files.

Windows High Contrast White and direct Persian Windows keyboard-layout input/caret mapping were verified. High Contrast settings, original Custom.theme and English keyboard were restored. A composition-based OS IME lifecycle and spoken Narrator output are not claimed. Penpot pages 17–20 remain DRAFT, with task-specific design decisions accepted under delegated review; #418 global tokens remain separate. The TextField API has no Appearance parameter; Filled visual boards are not a shipped public appearance API. Stable 2.x/Dev packages and deployments remain unchanged.

## Handoff — Issue #435 Switch (2026-11-18)

- Branch: `v3/issue-435-switch`; target: `bluent-v3` only; task PR: [#565](https://github.com/vrassouli/Bluent/pull/565). Do not merge to stable `Dev` / `main`, publish NuGet, release or deploy.
- Product implementation and local review evidence: dedicated `BluentInputComponentBase<bool>` Switch, native `role=switch`, stable accessible name, Medium 40×20 / 14×14 geometry, logical RTL, native disabled/required distinction, focus-visible, forced-colors and reduced-motion. No Checkbox-only API inheritance and no public Size parameter.
- Latest local gate: focused HtmlRenderer 11/11; Switch source/API negative-mutation suite 16/16; Release `Bluent.sln` build 0 warnings/errors; .NET tests 124/124; Chrome/Edge × WebAssembly/InteractiveServer 25/25 per cell = **100/100**, zero browser runtime signals. Added checks cover actual Header Light/Dark interaction in WASM, host-level theme attribute/color changes in the minimal Server compatibility page, and `Class`/`Style`/`aria-describedby` forwarding.
- Penpot: canonical Bluent v3 Design System, page 58; 40-case matrix `06b2261f-bfb4-808c-8008-f689e11abe56`, anatomy/accessibility board `06b2261f-bfb4-808c-8008-f68a6da3e29d`, Medium-first board `b5e126d7-572c-8063-8008-f691ea3d12ec`. They remain design proposals for independent parity review.
- Narrow component-local authorization from [Issue #435 comment](https://github.com/vrassouli/Bluent/issues/435#issuecomment-6970538466) permits existing shipped semantic CSS roles only. #418 global tokens remain separately owned and not approved/completed by this task.
- Exact-head hosted CI on `1b2f12fc` passed **8/8 workflows / 36/36 jobs**; the compatibility browser matrix is **20/20**, including all four Switch jobs. The isolated retry for Native Zoom / Chrome-WASM and NumericField / Edge-Server both passed. Project #5 Status remains **Review** pending independent visual-parity and native OS/AT acceptance. PR #565 awaits independent maintainer visual-parity/design and native OS/AT review. Never self-approve the PR. Do not mark Done until review/acceptance and merge into `bluent-v3`.
- Explicit limits: browser-emulated forced-colors is not native Windows Contrast Themes; Chromium AX snapshots are not spoken Narrator/NVDA/VoiceOver testing. No native OS/AT or WCAG certification claim. The global 66-family Component Lab remains unchanged (18 representative pilots; 0 accepted).


## Issue #418 — current checkpoint (2026-11-20)

Current branch `v3/issue-418-design-tokens`, PR #500 head `9c5ec655f60e5d31a8553635527aed21b36750fa`; exact-head CI 13/13 successful. Real Browser 4/4, Compatibility 30/30, Component Lab 4/4, Popover 4/4, Firefox 34/34 and Playwright WebKit 34/34. Dev01 Release build 0 warnings/errors, .NET 188/188, focused #418 contract 19/19 and focused regression aggregate 65/65. Current detailed checkpoint: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-20.md`.

The current semantic role inventory and Option B decision table are in `docs/v3/tokens/PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md`. It is a review proposal only; no public alias, production CSS, schema or runtime API was changed. The suggested first-wave candidates are text.primary, text.disabled and text.placeholder, bounded by current Label/TextField evidence. Page45 remains REVIEW REQUIRED and page55 remains DRAFT; Penpot browser access is currently suspended, so no board edits/status changes were made.

Native Dev01 discovery (read-only): High Contrast White is selected but SPI_GETHIGHCONTRAST reports HCF_HIGHCONTRASTON false (dwFlags=126). NVDA 2026.3 is running in interactive session 1 with OneCore/David, but no Speech Viewer/log or spoken output has been captured. Narrator is not running; JAWS was not checked. Safari remote automation remains untouched; Playwright WebKit is not Safari. Persian OS IME composition/caret/selection remains untested. Do not claim native OS/AT acceptance. Do not toggle user accessibility settings or close/restart NVDA without explicit consent.

Keep Issue #418 In progress and PR #500 open/unmerged. Native Contrast Themes, spoken AT, Safari.app, Persian IME, final page45/page55 review, and the global semantic allow-list/public Focus/Portal/Dialog API approval remain open. No stable branch, release, NuGet publication or deployment.

### 2026-11-21 — DateField consumer dependency audit

A downstream-source audit for DateField was added to #418 without starting #438. It isolates the shared foundation work (field text/disabled/optional placeholder, readable validation text, field/action focus distinction, calendar/Popover surface and overlay-theme ownership, reduced motion, forced colors and RTL) from DateField-owned work (DateClass forwarding, text-entry Min/Max, YearSelect parsing, trigger accessible name and calendar keyboard behavior). The provisional validation-text semantic is not in the 17-role schema or CSS. See docs/v3/tokens/DATEFIELD-FOUNDATION-DEPENDENCY-AUDIT.md and the review-only consumer note in PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md. #438 remains Backlog; no DateField source/API/demo was changed.

### 2026-11-21 follow-up — validation text source evidence

Correction to the DateField dependency checkpoint: the existing shared _field.scss rule already styles .validation-message with --colorPaletteRedForeground1. New fail-closed audit scripts/quality/audit_v3_validation_text_contrast.py checks the selector plus 20 brand/mode themes × 3 neutral surfaces: 60/60 at or above 4.5:1, measured minimum 5.2036:1. A separately named semantic.text.validation remains only a candidate for maintainer naming/consumer review; it is not in the 17-role schema and no production CSS changed. Brand/inverted/custom hosts and native forced-colors/AT remain unverified.
