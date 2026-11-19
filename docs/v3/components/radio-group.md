# RadioGroup — v3 implementation record (#436)

> **Development-only, unreleased v3 task branch.** This record describes source on v3/issue-436-radiogroup; it does not change the 2.x consumer API or imply a stable NuGet release. GitHub Project #5 status: **Review**.

## Identity and maturity

| Field | Value |
|---|---|
| Family / issue | RadioGroup / [#436](https://github.com/vrassouli/Bluent/issues/436) |
| Task branch / target | v3/issue-436-radiogroup → bluent-v3 |
| Package / namespace | Bluent.UI / Bluent.UI.Components |
| Source | src/Bluent.UI/Components/RadioGroupComponent/ |
| Demo | /components/radios; published InteractiveServer QA route /compatibility/radios-server |
| Design | Owned Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000, Page 59 |
| Design review | Three editable Page 59 boards received delegated AI technical review on 2026-11-19 and are visibly marked AI REVIEWED. This records the user's explicit delegation; it is not represented as a human maintainer review. |
| Public API maturity | Source-backed task-branch implementation; not released |

## Source and public API

### RadioGroup<TValue>

RadioGroup<TValue> inherits BluentInputComponentBase<TValue?>. Its direct public parameters remain unchanged:

| Parameter | Type | Default | Contract |
|---|---|---|---|
| ChildContent | RenderFragment? | null | Nested typed Radio<TValue> options |
| Label | string? | null | Visible group legend when non-empty |
| ItemsLabelPosition | LabelPosition | After | Existing Before / After option-label placement |
| Orientation | Orientation | Horizontal | Existing horizontal / vertical layout |

The inherited InputBase contract provides Value, ValueChanged, ValueExpression, EditContext and normal Blazor @bind-Value behavior. Common inherited component attributes such as Id, Class, Style and unmatched attributes remain available. No new public parameter, enum, service or JavaScript API has been introduced.

The native group name follows this precedence:

1. An explicit unmatched name attribute on the group is forwarded to each nested radio.
2. A bound group uses the inherited InputBase.NameAttributeValue associated with its ValueExpression.
3. An unbound group uses its generated component Id, keeping separate groups independent.

### Radio<TValue>

| Member | Type | Default | Contract |
|---|---|---|---|
| Value | TValue | required | Typed option value; rendered as the native input value |
| Label | string? | null | Visible option label, associated with the native input |

Radio<TValue> still requires a cascading RadioGroup<TValue> parent. It inherits common component identity/styling and unmatched input attributes. Component-owned native attributes (type, name, value, checked and generated id) cannot be overridden by conflicting unmatched attributes. Per-option tabindex overrides are rejected so native radio keyboard behavior remains intact. Non-conflicting aria-*, data-*, title and disabled attributes are preserved.

## Deliberate semantics and Fluent boundary

The implementation chooses native HTML fieldset / legend grouping rather than recreating group semantics with a div[role=radiogroup]. This is the Bluent-specific markup decision for the v3 implementation: the child controls remain native radio inputs, the browser owns grouping through the shared native name, and the component remains a typed Blazor InputBase.

With a non-empty Label, the group renders a native fieldset with an associated legend. When the visible legend is omitted, the consumer must supply aria-label or aria-labelledby on RadioGroup. Each option must also have an accessible name, normally through Radio.Label or a suitable native accessible-name attribute on that option.

Every nested option renders a native input[type=radio] with:
- the same name as its sibling options;
- its own native value;
- a stable generated id and associated labels;
- a 16px visual indicator implemented as a second native `<label for="…">` hit target with `aria-hidden="true"`, so clicking the indicator activates the input even when the text caption is positioned before it;
- a separate `.option-label` native label that supplies the visible/readable option name;
- native disabled state when disabled at group or option level.

No custom JavaScript keyboard layer is used. The real-browser matrix verifies that the browser keeps the selected radio as the single Tab stop, enters an unselected group at its first enabled option, moves with Arrow keys, wraps within that group, skips disabled options, and selects with Space. Two adjacent groups that repeat the same values remain independent because their names differ.

## Binding, validation and form behavior

Native change updates the parent through InputBase.CurrentValue, preserving typed ValueChanged and EditContext behavior. The selected radio contributes its actual option value to native form submission; an unchecked radio contributes no form value.

The group subscribes to the active EditContext.OnValidationStateChanged event and removes that subscription when the context changes or the group is disposed. This makes each child rerender when validation changes, including transitions from valid to invalid that do not also change the selected value. When the group field has validation messages, each native option receives aria-invalid="true".

The component does not add a Required parameter or invent validation text. Consumers own the validation message and should associate it with the group using aria-describedby on RadioGroup.

## Layout, visual states and tokens

- Orientation.Horizontal preserves the existing horizontal option flow; Orientation.Vertical stacks options.
- ItemsLabelPosition.Before and After preserve the existing label placement contract.
- Native inputs expose a 24 × 24 CSS-pixel hit target; the visual indicator remains 16 × 16.
- Enabled, checked, hover, pressed and :focus-visible states are styled. Disabled and selected-disabled options are represented by native checked/disabled state.
- RTL uses logical CSS positioning and inherits the host dir value.
- Forced-colors styling uses system color keywords.

Only already-shipped source theme roles are consumed. The implementation does not consume preview-only #418 semantic/component aliases and does not claim that #418's broader token foundation is complete or approved.

## Demo and migration example

The live showcase at /components/radios demonstrates horizontal and vertical groups, Before label placement, enum values, separate same-option groups, disabled options, a group without a visible legend but with an accessible name, RTL/Persian content, an initially unselected group, and an EditForm validation/submission scenario.

~~~razor
@using Bluent.UI.Components

<RadioGroup @bind-Value="_deliveryWindow" Label="Delivery window">
    <Radio Value="@("Morning")" Label="Morning" />
    <Radio Value="@("Afternoon")" Label="Afternoon" />
    <Radio Value="@("Evening")" Label="Evening" />
</RadioGroup>

@code {
    private string _deliveryWindow = "Morning";
}
~~~

This is a runnable v3 task-branch example, not an instruction to install an unreleased package. For current released consumers, continue to use the existing [2.x RadioGroup reference](../../components/radio-group.md).

## Validation ledger

| Evidence | Environment / command | Result |
|---|---|---|
| Focused renderer regression | dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj -c Release --no-restore --filter FullyQualifiedName~RadioGroupRenderSemanticsTests | 9/9 passed |
| Library build | dotnet build src/Bluent.UI/Bluent.UI.csproj -c Release --no-restore -warnaserror | 0 warnings / 0 errors |
| WASM demo build | dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj -c Debug --no-restore --nologo --verbosity quiet | 0 warnings / 0 errors |
| InteractiveServer build | dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj -c Release --no-restore -warnaserror | 0 warnings / 0 errors |
| Chrome / WebAssembly | scripts/quality/run_v3_radiogroup.ps1 -Mode WebAssembly -Browser Chrome | 26/26; zero runtime signals |
| Edge / WebAssembly | scripts/quality/run_v3_radiogroup.ps1 -Mode WebAssembly -Browser Edge | 26/26; zero runtime signals |
| Chrome / published InteractiveServer | scripts/quality/run_v3_radiogroup.ps1 -Mode Server -Browser Chrome | 26/26; zero runtime signals |
| Edge / published InteractiveServer | scripts/quality/run_v3_radiogroup.ps1 -Mode Server -Browser Edge | 26/26; zero runtime signals |

Aggregate local browser evidence: **104/104 assertions**. Each browser cell captured initial/320px/1280px PNGs and a JSON report under docs/v3/quality/evidence/. Assertions include the actual Chromium accessibility tree, native Tab/Arrow/Space/pointer input, independent group names, native form FormData, EditContext invalidation, RTL, dark-theme CSS computation, forced-colors emulation and 320px no-overflow/hit-target checks. The retained browser viewport evidence is 320px and 1280px; 390px, 768px and 1440px remain Penpot planning targets, not claims of measured browser coverage.

Native Windows evidence (Dev01, Windows 11 Pro build 28000): the real `High Contrast White` scheme was enabled through `SystemParametersInfo(SPI_SETHIGHCONTRAST)`, the live RadioGroup page was captured in that OS mode, and the Windows UI Automation tree exposed named `group` and `radiobutton` controls with option names, selected state and disabled state. The screenshot is retained at `docs/v3/quality/evidence/BLUENT-RADIOGROUP-WINDOWS-HIGH-CONTRAST.png`; the native setting was restored to its original disabled state (flags 126) immediately after capture. This is a native OS visual/UIA smoke check, not complete Windows High Contrast Themes conformance certification. Narrator was launched, but spoken output could not be independently audited; Narrator/NVDA/VoiceOver spoken acceptance remains unverified and is not claimed.

On 2026-11-19 the user explicitly delegated the remaining visual/API review to the assistant. The three editable Penpot boards were reviewed against source, exported and visually inspected, their inaccurate label/attribute/viewport annotations were corrected, and their status badges were changed from the historical DRAFT state to **AI REVIEWED**. The review verifies the documented anatomy, keyboard contract, native-name precedence, attribute ownership, RTL coverage and the actual 320px/1280px evidence. It does not claim a human maintainer review, complete pixel-parity certification, full WCAG certification or spoken-screen-reader acceptance.

## 2.x → v3 migration boundary

No public parameter, enum, callback or binding rename is proposed by #436. The new native group name and option value, fieldset / legend, group keyboard behavior, validation rerendering and focus styling are v3 implementation improvements. They alter rendered DOM and can affect consumers that target the previous markup or internal CSS selectors. The existing 2.x source, styles and consumer documentation remain unchanged.

See [migration impact M24](../design/MIGRATION-IMPACT-LEDGER.md) and the separate [design/API decision record](../design/RADIOGROUP-DESIGN-AND-API-CONTRACT.md).

## Acceptance boundary

The component is **ready for Review** on [PR #566](https://github.com/vrassouli/Bluent/pull/566), targeting `bluent-v3`. The exact-head RadioGroup source/evidence contract and all four hosted browser cells pass. The Component Lab retry also passed all four browser/render-mode cells. Documentation, Skill, public API census and baseline quality workflows pass. The two remaining red workflow families are outside #436: TextField assertions in #432 and Button menu/Tab focus behavior in #428; they are recorded as independent blockers in the PR rather than misattributed to RadioGroup. Native High Contrast/UIA smoke evidence is recorded; spoken Narrator/NVDA/VoiceOver output remains unverified. The three Page 59 boards are AI REVIEWED following the user's explicit delegation, with the historical DRAFT transition and review scope recorded above. #418 token ownership and the broader #421 ledger remain separate. This task is not Done until PR #566 is accepted and merged into `bluent-v3`; no merge to stable Dev, no 2.x changes, package publication or deployment is included.