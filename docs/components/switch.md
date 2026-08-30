# Switch

`Switch` is a Boolean on/off control built on Bluent's `Checkbox<bool>` behavior and styled as a switch.

## When to use

Use `Switch` when a Boolean setting represents an immediately applied enabled/disabled state. Use `Checkbox` for independent form selections or when nullable/indeterminate state matters.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for normal Bluent registration and packaged styles.

## Minimal example

```razor
<Switch @bind-Value="_enabled"
        Label="Enabled"
        UncheckedLabel="Disabled" />
```

The Fields showcase compiles checked/unchecked labels, disabled states, and `LabelPosition.Before`. This page is source/demo verified; no new browser run was performed.

## Parameters

`Switch` inherits `Checkbox<bool>` and therefore binds only a non-nullable Boolean value.

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<bool>` | standard Blazor defaults | No | Standard Boolean binding/validation contract. |
| `Label` | `string?` | `null` | No | Label shown while the switch is on and fallback label while off. |
| `UncheckedLabel` | `string?` | `null` | No | Label shown while the switch is off. |
| `Required` | `string?` | `null` | No | Visible marker appended to the rendered label; does not create validation by itself. |
| `LabelPosition` | `LabelPosition` | `After` | No | Places the label after or before the switch. |
| `Class` / `Style` | inherited | `null` | No | Application styling hooks. |
| Unmatched attributes | inherited | `null` | No | Applied to the native checkbox input; supports `disabled`, `aria-*`, `id`, etc. |

Checkbox-only nullable/indeterminate behavior is not available because `Switch` fixes the generic base to `bool`.

## Events and binding

```razor
<Switch @bind-Value="_notificationsEnabled" />
```

User interaction is handled by the inherited Checkbox change/toggle path and updates the Boolean `Value` through the standard `InputBase<bool>` contract.

## Child content and composition

There is no child-content slot. Supply labels through `Label` and `UncheckedLabel`.

## Services and containers

No Switch-specific service, container, or JavaScript dependency is present. Normal Bluent UI setup and styles apply.

## Styling and theming

Switch renders a native checkbox input plus a visual indicator and inherits Checkbox label behavior. `LabelPosition.Before` adds the switch-specific before-label visual state. Use public parameters rather than internal CSS selectors as compatibility contracts.

## Localization and RTL

Switch has no built-in localized strings; application code supplies labels. Direction follows the component styles/document direction inherited from Checkbox behavior. Switch-specific RTL visual verification is not recorded.

## Accessibility and keyboard interaction

The underlying interactive element is a native `<input type="checkbox">`, with a `<label for="...">` when label text is present. The indicator SVG is `aria-hidden`. Native checkbox focus/change/Space-key semantics therefore form the base behavior, but switch-specific assistive-technology semantics (for example a `switch` ARIA role) are not added by current source and must not be claimed.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Fields showcase compiles; Switch-specific runtime evidence not recorded. |
| Interactive Server | Unverified | Binding requires interactivity. |
| Interactive WebAssembly | Unverified | Binding requires interactivity. |
| Interactive Auto | Unverified | Binding requires interactivity. |
| Static SSR | Limited | Initial markup can render; user interaction/two-way binding requires interactivity. |

## JavaScript and static assets

No Switch-specific JavaScript or manual script tag is required. Include standard Bluent theme/component CSS.

## Common mistakes

### Using Switch for nullable state

`Switch` inherits `Checkbox<bool>`, not `Checkbox<bool?>`. Use `Checkbox<bool?>` when a programmatic indeterminate/null state is required.

### Assuming Required enforces validation

`Required` is rendered marker text only. Add normal Blazor validation rules for business validation.

### Assuming ARIA switch semantics are automatically present

Current source uses a native checkbox input and does not add `role="switch"`. Document only the semantics actually rendered.

## Known limitations

- No nullable/indeterminate state.
- No component-defined `role="switch"` in current markup.
- Switch-specific RTL, keyboard, and assistive-technology runtime verification is not recorded.

## Related components

- `Checkbox<TValue>`: `checkbox.md`
- `RadioGroup`: see [component inventory](inventory.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/SwitchComponent/Switch.razor`
- Component logic: `src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs`
- Base component: `src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor(.cs)`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Fields.razor`
- Source verified against current PR branch `Dev` lineage
- Verification date: 2026-08-29
