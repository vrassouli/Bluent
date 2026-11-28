# Bluent Handoff

This file is the operational entry point for continuing the current Bluent work with Codex or another coding agent.
## 2026-11-28 DateField #438 — prepared for review

- Actual Project #5 Status: **In progress** (last verified); PR [#569](https://github.com/vrassouli/Bluent/pull/569) is currently Draft and targets `bluent-v3`. Task branch: `v3/issue-438-datefield`; latest pushed head: `cc6d062660660f2284ea204d4166fb24ce1c6b6e`; hosted CI on that exact head: **13/13 workflows succeeded**. The additional documentation/acceptance record in the current working tree is not yet committed or included in that CI result.
- Release solution build (warnings as errors): 0 warnings/errors; full .NET Release tests 219/219; focused calendar semantics 8/8.
- Dedicated DateField Chrome/WebAssembly 41/41 and production-published InteractiveServer 41/41 (82/82); Component Lab source contract 18/18; live Chrome/WebAssembly Component Lab 290/290; browser cleanup 11 owned/0 remaining; acceptance regression 12/12; Docs 0 findings; Skills 6 files/0 errors; Markdown links 257 files.
- Eight live DateField Lab cards cover all three modes, four supported value/nullability shapes, size tiers, both addon slots, input timing, bounds, DateClass, parsing feedback, disabled and native attributes. The full public API and capability-to-evidence map is `docs/v3/quality/evidence/BLUENT-DATEFIELD-PUBLIC-API-COVERAGE-2026-11-28.md`.
- Penpot page 61 (three boards), source/API, parser/range, focus/Popover, migration and runtime parity received agent self-review. No concrete implementation blocker was found. This is a technical self-review, not independent human approval.
- Product-context screenshot metadata and SHA-256 are in `docs/v3/quality/evidence/BLUENT-DATEFIELD-PRODUCT-CONTEXT-2026-11-28.md`. Narrator/Chrome spoke field label/value, the non-modal popup/grid, Escape close and focus-restored trigger, and ArrowRight from 18 to 19 October. Windows UIA confirmed Right/Down/Left/Up focus 18→19→26→25→18. NVDA and VoiceOver were not run; do not claim cross-screen-reader certification.
- Native Windows High Contrast Black/White visual checks passed previously with settings restored. Browser emulation is recorded separately. `/components/fields` still has an unrelated NumericField<float> rendering defect; DateField's own fixtures and `/component-lab` were used.
- Keep the issue **Review**, not Done; PR remains unmerged. No Dev/main/2.x code, package, release or deployment was changed. Do not mark Done until the PR is accepted and merged into `bluent-v3`.
- Next component by sequence: #439 TimeField (12/66), after #438 is accepted/merged.

## Active v3 foundation gate — #418 Design Tokens (refreshed 2026-11-24)

- Dedicated branch: `v3/issue-418-design-tokens`; PR [#500](https://github.com/vrassouli/Bluent/pull/500) targets `bluent-v3`, remains OPEN/unmerged, merge state CLEAN, and has no formal approval decision. Previous verified pushed baseline before the Native UIA evidence update: `811c376633fbb339d828d37e57572eb829d4753d`; its exact-head GitHub Actions completed **13/13 successfully**. The newly committed evidence update requires fresh exact-head CI after push. Exact-head GitHub Actions: **13/13 workflows completed successfully**, with zero failures or active jobs. `gh pr checks 500` is green. Working tree was clean at this checkpoint before the documentation refresh.
- The owned-browser cleanup fix is bounded to 8 seconds, scoped to the probe's unique temporary profile path, and performs a fresh post-loop process inventory. The Label Info probe waits for the visible surface, `aria-expanded=true`, and actual focus on the Info surface before evaluating its existing focus/no-trap assertions. Regression guards prevent removing those readiness/cleanup requirements.
- Latest Label Info evidence: Chrome/Edge × en-US/fa-IR **72/72 assertions** locally; all four hosted Label Info jobs pass on exact head. The Edge/WASM alpha-host probe also passed **1,179/1,179** locally; latest exact-head CI is green. Alpha-host Chrome passed 80/80 with zero owned-profile leftovers; cleanup regression **24/24**.
- Other focused local checks: Label contract 11/11; Popover JS bundle 26/26; Native HC evidence guard 7/7; #418 review contract 21/21; validation-text contrast tests 10/10; token-preview contrast 15/15 locally and on exact-head hosted Token Contract CI; generator `--check`; docs contract 0 findings; Markdown link scan 244 files; `git diff --check`.
- Contrast boundaries: **60/60** formal neutral-base text pairs across 10 brands × Light/Dark × Neutral Background 1/2/3 pass 4.5:1 (minimum 5.2036:1). The separate 2,180-pair opaque-host diagnostic is mixed (834 pass; 26 surfaces pass in every theme, 51 fail in every theme, 32 mixed); it is not a universal-compliance result. Sixteen non-opaque/alpha surfaces are excluded from simple arithmetic. `semantic.text.validation` remains review-only and outside the 17-role schema/public allow-list.
- The 40 Dark foreground values meet the 4.6:1 preview target on opaque Dark NeutralBackground1 (minimum 4.6001:1), but exact values and aliases are not approved. The 46-role taxonomy is 16 source / 17 semantic / 13 component roles.
- Acceptance review aid: [#418 acceptance-review board (DRAFT)](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=132-2), page 14:2, frame 132:2 (1540 × 1769; 7 sections; 76 editable text nodes).
- Semantic scope register: [17-role evidence and scope register (DRAFT)](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=134-12), same page 14:2, frame 134:12 (1540 × 2463; 17 role instances, one shared row component, 127 editable text nodes). Inventory: 3 first-wave candidates, 2 restricted roles, 12 deferred roles. Each row records consumer evidence, bounded scope and open gate. It is review context only—not public allow-list approval. Both Figma frames were created as an independent fallback when Penpot was frozen; neither replaces canonical Penpot sign-off. The Penpot connection has since been re-established, but no page 45/55 approval or board status change has been made.
- Canonical editable design remains **Bluent v3 Design System**, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. Page 45 remains DRAFT with its principal contrast board REVIEW REQUIRED; page 55 remains DRAFT. Pages 52–54 describe selected prototypes only.
- Selected engineering directions remain prototype-only: token vocabulary Option B; same-painted-host Focus metadata Option A; Dialog/Popover ownership Option A. Do not consume draft `--bui-v3-*` aliases in product CSS or treat prototype Focus/Portal/Dialog API inventories as approved public contracts.
- **Still open:** final public semantic-token allow-list and production alias names; public Focus/Portal/Dialog type/member contract; broader native Windows Contrast Themes coverage (including High Contrast Black and user-defined schemes); UI Automation and spoken Narrator/NVDA/VoiceOver acceptance; physical-keyboard coverage; native Safari.app/SafariDriver; Persian OS IME composition/caret/selection and cross-platform font metrics.
- Native Windows HC prototype evidence (2026-11-23): Windows 11 Pro build 28000 / Edge 158.0.4370.33 / High Contrast White only. The original OS flags/scheme were restored. Dialog semantics and a limited Tab/Shift+Tab/Escape/focus-return path were recorded; Popover trigger relations were recorded, but its surface had no explicit role and a transparent own background. Input was CDP-dispatched, not physical hardware; no UI Automation or spoken AT output was captured. See `docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.md` and its JSON/PNG companion.
- Native Windows HC / UIA evidence (2026-11-24): the published InteractiveServer Dialog/Popover fixture was run on Windows 11 Pro build 28000 / Edge 158.0.4370.33 with native High Contrast White. Windows reported forced-colors: active and prefers-contrast: more. UIA exposed the named Dialog window, heading, invokable Close modal button, Popover content Group/Text and named trigger. Synthetic OS Tab focused Close modal; Shift+Tab focused Last focusable; Escape closed the Dialog and returned focus to its trigger. Popover surface had computed opaque background rgb(255, 250, 239) in this run, but no explicit role; aria-haspopup was absent. Native flags were restored exactly (126), and owned Edge processes remaining=0. Evidence JSON/MD and two SHA-256-pinned PNGs are under docs/v3/quality/evidence/BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-24*; fail-closed regression 12/12.
- At this 2026-11-24 checkpoint, Project #5 showed #418 **In progress** and #438 DateField **Backlog**. DateField began later under its own branch; see the #438 handoff above. Do not merge PR #500, activate production CSS, change stable Dev/main, publish NuGet packages, release or deploy as part of #418.
- Dated detail: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-24.md`; prior detail: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-23.md`; DateField downstream dependency audit: `docs/v3/tokens/DATEFIELD-FOUNDATION-DEPENDENCY-AUDIT.md`.
### 2026-11-20 — #418 Dark-matrix flake correction (local, pre-push)

The current working tree fixes two observed probe defects: (1) it no longer changes data-bui-theme directly in the DOM, and (2) after hosted Chrome/Server timed out on the component id click, it now finds and clicks the actual native button by its Switch-to-Light/Dark label, reads the rendered data-bui-theme as source of truth, and waits for the Blazor DOM update. It verifies the computed Dark surface/brand/direction, checks Word's opposite AlternateScope mode, and restores Light through the native button. Local Dev01 results: Chrome/Server **1178/1178**, Chrome/WASM **1179/1179**, Edge/Server **1178/1178**, Edge/WASM **1179/1179**; focused Python regressions **61/61**; Release solution build **0 warnings / 0 errors**; solution tests **188/188**; v3 docs contract **0 findings**; Skills contract **0 errors**; Markdown links **238 files**. Exact command/evidence and limits are in docs/v3/quality/evidence/BLUENT-418-DARK-MATRIX-LOCAL-20261120.md.

**Not yet verified:** pushed HEAD and its exact-head GitHub Actions, final Penpot/page-45 and page-55 approval, public token/API allow-list, native Windows Contrast Themes, spoken AT, native Safari and Persian OS IME/caret. The native-button follow-up is locally verified in Chrome/Edge × InteractiveServer/WASM; push it and check exact-head Actions before proceeding. Keep #418 In progress and do not merge PR #500 until the remaining acceptance gates are resolved. #438 remains Backlog; no DateField implementation has started.

### 2026-11-21 — #418 source namespace taxonomy review follow-up

The `bluent.color.*` vs `bluent.source.*` distinction now has an explicit classification rule in `docs/v3/tokens/FOUNDATION-REVIEW-DECISIONS.md` and a fixed 9/7 name-to-CSS allow-list in `scripts/quality/test_v3_issue418_review_contract.py`. Local validation: #418 review contract 21/21, token contrast 13/13, token generator `--check`, 360-pair source contrast audit, docs contract 0 findings, Markdown links 239 files. This is documentation/contract hardening only: no schema, preview CSS, product CSS, public token or API promotion. Current dated checkpoint: `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-21.md`. Keep #418 In progress and PR #500 open/unmerged until fresh exact-head CI and the remaining design/native/public-contract gates are accepted.


### 2026-11-23 — #418 validation-text host boundary follow-up

The existing `.validation-message` → `--colorPaletteRedForeground1` mapping remains unchanged. The neutral-base audit passes 60/60 brand/mode/surface pairs (minimum 5.2036:1); an exhaustive 2,180-pair host diagnostic finds 834 passing pairs; 26 surfaces pass in every theme, 51 fail in every theme and 32 are mixed. Brand Background is 0/20 (minimum 1.0027:1), Neutral Background Inverted is 0/20 (minimum 2.4877:1), and Palette Red Background 2 is 0/20 (minimum 3.5017:1); 16 non-opaque/alpha backgrounds are excluded pending compositing evidence. Diagnostic failures are deliberately not counted as neutral-base failures; they establish that the current color is not universal on arbitrary hosts. `semantic.text.validation` remains review-only, outside the 17-role schema/public allow-list. Local tests: validation audit 10/10; #418 review contract 21/21. See `docs/v3/tokens/ISSUE418-ACCEPTANCE-CHECKPOINT-2026-11-23.md`. Fresh exact-head CI is required after push. At this 2026-11-23 checkpoint, #438 DateField remained Backlog and untouched; it began later under the separate task branch described above.



## Completed objective — Issue #406

Issue [#406](https://github.com/vrassouli/Bluent/issues/406) was completed and closed on 2026-08-30 through merged [PR #407](https://github.com/vrassouli/Bluent/pull/407). The following scope and validation notes are retained as historical context; they are separate from the current v3 DateField work.

The skill must stay retrieval-oriented and Bluent-first. Canonical component/task documentation remains authoritative; `.agents/skills/bluent/` routes consumers to the minimum relevant references instead of duplicating a monolithic API catalog.

## Historical branch and tracking

- Base branch: `Dev`
- Active branch: `docs/issue-406-consumer-skill`
- Active issue: [#406](https://github.com/vrassouli/Bluent/issues/406)
- Draft pull request: [#407](https://github.com/vrassouli/Bluent/pull/407)
- Product/API gap backlog discovered during #406: [#411](https://github.com/vrassouli/Bluent/issues/411)
- PR #407 is merged and #406 is closed; this completed consumer-skill effort is separate from the current v3 DateField task.

## Original read-first list

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

## Historical validation state

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
3. Spot-check the remaining public service/helper/configuration classification