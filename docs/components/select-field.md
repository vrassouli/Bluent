# SelectField

`SelectField<TValue>` wraps a native `<select>` in Bluent field styling and participates in Blazor `InputBase<TValue>` binding and validation.

## When to use

Use `SelectField<TValue>` for a straightforward native select whose options are known as Razor content. Use richer Bluent dropdown/list components when you need search, virtualization, custom option presentation, or more advanced selection workflows.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for normal Bluent registration and styles.

## Minimal example

```razor
<SelectField @bind-Value="_color">
    <option value="Red">Red</option>
    <option value="Green">Green</option>
    <option value="Blue">Blue</option>
</SelectField>
```

The repository Fields showcase compiles this single-selection pattern. This page is source verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | No | Native option/optgroup content rendered inside `<select>`. |
| `StartAddon` / `EndAddon` | `RenderFragment?` | `null` | No | Field addon slots. |
| `Size` | `FieldSize` | `Medium` | No | Field size. |
| `BindValueEvent` | `string` | `"onchange"` | No | Inherited field parameter, but current SelectField markup wires its own `@onchange` handler rather than using this parameter. Do not assume changing it alters SelectField's event. |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<TValue>` | standard Blazor defaults | No | Standard Blazor binding/validation contract. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Passed to the native `<select>` except `class`. |

If `TValue` is an array type, the constructor marks the native select as `multiple`; otherwise it is single-select.

## Events and binding

Standard binding is supported:

```razor
<SelectField @bind-Value="_color">...</SelectField>
```

The component handles native `change` itself. For single values it updates `CurrentValueAsString`; for array `TValue` it attempts to convert `ChangeEventArgs.Value` to the array type. Multiple-selection behavior is source observed but is not demonstrated or browser verified by the current Fields showcase, so treat it as requiring runtime verification before relying on it in production guidance.

## Child content and composition

Place native `<option>` and, where appropriate, `<optgroup>` markup in `ChildContent`. `StartAddon` and `EndAddon` wrap the select with Bluent field addons.

## Services and containers

No SelectField-specific service or container is required. It inherits the shared Bluent input base.

## Styling and theming

Use standard Bluent theme/component styles. `Size` controls field sizing. Native option rendering remains browser/platform dependent.

## Localization and RTL

SelectField contains no built-in localized strings; option labels come from application content. Native select direction and option presentation follow browser/document behavior and supplied attributes. SelectField-specific RTL verification is not recorded.

## Accessibility and keyboard interaction

Because the interactive element is a native `<select>`, native select focus and keyboard behavior apply. Associate it with `Label`/`ForExpression` or another accessible name. Disabled and `aria-*` attributes can be passed through unmatched attributes. Multiple-select accessibility/runtime behavior has not been separately verified for this page.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Single-select showcase compiles; no new browser run recorded. |
| Interactive Server | Unverified | Binding requires interactivity. |
| Interactive WebAssembly | Unverified | Binding requires interactivity. |
| Interactive Auto | Unverified | Binding requires interactivity. |
| Static SSR | Limited | Initial native select/options render; Blazor value updates require interactivity. |

## JavaScript and static assets

No component-specific JavaScript or manual script tag is required. Include standard Bluent theme/component CSS.

## Common mistakes

### Expecting BindValueEvent to change SelectField to oninput

Current SelectField markup explicitly handles `@onchange`; the inherited `BindValueEvent` is not used by this component's select element.

### Assuming array/multiple selection is fully verified

Array `TValue` enables `multiple` in source, but the current showcase only demonstrates single selection. Runtime-verify the exact browser/event conversion behavior before publishing a multiple-select recipe.

### Putting Bluent menu components inside SelectField

`ChildContent` is native select content. Use native options, or choose a richer Bluent dropdown component for custom interactive option markup.

## Known limitations

- `BindValueEvent` does not control the current select event wiring.
- Multiple-selection support is source-observed but lacks current demo/runtime evidence.
- Native select option styling varies by browser/platform.

## Related components

- `TextField`: `text-field.md`
- `DropdownSelect` and `DropdownList`: see [component inventory](inventory.md)
- [Form validation task](../examples/tasks/form-validation.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor`
- Component logic: `src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs`
- Field base: `src/Bluent.UI/Components/BluentFieldComponentBase.cs`
- Compiled single-select showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
