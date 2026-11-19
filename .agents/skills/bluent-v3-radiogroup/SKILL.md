# Bluent v3 RadioGroup — #436 task handoff

> **Task-branch retrieval guide, not a released consumer API.** Current work is on v3/issue-436-radiogroup, targeting bluent-v3. Existing released 2.x RadioGroup consumers must continue to use the [2.x reference](../../../docs/components/radio-group.md) and the existing Bluent consumer Skill.

## Retrieval order

1. [Canonical v3 RadioGroup implementation record](../../../docs/v3/components/radio-group.md) for exact API, native semantics, local tests and known limits.
2. [Design/API decision record](../../../docs/v3/design/RADIOGROUP-DESIGN-AND-API-CONTRACT.md) for Penpot traceability, attribute ownership and deliberate native HTML choice.
3. [Issue #436](https://github.com/vrassouli/Bluent/issues/436) and its PR targeting bluent-v3 for live review/status.
4. Owned Bluent v3 Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000, Page 59 (0125a79e-69b2-807f-8008-f726bd56fcc7); boards 0125a79e-69b2-807f-8008-f726bd61b423, 0125a79e-69b2-807f-8008-f726c1464f5d and 0125a79e-69b2-807f-8008-f726c665a5cf remain DRAFT.
5. Source: src/Bluent.UI/Components/RadioGroupComponent/, src/Bluent.UI/Styles/Components/_radio.scss and _radio-group.scss.
6. Runnable showcase: src/Bluent.UI.Demo.Pages/Pages/Components/Radios.razor, route /components/radios; published Server fixture src/Bluent.UI.Demo.SSR/Components/Pages/RadioInteractiveServerProbe.razor.
7. Regression/browser proof: tests/RegexSampleGeneratorTest/RadioGroupRenderSemanticsTests.cs, scripts/quality/check_v3_radiogroup_contract.py, scripts/quality/run_v3_radiogroup.ps1 and scripts/quality/probe_v3_radiogroup.mjs.

## Source-backed API rules

- RadioGroup<TValue> inherits BluentInputComponentBase<TValue?>; its direct API is only ChildContent, Label, ItemsLabelPosition (After/Before) and Orientation (Horizontal/Vertical).
- Radio<TValue> has required Value and optional Label; it must be nested under a matching typed RadioGroup<TValue>.
- Preserve inherited Value, ValueChanged, ValueExpression, EditContext, Class and Style.
- The group renders native fieldset/legend. No extra role=radiogroup is added.
- A non-empty group Label supplies the visible legend. Without one, the consumer must provide aria-label or aria-labelledby. Each option still needs its own accessible name.
- One native name is shared by all options in a group: explicit group unmatched name, then InputBase.NameAttributeValue for a bound value expression, then generated group Id for an unbound group.
- Native type, name, value, checked, generated id and tabindex are component-owned. Preserve other non-conflicting attributes, including disabled, aria-*, data-* and title.
- EditContext.OnValidationStateChanged subscription is synchronized as context changes and removed on disposal. Children rerender aria-invalid when validation messages change.
- Keep browser-owned keyboard behavior. Do not add custom JavaScript unless a real browser test demonstrates a required native behavior that fails.
- The visual indicator is itself a second native `label.indicator[for]` with `aria-hidden="true"`; the readable caption is a separate `.option-label[for]`. Preserve this association so the visible circle activates the native radio in both Before and After layouts.
- Do not invent Size, Appearance, HelperText, ErrorMessage, Required, public Name, keyboard-mode or ARIA-role parameters. Do not consume preview-only #418 token aliases.

## Verification

~~~powershell
dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj -c Release --no-restore --filter FullyQualifiedName~RadioGroupRenderSemanticsTests
python scripts/quality/check_v3_radiogroup_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_radiogroup_contract.py' -v
dotnet build src/Bluent.UI/Bluent.UI.csproj -c Release --no-restore -warnaserror
dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj -c Debug --no-restore -warnaserror
dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj -c Release --no-restore -warnaserror
~~~

The current four-cell local real-browser baseline is **26/26 per cell (104/104 total)**. This covers browser AX, native Tab/Arrow/Space, disabled skipping, pointer binding, EditContext and native form submission, RTL, forced-colors emulation and 320px reflow. Forced-colors emulation is not native Windows Contrast Themes. A native Windows 11 Pro 28000 High Contrast White smoke check and Windows UIA tree inspection are now recorded in `docs/v3/quality/evidence/BLUENT-RADIOGROUP-WINDOWS-NATIVE.md` with PNG evidence; original OS flags were restored. Narrator was launched, but spoken output was not independently verified. Chromium AX/UIA tree semantics are not spoken screen-reader acceptance. See JSON/PNG reports under docs/v3/quality/evidence/.

## Ownership and finish rule

#418 still owns the global token vocabulary/brand foundation; this component only consumes already-shipped source roles. #421's wider 66-family pilot ledger remains In progress even though the independent Component Lab platform prerequisite was accepted. Keep the DRAFT Penpot status honest and keep this task In progress until visual/API review, exact-head hosted CI and the remaining acceptance gates are resolved. A task PR merges into bluent-v3 only after review; no merge to stable Dev, no v2 asset change, no package publication and no deployment.