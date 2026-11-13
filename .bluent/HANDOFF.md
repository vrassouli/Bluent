# Bluent Handoff

This file is the operational entry point for continuing the current Bluent work with Codex or another coding agent.

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
