# Retrospective Fluent 2 parity review: first 18 Component Lab pilots

> **Retrospective audit in progress; not a Fluent parity acceptance result.** Tracking issue [#552](https://github.com/vrassouli/Bluent/issues/552); Epic [#416](https://github.com/vrassouli/Bluent/issues/416), Lab [#421](https://github.com/vrassouli/Bluent/issues/421), quality [#425](https://github.com/vrassouli/Bluent/issues/425). **All 18 families now have partial source/API audit reports; 0/18 Fluent-approved. TextField has no confirmed source gap, so all its acceptance dimensions remain not_reviewed.** Green Chrome/Edge pilot tests prove only particular Bluent source behavior. None of these product issues are Done or newly design-approved.

## Maintainer decision — debt first (2026-10-19)

**Pause all new Component Lab family pilots beyond the first 18.** This P0 quality-backfill audit is the next development priority; Product #428–#445 and actual Penpot/Figma reviews remain the owning sources for implementation. Workstream #552 is tracked as **In progress** in GitHub Project #5 on its isolated `v3/issue-552-fluent-parity-audit` branch; PR #553 targets `bluent-v3` and remains Draft. This status records active audit work only: no family or acceptance dimension is approved, and no product implementation was authorized.

**Resume new component families only after** all 18 retrospective Fluent comparison reports are written and reviewed **AND every actionable parity gap is corrected and regression-tested, or explicitly reviewed/approved as a deliberate Bluent exception**. Merely filing an issue or documenting a failing behavior does **not** settle that debt. This gate requires **audited and dispositioned debt**, not pretending 18 product components are Done. Actual product fixes remain on their existing issue lifecycle; if a crucial gap is blocking Fluent parity, it must be resolved before calling that family accepted.

Read the P0 known issues first: Button #428, Slider #442, RangeSlider #443, FileSelect #444. No changes to the stable v2 branch, no forced #421 PR merge, and no fictional design approval.

## Reference contract and guardrails

- Visual, anatomy and UX: [Fluent 2 Design](https://fluent2.microsoft.design/), [design tokens](https://fluent2.microsoft.design/design-tokens), [accessibility](https://fluent2.microsoft.design/accessibility) and [spacing](https://fluent2.microsoft.design/layout).
- Behavioral/API comparison: matching [Fluent Web Components Storybook](https://storybooks.fluentui.dev/web-components/) when it exists; use [Fluent React v9](https://storybooks.fluentui.dev/react/) only as an explicitly labeled **fallback**, not an asserted one-to-one API.
- Source contract: current Bluent v2 public Razor/C# API and source-backed Lab. Do not assume every Bluent-only family has a Fluent Web Component counterpart; record evidence before classifying **Intentional Bluent Extension**.
- Approved component design must live in editable **Bluent v3 Penpot** (Figma fallback): real file/page/node/revision/reviewer. The reference Fluent kit is read-only and not Bluent signoff.
- User-approved visual choices remain: Button brand-colored focus indicator when applicable; TextField animated active underline with **no redundant full-box focus ring**; separated Cards/inner Cards especially in published SSR and 320px RTL.
- Keep stable v2 **Dev** untouched; do not merge a draft PR or complete a component issue merely because an audit exists.

## Phases (ordering, not fictional deadlines)

1. **Evidence foundations:** lock the exact upstream design/implementation references (links, dates, versions) for each component, verify the public Bluent API and intentional extensions, set screenshot targets, identify authoring Penpot/Figma node.
2. **Immediate P0 fact-finding:** triage Button (#428) text/icon/focus; Slider (#442) coordinate and InteractiveServer pointer; RangeSlider (#443) double-thumb/order/Server; FileSelect (#444) obsolete Multiple demo, accessible remove button, Accept as browser hint, nested Card spacing. Log reproducible gaps; implementation stays on its product issue after normal gates.
3. **Wave A — primitives (5):** Button, Icon, Label, Link, Badge. Shared tokens, typography, spacing, focus/state geometry and icon Regular/Filled/Color availability.
4. **Wave B — basic forms (6):** TextField, NumericField, Checkbox, Switch, RadioGroup, SelectField. Value/validation/semantics/keyboard/RTL/theme.
5. **Wave C — specialized fields (4):** DateField, TimeField, MaskedField, OtpField. Calendar/culture/IME/paste/JS lifecycle and specific Bluent additions; do not invent Web Components equivalents.
6. **Wave D — pointer/files (3):** Slider, RangeSlider, FileSelect. Fully close known gaps only via their own design-approved product implementation flow; P0 research starts earlier.
7. **Independent acceptance:** source and reference mapping + annotated real screenshot diff + per-state/per-event matrix + Penpot/Figma decision + CDP cross-mode/browser tests + native OS/AT checks, docs/skills/migration. A completed audit is not equivalent to finished implementation.

## Backfill ledger: status reflects evidenced progress; approval remains pending

The following ledger records partial audit progress, not parity acceptance. All 18 families have a linked source/API audit report. Only evidence-backed gaps are marked `audited_gaps`; TextField remains fully `not_reviewed` because source inspection alone did not establish a specific gap. All design approvals and full evidence bundles remain pending. Source of truth: [machine-checkable matrix](FLUENT-PARITY-RETRO-AUDIT.json).

| # | Existing source family / product issue | Priority | Wave | Visual | Feature | Behavior | A11y / design |
| --: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [Button](https://github.com/vrassouli/Bluent/issues/428) (#428) | P0 | A | Not reviewed | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 2 | [Icon](https://github.com/vrassouli/Bluent/issues/429) (#429) | P2 | A | **Audited gaps** | Not reviewed | Not reviewed | **A11y: audited gaps; design: not reviewed** |
| 3 | [Label](https://github.com/vrassouli/Bluent/issues/430) (#430) | P2 | A | Not reviewed | Not reviewed | Not reviewed | **A11y: audited gaps; design: not reviewed** |
| 4 | [Link](https://github.com/vrassouli/Bluent/issues/431) (#431) | P2 | A | Not reviewed | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 5 | [Badge](https://github.com/vrassouli/Bluent/issues/445) (#445) | P2 | A | Not reviewed | **Audited gaps** | Not reviewed | **A11y: audited gaps; design: not reviewed** |
| 6 | [TextField](https://github.com/vrassouli/Bluent/issues/432) (#432) | P1 | B | Not reviewed | Not reviewed | Not reviewed | Not reviewed |
| 7 | [Checkbox](https://github.com/vrassouli/Bluent/issues/434) (#434) | P1 | B | Not reviewed | Not reviewed | Not reviewed | **A11y: audited gaps; browser AX confirms mixed-state gap; design: not reviewed** |
| 8 | [Switch](https://github.com/vrassouli/Bluent/issues/435) (#435) | P1 | B | Not reviewed | Not reviewed | Not reviewed | **A11y: audited gaps; browser AX role=checkbox; design: not reviewed** |
| 9 | [NumericField](https://github.com/vrassouli/Bluent/issues/433) (#433) | P1 | B | Not reviewed | **Audited gaps** | **Audited gaps** | Not reviewed |
| 10 | [RadioGroup](https://github.com/vrassouli/Bluent/issues/436) (#436) | P1 | B | Not reviewed | Not reviewed | **Audited gaps; ArrowRight crosses groups in Chrome/Edge** | **A11y: group ignored in browser AX; design: not reviewed** |
| 11 | [SelectField](https://github.com/vrassouli/Bluent/issues/437) (#437) | P1 | B | Not reviewed | **Audited gaps** | **Audited gaps** | Not reviewed |
| 12 | [DateField](https://github.com/vrassouli/Bluent/issues/438) (#438) | P1 | C | Not reviewed | **Audited gaps** | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 13 | [TimeField](https://github.com/vrassouli/Bluent/issues/439) (#439) | P1 | C | Not reviewed | **Audited gaps** | **Audited gaps** | Not reviewed |
| 14 | [MaskedField](https://github.com/vrassouli/Bluent/issues/440) (#440) | P1 | C | Not reviewed | **Audited gaps** | **Audited gaps** | Not reviewed |
| 15 | [OtpField](https://github.com/vrassouli/Bluent/issues/441) (#441) | P1 | C | Not reviewed | Not reviewed | Not reviewed | **A11y: audited gaps; design: not reviewed** |
| 16 | [Slider](https://github.com/vrassouli/Bluent/issues/442) (#442) | P0 | D | **Audited gaps** | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 17 | [RangeSlider](https://github.com/vrassouli/Bluent/issues/443) (#443) | P0 | D | **Audited gaps** | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 18 | [FileSelect](https://github.com/vrassouli/Bluent/issues/444) (#444) | P0 | D | Not reviewed | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |

## Supplemental source/API research (research leads, not acceptance evidence)

The following pinned references now provide traceable starting points for the family audits. They are **not** a substitute for the nine-dimension acceptance matrix below, and none changes a family's `auditStatus`, `dimensions`, `designApproval`, or `evidenceBundle`. Exact-name matches are not semantic parity.

- [Fluent Web Components 3.1.3 family crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Fluent Web Components API-name candidates](FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md)
- [Pinned Fluent React 9.74.10 API-name candidates](FLUENT-REACT-9.74.10-18-API-CANDIDATES.md)
- [Family-by-family React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Bluent source API census](FLUENT-PARITY-18-SOURCE-API.json)

### Partial family audit reports

| Family | Current disposition | Report |
| --- | --- | --- |
| Button #428 | Researching; behavior and browser accessibility have confirmed open gaps; no approval | [Button family audit](FLUENT-PARITY-BUTTON-AUDIT.md) |
| Icon #429 | Researching; custom SVG sizing and unnamed image gaps reproduced in Chrome/Edge; no approval | [Icon family audit](FLUENT-PARITY-ICON-AUDIT.md) |
| Label #430 | Researching; Info trigger lacks an explicit accessible name; target ID association needs runtime verification; no approval | [Label family audit](FLUENT-PARITY-LABEL-AUDIT.md) |
| Link #431 | Researching; disabled-anchor and callback guard gaps identified in source; runtime verification pending; no approval | [Link family audit](FLUENT-PARITY-LINK-AUDIT.md) |
| TextField #432 | Researching; source audit found native input/textarea and correctly wired BindValueEvent; no gap confirmed; runtime and parity remain unreviewed | [TextField family audit](FLUENT-PARITY-TEXTFIELD-AUDIT.md) |
| Badge #445 | Researching; public Icon parameter docs conflict with source and optional infinite shadow has no reduced-motion override; no approval | [Badge family audit](FLUENT-PARITY-BADGE-AUDIT.md) |
| Checkbox #434 | Researching; Chrome/Edge AX confirm visual indeterminate state is announced unchecked; no approval | [Checkbox / Switch family audit](FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md) |
| Switch #435 | Researching; Chrome/Edge AX expose checkbox semantics rather than switch role; no approval | [Checkbox / Switch family audit](FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md) |
| RadioGroup #436 | Researching; group is ignored in browser AX and ArrowRight crosses into the next group in Chrome/Edge; no approval | [RadioGroup family audit](FLUENT-PARITY-RADIOGROUP-AUDIT.md) |
| OtpField #441 | Researching; Chrome/Edge confirm English labels and test typing, backspace and synthetic paste; length edge cases/AT remain open | [OtpField family audit](FLUENT-PARITY-OTP-AUDIT.md) |
| NumericField #433 | Researching; public Step parameter is not consumed and input mode/step semantics need a contract | [Typed field family audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) |
| SelectField #437 | Researching; inherited BindValueEvent is ignored and multiple-select runtime remains unverified | [Typed field family audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) |
| DateField #438 | Researching; DateClass no-op, typed Min/Max bypass, YearSelect mask mismatch and unnamed calendar trigger | [Typed field family audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) |
| TimeField #439 | Researching; inherited BindValueEvent is ignored and Culture-vs-format contract needs disposition | [Typed field family audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) |
| MaskedField #440 | Researching; inherited BindValueEvent is ignored; mask/caret/IME behavior still requires runtime tests | [Typed field family audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) |
| Slider #442 | Researching; visual, pointer behavior and browser accessibility gaps documented; no approval | [Slider / RangeSlider family audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md) |
| RangeSlider #443 | Researching; visual, pointer behavior and dual-thumb accessibility gaps documented; no approval | [Slider / RangeSlider family audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md) |
| FileSelect #444 | Researching; file-count behavior and browser accessible-name gaps documented; no approval | [FileSelect family audit](FLUENT-PARITY-FILESELECT-AUDIT.md) |

These reports are explicit audit artifacts, not accepted design or implementation evidence. Partial runtime results are documented in the [Checkbox/Switch/RadioGroup Chrome/Edge browser audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md); raw results and screenshots are linked there. These results do not satisfy the full evidence-bundle requirement.

### Existing family-specific research leads

| Family | Existing source/research documents |
| --- | --- |
| Button | [FLUENT-PARITY-P0-BUTTON-KEYBOARD.md](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md) · [FLUENT-PARITY-BUTTON-ICON-AX.md](FLUENT-PARITY-BUTTON-ICON-AX.md) · [FLUENT-PARITY-BUTTON-TOGGLE-STATES.md](FLUENT-PARITY-BUTTON-TOGGLE-STATES.md) · [FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) |
| Icon | [FLUENT-PARITY-ICON-VARIANTS.md](FLUENT-PARITY-ICON-VARIANTS.md) · [FLUENT-PARITY-ICON-BROWSER.md](FLUENT-PARITY-ICON-BROWSER.md) · [FLUENT-PARITY-ICON-SVG-PROTOTYPE.md](FLUENT-PARITY-ICON-SVG-PROTOTYPE.md) |
| Label | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| Link | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) · [FOCUS-TABLIST-PANELS-LINKS-DISABLED.md](FOCUS-TABLIST-PANELS-LINKS-DISABLED.md) |
| Badge | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| TextField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) · [FOCUS-KEYBOARD-ARCHITECTURE-PROPOSAL.md](FOCUS-KEYBOARD-ARCHITECTURE-PROPOSAL.md) |
| Checkbox | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) · [FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) |
| Switch | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) · [FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) |
| NumericField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| RadioGroup | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) · [FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) |
| SelectField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) · [FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md) |
| DateField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| TimeField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| MaskedField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| OtpField | [FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) |
| Slider | [FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md) · [FLUENT-WC-3.1.3-FORCED-COLORS-REFLOW.md](FLUENT-WC-3.1.3-FORCED-COLORS-REFLOW.md) · [FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md](FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md) · [FLUENT-PARITY-P0-SEMANTICS.json](FLUENT-PARITY-P0-SEMANTICS.json) |
| RangeSlider | [FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md) · [FLUENT-WC-3.1.3-FORCED-COLORS-REFLOW.md](FLUENT-WC-3.1.3-FORCED-COLORS-REFLOW.md) · [FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md](FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md) · [FLUENT-PARITY-P0-SEMANTICS.json](FLUENT-PARITY-P0-SEMANTICS.json) |
| FileSelect | [FLUENT-PARITY-P0-FILESELECT-LIVE-UPLOAD.md](FLUENT-PARITY-P0-FILESELECT-LIVE-UPLOAD.md) · [FLUENT-PARITY-P0-FILESELECT-PUBLISHED-SERVER.md](FLUENT-PARITY-P0-FILESELECT-PUBLISHED-SERVER.md) · [FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md](FLUENT-WC-3.1.3-LIGHT-DARK-RTL-COMPARISON.md) |

**Interpretation:** these are source research pointers only. Browser evidence is scoped to its stated scenario; screenshots, source crosswalks, CDP accessibility snapshots and green smoke tests do not prove native OS/assistive-technology acceptance or design approval. The full evidence bundle remains pending for all 18 families.

## Required per-component evidence bundle

| Category | Minimum evidence |
| --- | --- |
| Visual | Named official Fluent reference and actual runtime screenshots (rest/hover/pressed/focus-visible/disabled/selected/error as relevant); token/radius/stroke/padding/color/typography/icon alignment comparisons; Light/Dark/Brand/forced-colors, desktop/320px/zoom, RTL/LTR, non-touching Cards. |
| Feature | Complete Blazor public parameter/event/default/slot census; matched Fluent API or explicitly justified no-counterpart. Every feature **Supported / Missing / Intentional Bluent extension / Not applicable (justification) / Unverified**. React-only fallback must be labeled. |
| Behavior | Actual pointer/touch/keyboard/tab/Enter/Space/arrows/Escape behavior as applicable; focus transition, event order and Blazor ValueChanged on Chrome and Edge × WebAssembly/published InteractiveServer; broken or skipped paths explicitly excluded from PASS count. |
| Accessibility | Native role/semantics, accessible name, screen-reader announcement, contrast, forced colors, focus order; actual OS/AT manual validation or **pending**. CDP/AX and visual screenshots alone are not OS/AT acceptance. |
| Design | Editable Bluent Penpot/Figma file, page and node, design version/revision, approved exception rationale, source/token mapping, reviewer signature/review notes. |
| Outcome | Screenshots and test evidence linked from source branch; each finding linked to owning component issue #428–#445; priority and fix/defer decision, docs/Skills/migration coverage. |

### Status discipline

Unstarted dimensions remain **not_reviewed**. Button and FileSelect have behavior/accessibility gaps documented; Icon has visual/accessibility gaps documented; Label has an accessibility gap documented; Link has behavior/accessibility gaps documented; Badge has feature-documentation/accessibility gaps documented; Checkbox and Switch have accessibility gaps documented; NumericField, SelectField, DateField, TimeField and MaskedField have source-confirmed API/behavior gaps; RadioGroup has behavior/accessibility gaps; OtpField has localized-name and length-label gaps; Slider and RangeSlider also have visual gaps documented. All 18 families now have partial source/API audit reports. TextField has no confirmed gap from source inspection, so its nine dimensions remain `not_reviewed`. All design approvals and full evidence bundles remain pending, and matched upstream equivalence is not yet accepted. Existing 18 Lab entries stay representative-only; they are not automatically comparable Fluent implementations. Use auditable denominators, mark N/A with evidence, and count neither skipped nor unverified cases as passing. **Audited gaps** is not **Design approved**, which is not **Implementation verified**. Closure of tracker #552 requires all 18 reviewed matrices and gap dispositions, **not** the automatic closure of 18 product issues.

### Specific known gaps already uncovered by the existing pilot tests

- **#442:** ScreenX-vs-viewport coordinate mismatch and Slider bound pointer value unchanged in published InteractiveServer; **#443:** two-thumb order/collision and no verified Server pointer behavior.
- **#444:** current API uses MaxFiles for multiple selection, while legacy demo uses Multiple; remove action is icon-only and requires an accessible name; Accept is a browser hint rather than a file safety guarantee; maintain nested Card spacing. Existing Lab SSR Card gap previously measured 6px and was corrected.
- **#428:** icon/text alignment and split/toggle keyboard/ARIA, preserving brand focus ring. **#432:** focus underline, not redundant full-box outline.
- **#429:** Color icons remain desired research/possible upstream asset fallback, not necessarily an approved public IconVariant.Color enum.

Design/architecture dependencies [#417](https://github.com/vrassouli/Bluent/issues/417), [#418](https://github.com/vrassouli/Bluent/issues/418), [#419](https://github.com/vrassouli/Bluent/issues/419), [#420](https://github.com/vrassouli/Bluent/issues/420), and QA #425 must be respected. No arbitrary time estimates, production changes or premature Issue state transitions. Product tasks advance Backlog → Ready → In progress → Review → Done separately from audit tracker.
