# RadioGroup

`RadioGroup<TValue>` binds one selected value from a set of nested `Radio<TValue>` options.

## When to use

Use `RadioGroup<TValue>` when the user must choose exactly one value from a small visible set of mutually exclusive options. Use `SelectField`/dropdown components for longer option lists and `Checkbox`/`Switch` for independent Boolean choices.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for standard Bluent setup and styles.

## Minimal example

```razor
<RadioGroup @bind-Value="_size" Label="Size">
    <Radio Value="Small" Label="Small" />
    <Radio Value="Medium" Label="Medium" />
    <Radio Value="Large" Label="Large" />
</RadioGroup>
```

The API and composition are source verified. This page does not claim a new browser/runtime pass.

## Parameters

### `RadioGroup<TValue>`

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | No | Nested `Radio<TValue>` options. |
| `Label` | `string?` | `null` | No | Visible group label text. |
| `ItemsLabelPosition` | `LabelPosition` | `After` | No | Controls option-label placement in nested radios. |
| `Orientation` | `Orientation` | `Horizontal` | No | Horizontal or vertical item layout. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<TValue?>` | standard Blazor defaults | No | Standard group binding/validation contract. |
| `Class` / `Style` | inherited | `null` | No | Application styling hooks. |

### `Radio<TValue>`

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Value` | `TValue` | none | Yes (`EditorRequired`) | Value selected when this radio changes to on. |
| `Label` | `string?` | `null` | No | Visible option label. |
| Unmatched attributes | inherited | `null` | No | Applied to the native radio input except `class`. |

Each `Radio<TValue>` requires a cascading `RadioGroup<TValue>` parent; initialization throws when it is not nested in one.

## Events and binding

```razor
<RadioGroup @bind-Value="_priority">
    <Radio Value="1" Label="Low" />
    <Radio Value="2" Label="Normal" />
    <Radio Value="3" Label="High" />
</RadioGroup>
```

A nested radio handles native `change`; when its event value is `on`, it calls the parent group's internal `SetValue`. The group updates `CurrentValue` and notifies nested radios through an internal event so their checked state rerenders. The consumer-facing event contract is the standard `ValueChanged`/`@bind-Value` inherited from `InputBase`.

## Child content and composition

`RadioGroup<TValue>` provides itself as a fixed cascading value to its `ChildContent`. `Radio<TValue>` depends on that cascading parent and should not be used standalone.

## Services and containers

No RadioGroup-specific service, JavaScript module, or `<Containers />` dependency is present.

## Styling and theming

Use the standard Bluent theme/component styles. `Orientation.Vertical` changes the group layout, and `ItemsLabelPosition` affects nested radio label placement. Internal CSS selectors are implementation details.

## Localization and RTL

The components contain no built-in localized strings; the application supplies group/option labels. RadioGroup-specific RTL layout has not been runtime verified here.

## Accessibility and keyboard interaction

Each option renders a native `<input type="radio">` and label(s) associated through `for`/`id`, so native radio focus/activation semantics apply to each option. Current `RadioGroup` markup renders its group label as a plain `<label>` but does not render `fieldset`/`legend`, `role="radiogroup"`, or automatically assign a shared native `name` to nested inputs. Therefore this page does not claim full native radio-group semantics or arrow-key group behavior beyond what the browser provides for the rendered inputs/attributes. Applications needing stronger semantics should verify the current runtime/accessibility path before adding guidance.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Source verified; no new RadioGroup-specific browser run recorded. |
| Interactive Server | Unverified | Binding requires interactivity. |
| Interactive WebAssembly | Unverified | Binding requires interactivity. |
| Interactive Auto | Unverified | Binding requires interactivity. |
| Static SSR | Limited | Initial markup can render; selection/binding requires interactivity. |

## JavaScript and static assets

No component-specific JavaScript is used. Include standard Bluent theme/component CSS.

## Common mistakes

### Using Radio outside RadioGroup

`Radio<TValue>` requires a cascading `RadioGroup<TValue>` and throws during initialization otherwise.

### Mixing incompatible TValue types

Keep the parent group and all child radios on the same `TValue`; the cascading parent is strongly typed.

### Assuming complete radiogroup accessibility semantics

Current source does not emit a `radiogroup` role/fieldset/legend or shared name automatically. Verify accessibility requirements against rendered/runtime behavior rather than assuming them.

## Known limitations

- Group-level native/ARIA radiogroup semantics are not established by current markup.
- A shared native radio `name` is not generated by the component source shown here.
- Keyboard, RTL, and assistive-technology group behavior remains runtime-unverified.

## Related components

- `Checkbox<TValue>`: `checkbox.md`
- `Switch`: `switch.md`
- `SelectField<TValue>`: `select-field.md`

## Source and verification

- Group markup: `src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor`
- Group logic: `src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs`
- Option markup: `src/Bluent.UI/Components/RadioGroupComponent/Radio.razor`
- Option logic: `src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs`
- Source verified against current PR branch `Dev` lineage
- Verification date: 2026-08-29
