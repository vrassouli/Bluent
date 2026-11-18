# RadioGroup — v3 implementation record (#436)

> **Development-only, unreleased v3 task branch.** This record describes source on v3/issue-436-radiogroup; it does not change the 2.x consumer API or imply a stable NuGet release. GitHub Project #5 status: **In progress**.

## Identity and maturity

| Field | Value |
|---|---|
| Family / issue | RadioGroup / [#436](https://github.com/vrassouli/Bluent/issues/436) |
| Task branch / target | v3/issue-436-radiogroup → bluent-v3 |
| Package / namespace | Bluent.UI / Bluent.UI.Components |
| Source | src/Bluent.UI/Components/RadioGroupComponent/ |
| Demo | /components/radios; published InteractiveServer QA route /compatibility/radios-server |
| Design | Owned Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000, Page 59 |
| Design review | Three editable boards exist but remain visibly DRAFT. No maintainer visual sign-off is claimed. |
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

Radio<TValue> still requires a cascading RadioGroup<TValue> parent. It inherits common component identity/styling and unmatched input attributes. Component-owned native attributes (type, name, value, checked, generated id and tabindex) cannot be overridden by conflicting unmatched attributes. Non-conflicting aria-*, data-*, title and disabled attributes are preserved.

## Deliberate semantics and Fluent boundary

The implementation chooses native HTML fieldset / legend grouping rather than recreating group semantics with a div[role=radiogroup]. This is the Bluent-specific markup decision for the v3 implementation: the child controls remain native radio inputs, the browser owns grouping through the shared native name, and the component remains a typed Blazor InputBase.

With a non-empty Label, the group renders a native fieldset with an associated legend. When the visible legend is omitted, the consumer must supply aria-label or aria-labelledby on RadioGroup. Each option must also have an accessible name, normally through Radio.Label or a suitable native accessible-name attribute on that option.

Every nested option renders a native input[type=radio] with:
- the same name as its sibling options;
- its own native value;
- a stable generated id and associated label;
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

Aggregate local browser evidence: **104/104 assertions**. Each browser cell also captured initial/320px/1280px PNGs and a JSON report under docs/v3/quality/evidence/. Assertions include the actual Chromium accessibility tree, native Tab/Arrow/Space/pointer input, independent group names, native form FormData, EditContext invalidation, RTL, dark-theme CSS computation, forced-colors emulation and 320px no-overflow/hit-target checks.

Evidence boundaries: forced-colors is browser emulation, not native Windows Contrast Themes. Dark mode was checked through the host theme attribute and computed styles, not every brand/mode. Native Narrator/NVDA/VoiceOver speech, native OS contrast, and an independent Penpot reviewer sign-off have **not** been completed. Screenshots are retained evidence, not a claim of approved pixel parity.

## 2.x → v3 migration boundary

No public parameter, enum, callback or binding rename is proposed by #436. The new native group name and option value, fieldset / legend, group keyboard behavior, validation rerendering and focus styling are v3 implementation improvements. They alter rendered DOM and can affect consumers that target the previous markup or internal CSS selectors. The existing 2.x source, styles and consumer documentation remain unchanged.

See [migration impact M24](../design/MIGRATION-IMPACT-LEDGER.md) and the separate [design/API decision record](../design/RADIOGROUP-DESIGN-AND-API-CONTRACT.md).

## Acceptance boundary

The component is still **In progress**. The three editable Penpot Page 59 boards — anatomy/API (0125a79e-69b2-807f-8008-f726bd61b423), keyboard/accessibility (0125a79e-69b2-807f-8008-f726c1464f5d), and RTL/responsive coverage (0125a79e-69b2-807f-8008-f726c665a5cf) — remain DRAFT pending maintainer visual review. Exact-head hosted CI, native OS contrast and assistive-technology acceptance remain separate gates. This task does not close #418 or #421, approve preview tokens, merge into stable Dev, publish NuGet or deploy.