# Bluent v3 SelectField — #437 task-branch handoff

> **In progress · not merged or released.** Use this only for the isolated v3 task branch `v3/issue-437-selectfield`. The existing 2.x SelectField reference and consumer Skill remain authoritative for released Bluent packages.

## Source of truth

1. [Canonical SelectField v3 implementation record](../../../docs/v3/components/select-field.md) — source-backed API, scalar/array behavior, demos, migration and evidence limits.
2. [Design and API contract](../../../docs/v3/design/SELECTFIELD-DESIGN-AND-API-CONTRACT.md) — native-select decision, parameter boundaries and Penpot IDs.
3. [Issue #437](https://github.com/vrassouli/Bluent/issues/437) and [Draft PR #568](https://github.com/vrassouli/Bluent/pull/568), targeting `bluent-v3` only.
4. Owned Penpot file **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 60 (`28143240-43dc-80cc-8008-f84a2fd6a22c`); boards `28143240-43dc-80cc-8008-f84a3bd17206`, `28143240-43dc-80cc-8008-f84aa30a32ea`, `28143240-43dc-80cc-8008-f84aa52eb253`. All remain DRAFT / REVIEW REQUIRED.
5. Source: `src/Bluent.UI/Components/SelectFieldComponent/`; shared styles: `src/Bluent.UI/Styles/Components/_field.scss`.
6. WebAssembly showcase: `/components/select-fields`; production-published InteractiveServer fixture: `/compatibility/select-fields-server`.
7. Local contract/runtime scripts: `scripts/quality/check_v3_selectfield_contract.py`, `scripts/quality/test_v3_selectfield_contract.py`, `scripts/quality/run_v3_selectfield.ps1` and `scripts/quality/probe_v3_selectfield.mjs`.

## API and behavior rules

- Package / namespace: `Bluent.UI` / `Bluent.UI.Components`.
- The only direct parameter is `ChildContent : RenderFragment?`; nested content is native `<option>` / `<optgroup>`.
- Inherit value callbacks, expression, EditContext, validation and NameAttributeValue from `InputBase<TValue>`; inherit `StartAddon`, `EndAddon`, `FieldSize`, `BindValueEvent`, `Class` and `Style` from the Bluent field base.
- Scalar `TValue` uses the native single-select. Array `TValue` renders `multiple` and receives the native selected `string[]` payload.
- Runtime-verified arrays: `string[]`, `int[]`, `bool[]`, `bool?[]` and `decimal[]`. Boolean option text is lowercase `true` / `false`; bool-array parsing is element-wise and empty option values map to `null` for `bool?[]`. Decimal arrays use `CultureInfo.CurrentCulture`; de-DE/fa-IR are included in the published InteractiveServer matrix.
- Default `BindValueEvent` is `onchange`; the component now actually registers the inherited event on both scalar and array paths. `oninput` is also tested.
- The browser/OS owns the popup, keyboard and native listbox interaction. Do not add a custom popup, chips, search/filter or JavaScript keyboard layer.
- Consumers own associated Label, readable help/error content and `aria-describedby`; EditContext supplies native `aria-invalid`. Do not infer spoken AT acceptance from Chromium AX roles.
- Use existing shared field/theme styles only. #418 owns global token names/aliases; do not consume draft aliases.

## Current local evidence checkpoint

- Focused HtmlRenderer contract tests: **12/12**.
- Chrome/Edge × WebAssembly/InteractiveServer: **23/23 per core cell, 92/92 core total; plus de-DE/fa-IR Server 46/46, 138/138 across six sessions**, including single combobox and multiple listbox AX roles, bool[]/bool?[] selection changes, culture-sensitive decimal[] selection, addon placement, onchange/oninput, EditForm validation, RTL and 320px reflow.
- Four core JSON reports/twelve PNGs plus two culture-specific JSON reports/six PNGs are retained under `docs/v3/quality/evidence/BLUENT-SELECTFIELD-*`.
- Local runtime browser logs show no unexpected console errors, exceptions or application HTTP failures. The production-published SSR test emits a local HTTP→HTTPS redirect configuration warning; it is not a browser/runtime failure.
- Exact-head hosted CI on commit `eb9219a4d3c0bc248e63226f1ef6d842a0791208` (browser workflow [run #190](https://github.com/vrassouli/Bluent/actions/runs/44609152350)) passed the SelectField source/evidence contract with **0 findings**, all four Chrome/Edge × WebAssembly/InteractiveServer cells at **23/23 each (92/92)**, and the published Chrome/InteractiveServer `de-DE` and `fa-IR` cells at **23/23 each (46/46)**. The predecessor hosted revision had four 19-assertion cells (**76/76**); that historical result is superseded by the exact-head matrix below. Hosted SelectField total: **138/138 across six sessions**. Culture reports and all browser artifacts were uploaded. The exact-head shared run is not wholly green: the separate Button #428 runtime job fails all four Chrome/Edge × Server/WebAssembly cells on the unrelated `Tab` menu-dismissal/focus-transfer assertion; that job's Release solution tests still pass **145/145**. Do not change Button under #437. Baseline build/tests, Docs, Skills, Public Census, Component Lab and source/contract checks passed. PR #568 remains Draft until the SelectField design and native accessibility acceptance gates are completed.
- Native Windows Contrast Themes, spoken Narrator/NVDA/VoiceOver and maintainer design acceptance remain open.

## Version and release boundary

No stable v3 NuGet package/API is released. Keep all work on the task branch and PR against `bluent-v3`. Never merge to stable `Dev`/main, publish packages or deploy. Do not mark the issue Done until the accepted PR merges into `bluent-v3` and the remaining acceptance gates are met.
