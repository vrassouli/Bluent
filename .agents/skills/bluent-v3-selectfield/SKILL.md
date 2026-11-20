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
- Exact-head hosted CI on commit `58bd0dc27c98ba390297be83c4b570c2fc3ccb13` (browser workflow [run #191](https://github.com/vrassouli/Bluent/actions/runs/44611913086)) completed **31/32 jobs successfully**. All **7/7 SelectField jobs** passed: source/evidence contract (0 findings), four Chrome/Edge × WebAssembly/InteractiveServer cells at **23/23 each (92/92)**, and Chrome/InteractiveServer `de-DE` + `fa-IR` at **23/23 each (46/46)**. The predecessor hosted revision had four 19-assertion browser cells (**76/76**); that historical result is superseded. Hosted SelectField total on the latest PR head: **138/138 across six sessions**; all six JSON/PNG browser artifacts were uploaded. The sole shared browser-workflow failure is unrelated `NumericField / Chrome / Server` at **39/40**, only its existing Forced Colors color assertion; no NumericField files changed under #437. Latest-head Baseline Quality, Docs, Skills, Public Census, Component Lab (4/4), Button Runtime and Interaction Source (5/5) all passed. See the latest-head results in PR #568.
- Native Windows High Contrast White was enabled on Dev01 through Win32 `SystemParametersInfo`; `forced-colors: active` and `prefers-contrast: more` were true. The SelectField foreground/background/border resolved to Windows `CanvasText`/`Field` colors; the native popup selection used `Highlight`/`HighlightText`. Windows UI Automation exposed single select as a named `combobox`, array select as a `list`, selected `listitem` values, disabled state and the validation select; Tab traversal was observed from the demo link to Department to Priority. Full evidence: [BLUENT-SELECTFIELD-WINDOWS-HIGH-CONTRAST.json](../../../docs/v3/quality/evidence/BLUENT-SELECTFIELD-WINDOWS-HIGH-CONTRAST.json). Original Windows state was restored and verified (High Contrast White, flags 126, disabled). A stable focus-indicator screenshot was not obtained because the InteractiveServer reconnect overlay appeared during final focus capture; focus-visible styling remains unverified. Spoken Narrator/NVDA/VoiceOver output remains unverified.
- Maintainer design acceptance remains open; all three Penpot boards are DRAFT / REVIEW REQUIRED. PR #568 remains Draft.

## Version and release boundary

No stable v3 NuGet package/API is released. Keep all work on the task branch and PR against `bluent-v3`. Never merge to stable `Dev`/main, publish packages or deploy. Do not mark the issue Done until the accepted PR merges into `bluent-v3` and the remaining acceptance gates are met.
