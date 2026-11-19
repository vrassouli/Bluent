# Bluent v3 SelectField — #437 task-branch handoff

> **In progress · not merged or released.** Use this only for the isolated v3 task branch `v3/issue-437-selectfield`. The existing 2.x SelectField reference and consumer Skill remain authoritative for released Bluent packages.

## Source of truth

1. [Canonical SelectField v3 implementation record](../../../docs/v3/components/select-field.md) — source-backed API, scalar/array behavior, demos, migration and evidence limits.
2. [Design and API contract](../../../docs/v3/design/SELECTFIELD-DESIGN-AND-API-CONTRACT.md) — native-select decision, parameter boundaries and Penpot IDs.
3. [Issue #437](https://github.com/vrassouli/Bluent/issues/437) and [Draft PR #568](https://github.com/vrassouli/Bluent/pull/568), targeting `bluent-v3` only. Pushed task head: `c06b760cf68eaed5691c03156bf1464672632d7c`.
4. Owned Penpot file **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 60 (`28143240-43dc-80cc-8008-f84a2fd6a22c`); boards `28143240-43dc-80cc-8008-f84a3bd17206`, `28143240-43dc-80cc-8008-f84aa30a32ea`, `28143240-43dc-80cc-8008-f84aa52eb253`. All remain DRAFT / REVIEW REQUIRED.
5. Source: `src/Bluent.UI/Components/SelectFieldComponent/`; shared styles: `src/Bluent.UI/Styles/Components/_field.scss`.
6. WebAssembly showcase: `/components/select-fields`; production-published InteractiveServer fixture: `/compatibility/select-fields-server`.
7. Local contract/runtime scripts: `scripts/quality/check_v3_selectfield_contract.py`, `scripts/quality/test_v3_selectfield_contract.py`, `scripts/quality/run_v3_selectfield.ps1` and `scripts/quality/probe_v3_selectfield.mjs`.

## API and behavior rules

- Package / namespace: `Bluent.UI` / `Bluent.UI.Components`.
- The only direct parameter is `ChildContent : RenderFragment?`; nested content is native `<option>` / `<optgroup>`.
- Inherit value callbacks, expression, EditContext, validation and NameAttributeValue from `InputBase<TValue>`; inherit `StartAddon`, `EndAddon`, `FieldSize`, `BindValueEvent`, `Class` and `Style` from the Bluent field base.
- Scalar `TValue` uses the native single-select. Array `TValue` renders `multiple` and receives the native selected `string[]` payload.
- Runtime-verified arrays: `string[]`, `int[]`, `bool[]`. Boolean option text is lowercase `true` / `false`; the bool-array parser is element-wise.
- Default `BindValueEvent` is `onchange`; the component now actually registers the inherited event on both scalar and array paths. `oninput` is also tested.
- The browser/OS owns the popup, keyboard and native listbox interaction. Do not add a custom popup, chips, search/filter or JavaScript keyboard layer.
- Consumers own associated Label, readable help/error content and `aria-describedby`; EditContext supplies native `aria-invalid`. Do not infer spoken AT acceptance from Chromium AX roles.
- Use existing shared field/theme styles only. #418 owns global token names/aliases; do not consume draft aliases.

## Current local evidence checkpoint

- Focused HtmlRenderer contract tests: **12/12**.
- Chrome/Edge × WebAssembly/InteractiveServer: **19/19 per cell, 76/76 total**, including single combobox and multiple listbox AX roles, bool[] selection changes, addon placement, onchange/oninput, EditForm validation, RTL and 320px reflow.
- Four JSON reports and twelve PNG screenshots are retained under `docs/v3/quality/evidence/BLUENT-SELECTFIELD-*`.
- Local runtime browser logs show no unexpected console errors, exceptions or application HTTP failures. The production-published SSR test emits a local HTTP→HTTPS redirect configuration warning; it is not a browser/runtime failure.
- Draft PR #568 is open on GitHub at task head `c06b760cf68eaed5691c03156bf1464672632d7c`; exact-head hosted CI has not yet reported a run.
- Native Windows Contrast Themes, spoken Narrator/NVDA/VoiceOver and maintainer design acceptance remain open.

## Version and release boundary

No stable v3 NuGet package/API is released. Keep all work on the task branch and PR against `bluent-v3`. Never merge to stable `Dev`/main, publish packages or deploy. Do not mark the issue Done until the accepted PR merges into `bluent-v3` and the remaining acceptance gates are met.
