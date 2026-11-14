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

Penpot is connected to the correct owned file `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`). Page 16's native variant container currently has 28 State × Appearance combinations and reports zero variant metadata errors. The four #432 review boards on pages 17–20 are still explicitly DRAFT; their presence/export is not approval. #418 remains Review, #432 remains In progress, and #433 NumericField remains Backlog. Do not start #433 until its actual Project #5 status is Ready and its token/design prerequisites are accepted.

Remaining acceptance is not code/CI work: maintainer visual/design review of Penpot pages 17–20; final #418 token foundation acceptance; native Windows Contrast Themes verification; physical Persian OS IME composition/caret/selection verification; and actual spoken screen-reader acceptance. The hosted browser matrix is not evidence for those native OS/AT gates. Keep PR #562 open and #432 In Progress until those gates and maintainer review are complete; do not merge to stable Dev/main, publish packages, or deploy.

## TextField #432 — delegated design acceptance and token-source alignment — 2026-11-14

The user explicitly delegated the remaining TextField-specific design and token decisions while away from the workstation. I reviewed the actual editable Penpot file Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000) and exported/visually inspected the four primary boards plus both page-19 placeholder studies. Decision comments were created and verified (one open comment thread each) on pages 17–20. The boards retain their visible DRAFT labels so they are not mistaken for native test evidence; the comments record task-specific acceptance for #432.

Accepted for #432: page 17's 28 Appearance × State matrix; page 18 anatomy, native input/textarea, addons, size and RTL; page 19 keyboard/native-state distinctions and reflow as design requirements; page 20 Fluent Web Components vs React boundary and orthogonal composite-state precedence. This does not certify the schematic forced-colors example or actual OS/assistive-technology behavior.

Placeholder consumer decision: pinned @fluentui/web-components@3.1.3 uses colorNeutralForeground4 for ordinary placeholder and colorNeutralForegroundDisabled for disabled placeholder. FG4/BG3 arithmetic is 4.5423:1 Light and 6.4663:1 Dark. The task branch's ordinary placeholder CSS now reads --colorNeutralForeground4 directly until #418 integration; it no longer consumes the proposed unmerged --bui-v3-text-placeholder semantic alias. The disabled state reuses the existing shared --bui-v3-text-disabled role with exact upstream fallback. Canonical decision and contrast records are docs/v3/tokens/TEXTFIELD-PLACEHOLDER-DECISION.md and docs/v3/tokens/CONTRAST-AUDIT.md.

GitHub decision records: Issue #432 comment 6875863220; PR #562 comment 6875862842. This is delegated task-specific acceptance only. #418 remains Review and owns the global token foundation. Native Windows Contrast Themes, actual filled-field host-boundary contrast, physical Persian OS IME with caret/selection, and spoken screen-reader acceptance remain unverified. #432 remains In Progress; PR #562 remains open/unmerged against bluent-v3. No stable/v2 change, NuGet publication, release, merge or deployment was performed.
