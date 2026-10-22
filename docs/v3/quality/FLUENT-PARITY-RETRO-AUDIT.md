# Retrospective Fluent 2 parity review: first 18 Component Lab pilots

> **Retrospective audit in progress; not a Fluent parity acceptance result.** Tracking issue [#552](https://github.com/vrassouli/Bluent/issues/552); Epic [#416](https://github.com/vrassouli/Bluent/issues/416), Lab [#421](https://github.com/vrassouli/Bluent/issues/421), quality [#425](https://github.com/vrassouli/Bluent/issues/425). **All 18 families now have partial source/API audit reports and linked browser/runtime evidence; 0/18 Fluent-approved. Waves A-D now provide manual API mappings for all 18 families and 239 source-known direct and locally inherited parameter occurrences. The ledgers document supported concepts, missing behavior and Bluent extensions; they are source/API audits, not parity approvals. Visual, behavior, accessibility, token/theme, responsive RTL, Blazor-extension, design-artifact and migration acceptance remain incomplete.** Green Chrome/Edge pilot tests prove only particular Bluent source behavior. None of these product issues are Done or newly design-approved.

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
| 6 | [TextField](https://github.com/vrassouli/Bluent/issues/432) (#432) | P1 | B | **Audited gaps** | Not reviewed | Not reviewed | Not reviewed |
| 7 | [Checkbox](https://github.com/vrassouli/Bluent/issues/434) (#434) | P1 | B | **Audited gaps** | Not reviewed | Not reviewed | **A11y: audited gaps; browser AX confirms mixed-state gap; design: not reviewed** |
| 8 | [Switch](https://github.com/vrassouli/Bluent/issues/435) (#435) | P1 | B | **Audited gaps** | Not reviewed | Not reviewed | **A11y: audited gaps; browser AX role=checkbox; design: not reviewed** |
| 9 | [NumericField](https://github.com/vrassouli/Bluent/issues/433) (#433) | P1 | B | **Audited gaps** | **Audited gaps** | **Audited gaps** | Not reviewed |
| 10 | [RadioGroup](https://github.com/vrassouli/Bluent/issues/436) (#436) | P1 | B | **Audited gaps** | Not reviewed | **Audited gaps; ArrowRight crosses groups in Chrome/Edge** | **A11y: group ignored in browser AX; design: not reviewed** |
| 11 | [SelectField](https://github.com/vrassouli/Bluent/issues/437) (#437) | P1 | B | **Audited gaps** | **Audited gaps** | **Audited gaps** | Not reviewed |
| 12 | [DateField](https://github.com/vrassouli/Bluent/issues/438) (#438) | P1 | C | **Audited gaps** | **Audited gaps** | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 13 | [TimeField](https://github.com/vrassouli/Bluent/issues/439) (#439) | P1 | C | **Audited gaps** | **Audited gaps** | **Audited gaps** | Not reviewed |
| 14 | [MaskedField](https://github.com/vrassouli/Bluent/issues/440) (#440) | P1 | C | **Audited gaps** | **Audited gaps** | **Audited gaps** | Not reviewed |
| 15 | [OtpField](https://github.com/vrassouli/Bluent/issues/441) (#441) | P1 | C | **Audited gaps** | Not reviewed | Not reviewed | **A11y: audited gaps; design: not reviewed** |
| 16 | [Slider](https://github.com/vrassouli/Bluent/issues/442) (#442) | P0 | D | **Audited gaps** | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 17 | [RangeSlider](https://github.com/vrassouli/Bluent/issues/443) (#443) | P0 | D | **Audited gaps** | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |
| 18 | [FileSelect](https://github.com/vrassouli/Bluent/issues/444) (#444) | P0 | D | **Audited gaps** | Not reviewed | **Audited gaps** | **A11y: audited gaps; design: not reviewed** |

## Frozen upstream reference baseline (2026-10-22)

The reference set is now pinned for reproducibility. This freezes the source/version selection; it does not mean any Bluent family is approved.

- **Fluent 2 visual/UX reference:** [Fluent 2 Design System](https://fluent2.microsoft.design/) — live evergreen site; snapshot date 2026-10-22 because no semantic version is exposed.
- **Primary implementation reference:** [@fluentui/web-components@3.1.3](https://www.npmjs.com/package/@fluentui/web-components) and the [official Web Components Storybook](https://storybooks.fluentui.dev/web-components/). The package latest tag was 3.1.3 on the snapshot date.
- **React fallback only where Web Components lacks a comparable component:** [@fluentui/react-components@9.74.10](https://www.npmjs.com/package/@fluentui/react-components), with exact tarball integrity pinned by the checked-in crosswalk. The latest tag is 9.74.11; 9.74.10 is deliberately retained to keep the existing API candidate evidence reproducible. Do not silently upgrade this baseline mid-audit.
- **Icon asset reference:** [@fluentui/react-icons@2.0.344](https://www.npmjs.com/package/@fluentui/react-icons) — latest tag on the snapshot date; use it as the Fluent System Icons asset catalog, not as a standalone Web Components component.
- Storybook deployments are live and are **not assumed to be release-pinned** to the package versions above. React v9 is a cross-platform reference, not a DOM/API 1:1. Do not use React v8 compatibility components as v9 references.
- Version evidence: [npm package versions, dist-tags and integrity snapshot](evidence/FLUENT-NPM-REFERENCE-VERSIONS-2026-10-22.json). Component mapping evidence: [Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md), [React 9.74.10 API candidates](FLUENT-REACT-9.74.10-18-API-CANDIDATES.md), [React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md).

### Verified upstream component mapping

| Family | Web Components match | Mapping kind | React v9 fallback / icon reference |
|---|---|---|---|
| Button #428 | fluent-button (also fluent-toggle-button, fluent-compound-button, fluent-menu-button, fluent-anchor-button) | direct-web-component | — (not primary; direct WC counterpart) |
| Icon #429 | No WC icon tag; Fluent System Icons asset library | icon-library-reference | @fluentui/react-icons@2.0.344 (asset library, not component) |
| Label #430 | fluent-label | direct-web-component | — (not primary; direct WC counterpart) |
| Link #431 | fluent-link (also fluent-anchor-button) | direct-web-component | — (not primary; direct WC counterpart) |
| Badge #445 | fluent-badge (also fluent-counter-badge) | direct-web-component | — (not primary; direct WC counterpart) |
| TextField #432 | fluent-text-input | direct-web-component | — (not primary; direct WC counterpart) |
| Checkbox #434 | fluent-checkbox | direct-web-component | — (not primary; direct WC counterpart) |
| Switch #435 | fluent-switch | direct-web-component | — (not primary; direct WC counterpart) |
| NumericField #433 | Related only: fluent-text-input | react-v9-cross-platform | Field + SpinButton |
| RadioGroup #436 | fluent-radio-group + fluent-radio | direct-web-component | — (not primary; direct WC counterpart) |
| SelectField #437 | Related only: fluent-dropdown, fluent-dropdown-option, fluent-listbox | related-only | Field + Select / Dropdown / Combobox |
| DateField #438 | Related only: fluent-text-input | native-input-pattern | Field + Input (native date input pattern) |
| TimeField #439 | Related only: fluent-text-input | native-input-pattern | Field + Input (native time input pattern) |
| MaskedField #440 | Related only: fluent-text-input | bluent-extension | Input primitive only; no mask component |
| OtpField #441 | Related only: fluent-text-input | bluent-extension | Input primitive only; no OTP component |
| Slider #442 | fluent-slider | direct-web-component | — (not primary; direct WC counterpart) |
| RangeSlider #443 | Related only: fluent-slider (single-thumb only) | bluent-extension | Slider (single-thumb only; not 1:1) |
| FileSelect #444 | No direct component; native/extension pattern | native-input-pattern | Field + Input[type=file] (native primitive only) |

The machine-readable JSON is the source of truth for mapping notes, related-only tags and alternatives. A direct or related upstream component does not prove Bluent parity; the per-family public-property/event/slot/style comparison remains a separate audit dimension.

## Supplemental source/API research (research leads, not acceptance evidence)

The following pinned references now provide traceable starting points for the family audits. They are **not** a substitute for the nine-dimension acceptance matrix below, and none changes a family's `auditStatus`, `dimensions`, `designApproval`, or `evidenceBundle`. Exact-name matches are not semantic parity.

- [Fluent Web Components 3.1.3 family crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Fluent Web Components API-name candidates](FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md)
- [Pinned Fluent React 9.74.10 API-name candidates](FLUENT-REACT-9.74.10-18-API-CANDIDATES.md)
- [Family-by-family React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Bluent source API census](FLUENT-PARITY-18-SOURCE-API.json)
- [Wave A manual Fluent API review (82 source-known parameter occurrences)](FLUENT-PARITY-WAVE-A-API-REVIEW.md) and [machine-readable ledger](FLUENT-PARITY-WAVE-A-API-REVIEW.json)
- [Wave B manual Fluent API review (71 source-known parameter occurrences)](FLUENT-PARITY-WAVE-B-API-REVIEW.md) and [machine-readable ledger](FLUENT-PARITY-WAVE-B-API-REVIEW.json)
- [Wave C manual Fluent API review (40 source-known parameter occurrences)](FLUENT-PARITY-WAVE-C-API-REVIEW.md) and [machine-readable ledger](FLUENT-PARITY-WAVE-C-API-REVIEW.json)
- [Wave D manual Fluent API review (46 source-known parameter occurrences)](FLUENT-PARITY-WAVE-D-API-REVIEW.md) and [machine-readable ledger](FLUENT-PARITY-WAVE-D-API-REVIEW.json)

### Partial family audit reports

| Family | Current disposition | Report |
| --- | --- | --- |
| Button #428 | Researching; behavior and browser accessibility have confirmed open gaps; no approval | [Button family audit](FLUENT-PARITY-BUTTON-AUDIT.md) · [keyboard evidence](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md) · [icon/AX evidence](FLUENT-PARITY-BUTTON-ICON-AX.md) · [toggle evidence](FLUENT-PARITY-BUTTON-TOGGLE-STATES.md) |
| Icon #429 | Researching; custom SVG sizing and unnamed image gaps reproduced in Chrome/Edge; no approval | [Icon family audit](FLUENT-PARITY-ICON-AUDIT.md) · [browser evidence](FLUENT-PARITY-ICON-BROWSER.md) |
| Label #430 | Researching; browser AX names Info action `This is a label` from parent label, not action-specific; required demo target absent only in isolated fixture; no approval | [Label source audit](FLUENT-PARITY-LABEL-AUDIT.md) · [Browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md) |
| Link #431 | Researching; disabled anchor remains focusable generic AX node with no `href`/`aria-disabled`; callback guard remains untested in runtime; no approval | [Link source audit](FLUENT-PARITY-LINK-AUDIT.md) · [Browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md) |
| TextField #432 | Researching; default field is named `Example text field` and label association works in browser AX; empty HTML name observed but form serialization remains untested | [TextField source audit](FLUENT-PARITY-TEXTFIELD-AUDIT.md) · [Typed-field browser evidence](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) |
| Badge #445 | Researching; `AnimateShadow` remains 1.5s infinite under CDP reduced-motion emulation; Icon API documentation mismatch remains open; no approval | [Badge source audit](FLUENT-PARITY-BADGE-AUDIT.md) · [Browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md) |
| Checkbox #434 | Researching; Chrome/Edge AX confirm visual indeterminate state is announced unchecked; no approval | [Checkbox / Switch family audit](FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md) · [browser evidence](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) |
| Switch #435 | Researching; Chrome/Edge AX expose checkbox semantics rather than switch role; no approval | [Checkbox / Switch family audit](FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md) · [browser evidence](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) |
| RadioGroup #436 | Researching; group is ignored in browser AX and ArrowRight crosses into the next group in Chrome/Edge; no approval | [RadioGroup family audit](FLUENT-PARITY-RADIOGROUP-AUDIT.md) · [browser evidence](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) |
| OtpField #441 | Researching; Chrome/Edge confirm English labels and test typing, backspace and synthetic paste; length edge cases/AT remain open | [OtpField family audit](FLUENT-PARITY-OTP-AUDIT.md) · [browser evidence](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) |
| NumericField #433 | Researching; `Step` no-op remains open; Chrome/Edge keyboard entry `123` updates bound output; no native inputmode/step/min/max on inspected text input | [Typed field source audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) · [Browser evidence](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) |
| SelectField #437 | Researching; native combobox ArrowDown changes Green to Blue in Chrome/Edge; inherited `BindValueEvent` and multiple-select remain open | [Typed field source audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) · [Browser evidence](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) |
| DateField #438 | Researching; browser confirms named text/date-month fields and disabled fixture; typed Min/Max, YearSelect and calendar trigger remain open | [Typed field source audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) · [Browser evidence](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) |
| TimeField #439 | Researching; browser confirms named text inputs for time/seconds; Culture/format and inherited event-selector contract remain open | [Typed field source audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) · [Browser evidence](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) |
| MaskedField #440 | Researching; Chrome/Edge reproduce fixed-prefix `9` duplication (`09123456789` → `0991-234-5678`); paste/caret/IME remain open | [Typed field source audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md) · [Browser evidence](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) |
| Slider #442 | Researching; visual, pointer behavior and browser accessibility gaps documented; no approval | [Slider / RangeSlider family audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md) · [pointer/browser evidence](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md) |
| RangeSlider #443 | Researching; visual, pointer behavior and dual-thumb accessibility gaps documented; no approval | [Slider / RangeSlider family audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md) · [pointer/browser evidence](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md) |
| FileSelect #444 | Researching; file-count behavior and browser accessible-name gaps documented; no approval | [FileSelect family audit](FLUENT-PARITY-FILESELECT-AUDIT.md) · [live upload evidence](FLUENT-PARITY-P0-FILESELECT-LIVE-UPLOAD.md) · [published Server evidence](FLUENT-PARITY-P0-FILESELECT-PUBLISHED-SERVER.md) |

These reports are explicit audit artifacts, not accepted design or implementation evidence. See the [partial browser evidence coverage index](#partial-browser-evidence-coverage-2026-10-22) for current links across all 18 families. This evidence does not satisfy the full evidence-bundle requirement.

## Partial browser evidence coverage (2026-10-22)

**18/18 families now have linked, partial browser/runtime evidence; 0/18 are Fluent-approved.** Evidence is grouped by probe below; the count indicates coverage, not acceptance or completion of the nine-dimension matrix.

- **Button #428:** [keyboard/Enter/Space](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md), [icon and accessible-name AX](FLUENT-PARITY-BUTTON-ICON-AX.md), [toggle-state AX](FLUENT-PARITY-BUTTON-TOGGLE-STATES.md).
- **Icon #429:** [live Chrome/Edge browser and AX evidence](FLUENT-PARITY-ICON-BROWSER.md).
- **Label #430, Link #431, Badge #445:** [Label/Link/Badge browser audit](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md) — 31/31 checks per engine.
- **TextField #432, NumericField #433, SelectField #437, DateField #438, TimeField #439, MaskedField #440:** [typed-field browser audit](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) — 42/42 checks per engine.
- **Checkbox #434, Switch #435, RadioGroup #436, OtpField #441:** [control semantics browser audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) — 56/56 checks per engine.
- **Slider #442 and RangeSlider #443:** [Slider/RangeSlider audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md) and [pointer/screen/viewport evidence](FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md), including WebAssembly and published-Server scenarios.
- **FileSelect #444:** [FileSelect audit](FLUENT-PARITY-FILESELECT-AUDIT.md), [live upload evidence](FLUENT-PARITY-P0-FILESELECT-LIVE-UPLOAD.md) and [published-Server evidence](FLUENT-PARITY-P0-FILESELECT-PUBLISHED-SERVER.md).

These reports differ in coverage and environment. CDP AX snapshots, browser-computed styles, screenshots and green probes are not native screen-reader/OS-contrast acceptance, a complete state/event matrix, an editable Penpot review, or approval to change product code. Keep `auditComplete=false`, `noneApproved=true`, every `designApproval=pending` and every `evidenceBundle=null` until the nine dimensions and each actionable gap disposition are independently reviewed.


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


## Penpot design-decision artifact (2026-10-22)

A real, editable audit map has been added to the source-owned Penpot file. This is a quality/disposition artifact, **not** a component redesign or parity approval.

- File: `Bluent v3 Design System` — ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Page: `03 · Quality & migration` — ID `07c521b9-e441-80bd-8008-c4ad87df93c3`.
- Board: `#552 · Fluent parity audit coverage · DRAFT` — node ID `4d22aead-d6ef-801a-8008-d482b9bb0cc8`.
- Review date: 2026-10-22; the file revision is 447; named version "Issue #552 Waves A-D API coverage - DRAFT". The board is at x=1700, y=90, 1660×1120 and contains all 18 families, evidence group, reproduced/open gap and pending approval state.
- The board summary now records 239 API entries across 18/18 families and highlights newly confirmed API gaps; it remains a coverage index, not an approval.
- No product component designs or code were changed. All family design approvals remain pending; native AT/OS contrast, complete state/event matrices and the nine-dimension acceptance review remain open.
## Wave A API review (2026-10-22)

The [review report](FLUENT-PARITY-WAVE-A-API-REVIEW.md) and [machine-readable ledger](FLUENT-PARITY-WAVE-A-API-REVIEW.json) classify **82/82 direct and locally inherited parameter occurrences** across Button, Icon, Label, Link and Badge. The source-generated API-name candidate queue remains unchanged; the new ledger is a separate manual review. `Supported` means an API mapping is identified, not that runtime, visual, accessibility or overall Fluent parity has passed.

| Family | Owner | Parameters reviewed | Feature disposition | Principal open API gap |
|---|---:|---:|---|---|
| Button | #428 | 30 | `audited_gaps` | Base Button combines anchor, toggle, compound and menu behavior; Danger and positioned Badge/Popover APIs are Bluent extensions. |
| Icon | #429 | 10 | `audited_gaps` | No dedicated WC Icon tag; generic source abstraction is Bluent-specific; Color variant remains undecided and is not claimed. |
| Label | #430 | 14 | `audited_gaps` | Native `for` association, automatic required inference, custom required symbol and Info popover are Bluent-specific. |
| Link | #431 | 12 | `audited_gaps` | Href/appearance map, but anchor/button fallback and disabled-anchor semantics differ from `fluent-link`. |
| Badge | #445 | 16 | `audited_gaps` | `Outlined` needs normalization, `Sever` does not match upstream `severe`, and shadow animation is a Bluent extension. |

The Wave A `feature` dimension is now `audited_gaps` for these five families. This does not change their other dimension statuses, `designApproval=pending`, `evidenceBundle=null`, or the overall `auditComplete=false` boundary.

## Component design comparisons (partial, 2026-10-22)

The editable Penpot comparison for four families now has a concrete visual disposition. Full detail and all reference/local page-node IDs are in [FLUENT-PARITY-CORE-CONTROLS-DESIGN-AUDIT.md](FLUENT-PARITY-CORE-CONTROLS-DESIGN-AUDIT.md). These remain draft findings, not approvals.

| Family | Fluent reference node | Bluent draft node | Design disposition |
|---|---|---|---|
| Button #428 | page 09 / `07c521b9-e441-80bd-8008-c4b5759995ec` | page 22 / `e31294c6-7c55-805f-8008-c5a91188deb7` | `audited_gaps`: comparison export omits headings and row/column labels; clean export needed. |
| TextField #432 | page 10 / `07c521b9-e441-80bd-8008-c4d65b54658b` | page 16 / `e31294c6-7c55-805f-8008-c512bf412b37` | `audited_gaps`: 28 upstream variants vs 10 local; Hover/Pressed/Underline and separate Filled variants missing. |
| Checkbox #434 | page 11 / `07c521b9-e441-80bd-8008-c4d69e2a5bfe` | page 17 / `e31294c6-7c55-805f-8008-c51334e865e4` | `audited_gaps`: 30 upstream variants vs 12 local; Hover/Pressed/Circular missing; Error is an extra Bluent state. |
| Switch #435 | page 14 / `07c521b9-e441-80bd-8008-c4d793b68198` | page 18 / `e31294c6-7c55-805f-8008-c5139a9544bf` | `audited_gaps`: 40 upstream variants vs 12 local; Hover/Pressed and label-position variants missing. |

All four families remain `designApproval=pending`. The other 14 families have no reviewed editable component-frame pair linked in this audit yet; their `designArtifact` dimension remains `not_reviewed`.

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
