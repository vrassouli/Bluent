# SelectField — v3 implementation record (#437)

> **In progress · unreleased v3 task-branch implementation.** This page records the source-backed state on `v3/issue-437-selectfield`; it is not a released Bluent API or an instruction to upgrade a 2.x application. The existing 2.x consumer reference remains authoritative for released packages.

## Identity and maturity

| Field | Verified value |
| --- | --- |
| Family | SelectField (native HTML select) |
| Issue / branch | [#437](https://github.com/vrassouli/Bluent/issues/437) · `v3/issue-437-selectfield` → `bluent-v3` · [Draft PR #568](https://github.com/vrassouli/Bluent/pull/568) |
| Package / namespace | `Bluent.UI` · `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor` and `SelectField.razor.cs` |
| Direct parameters | `ChildContent : RenderFragment?` only |
| Interaction boundary | Browser-native `<select>`; browser and operating system own the option popup and native multi-select interaction |
| Owned design | Bluent v3 Design System Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 60 (`28143240-43dc-80cc-8008-f84a2fd6a22c`) |
| Design review state | DRAFT · REVIEW REQUIRED; no maintainer approval is claimed |

Penpot boards on page 60:

- Anatomy and visual states: `28143240-43dc-80cc-8008-f84a3bd17206`
- Single vs. multiple selection contract: `28143240-43dc-80cc-8008-f84aa30a32ea`
- Themes, RTL and accessibility matrix: `28143240-43dc-80cc-8008-f84aa52eb253`

See the [design/API decision record](../design/SELECTFIELD-DESIGN-AND-API-CONTRACT.md) for the rationale and explicit boundaries.

## Source and public API

The component inherits `BluentFieldComponentBase<TValue>`, which provides the shared `InputBase<TValue>` binding and validation contract.

| Member | Origin | Contract |
| --- | --- | --- |
| `ChildContent` | SelectField direct parameter | Native `<option>` and `<optgroup>` content |
| `Value`, `ValueChanged`, `ValueExpression` | `InputBase<TValue>` | Typed scalar or array binding |
| `EditContext` / validation state | `InputBase<TValue>` | Field change notification and validation CSS/ARIA state |
| `StartAddon`, `EndAddon` | Shared Bluent field base | Sibling content outside the native select |
| `Size` (`FieldSize`) | Shared Bluent field base | `Small`, `Medium`, `Large` |
| `BindValueEvent` | Shared Bluent field base | Event name used for binding; defaults to `onchange` |
| `Class`, `Style`, unmatched attributes | Shared Bluent bases | Consumer classes/styles and native HTML attributes |

There is no SelectField-specific `Label`, `Appearance`, `HelperText`, `ErrorMessage`, clear button, search box, custom popup or chip API. The consumer composes the accessible label and supporting/validation text. No new public parameter or enum is introduced by #437.

When option markup is combined with named addon slots, use the explicit `ChildContent` slot so the Razor child-content boundary is unambiguous:

```razor
<SelectField TValue="string" @bind-Value="_department" id="department">
    <StartAddon><span aria-hidden="true">ORG</span></StartAddon>
    <EndAddon><span aria-hidden="true">v3</span></EndAddon>
    <ChildContent>
        <option value="">Choose a department</option>
        <option value="Engineering">Engineering</option>
    </ChildContent>
</SelectField>
```

## Native selection and typed values

The shape of `TValue` selects the native control model:

| `TValue` | Rendered behavior | Verified conversion |
| --- | --- | --- |
| `string`, `int` and other scalar `InputBase` values | Native single-select | `CurrentValueAsString` and selectable-value parsing |
| `string[]` | Native `<select multiple>` listbox | Framework array binder |
| `int[]` | Native `<select multiple>` listbox | Framework array binder under current culture |
| `bool[]` | Native `<select multiple>` listbox | Element-wise boolean parsing; option values are lowercase `true` / `false` |

An array `TValue` renders the native `multiple` attribute. Its change handler receives the selected option strings and converts them to the typed array before assigning `CurrentValue`. Boolean arrays use an explicit typed path because the framework's general array conversion path does not correctly convert the native string-array payload to `bool[]`. Scalar `bool` and `bool?` values retain lowercase native option formatting.

The source selects multiple mode for array `TValue`; however, #437's runtime evidence specifically covers `string[]`, `int[]` and `bool[]`. Do not infer that every arbitrary array element type has been runtime-verified.

## Events, forms and accessibility

- Scalar and array binding both honor the inherited `BindValueEvent`. The default `onchange` and explicit `oninput` paths are both exercised in the browser matrix.
- The native select owns keyboard navigation, focus, disabled behavior, option selection and form submission. The component does not replace these interactions with JavaScript.
- The single-select control is exposed by Chromium's accessibility tree as a named native `combobox`; the multiple-select control is exposed as a native `listbox`.
- The consumer supplies an associated `Label`/HTML label or an accessible name with `aria-label` / `aria-labelledby`. Help and readable validation text remain consumer-rendered and are associated through `aria-describedby`.
- `EditContext` validation applies `aria-invalid` to the native select when the field has validation messages. The component does not synthesize validation prose.
- Native `disabled`, `required`, `id`, `name` and other supported HTML attributes stay on the select. The `name` attribute follows the inherited `NameAttributeValue` contract.

A native multi-select is a listbox, not a custom dropdown with checkbox rows or removable chips. Modifier-key behavior (such as Ctrl/Command and Shift selection) follows the browser/OS conventions and may differ across platforms.

## Visual, theme and layout boundary

SelectField uses the shared `bui-field` shell and the existing field styles in `src/Bluent.UI/Styles/Components/_field.scss`; there is no SelectField-only stylesheet or JavaScript module. The browser/OS popup is not a Bluent-owned visual surface and cannot be made pixel-identical across platforms by styling the closed control.

The implementation uses existing integrated field/theme roles only. It does not consume preview-only #418 aliases or treat the open #418 proposal as production token approval. Direction follows the consumer's actual `dir` context; the browser probe verifies RTL rendering and no horizontal document overflow at a 320px viewport.

## Runnable demos

| Render mode | Route | Source |
| --- | --- | --- |
| Blazor WebAssembly | `/components/select-fields` | `src/Bluent.UI.Demo.Pages/Pages/Components/SelectFields.razor` |
| Production-published InteractiveServer | `/compatibility/select-fields-server` | `src/Bluent.UI.Demo.SSR/Components/Pages/SelectFieldInteractiveServerProbe.razor` |

The showcase includes scalar string/int values, `string[]`, `int[]`, `bool[]`, `onchange`, `oninput`, all three field sizes, addons, native disabled behavior, EditForm validation, RTL and consumer markup.

## Validation ledger

| Gate | Reproducible command / evidence | Result |
| --- | --- | --- |
| Focused HtmlRenderer tests | `dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj -c Release --no-restore --filter FullyQualifiedName~SelectFieldRenderSemanticsTests` | 12/12 passed |
| Chrome / WebAssembly | `BLUENT-SELECTFIELD-Chrome-WebAssembly.json` | 19/19 passed |
| Edge / WebAssembly | `BLUENT-SELECTFIELD-Edge-WebAssembly.json` | 19/19 passed |
| Chrome / InteractiveServer | `BLUENT-SELECTFIELD-Chrome-Server.json` | 19/19 passed |
| Edge / InteractiveServer | `BLUENT-SELECTFIELD-Edge-Server.json` | 19/19 passed |
| Four-cell browser total | Chrome/Edge × WebAssembly/InteractiveServer | **76/76 passed**, no recorded browser console errors, exceptions or unexpected HTTP failures |

Each browser cell retains an initial, final and 320px screenshot beside its JSON report under `docs/v3/quality/evidence/`. The PowerShell runner uses a unique run-owned browser profile and verifies its cleanup.

Draft PR #568 is open against `bluent-v3`. Exact-head hosted GitHub Actions have not yet reported results; local browser evidence does not imply hosted CI completion.

## 2.x → v3 compatibility

The public component parameter and inherited binding contract are unchanged. The implementation corrects two previously incomplete behaviors: array-valued `TValue` now converts the selected `string[]` payload to the intended typed array, and `BindValueEvent` is now used by the registered scalar and array event handlers. These are behavior corrections, not a new custom-select API.

The closed control remains a native select; the array case intentionally appears as the browser's native multiple listbox. Consumers should re-check CSS/DOM selectors if they depended on previous rendered option or addon structure. Use the shared addon slots and explicit `ChildContent` composition shown above. Existing 2.x source, documentation, packages and releases are untouched.

## Acceptance boundary and known gaps

This record is a task-branch implementation checkpoint, not a released component. The Penpot boards remain DRAFT and require genuine design/reviewer acceptance. The local runtime matrix covers Windows Chrome/Edge in WebAssembly and published InteractiveServer; it does not certify Firefox, Safari, macOS, mobile browsers, native Windows Contrast Themes, or spoken Narrator/NVDA/VoiceOver output. Native popup appearance and AT announcements remain browser/OS-specific acceptance work.

#418 remains the owner of global token vocabulary and alias approval. #421's accepted Component Lab platform slice does not mean all 66 inventory families are implemented or accepted.
