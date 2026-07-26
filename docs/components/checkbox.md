# Checkbox

`Checkbox<TValue>` lets a user switch a Boolean value between checked and unchecked states and can display a programmatically supplied nullable value as indeterminate.

## When to use

Use `Checkbox` when:

- a form needs one independent Boolean choice;
- a user can select multiple independent options from a set;
- an application needs to display a `bool?` value whose current state may be unknown.

Use `RadioGroup` when exactly one option must be selected from a mutually exclusive set. Use `Switch` when the choice represents an immediately applied on/off setting rather than form selection.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) to call `AddBluentUI()` and include the packaged theme and component stylesheets. `Checkbox` does not use an overlay container.

## Minimal example

```razor
<Checkbox @bind-Value="_sendUpdates"
          Label="Send product and maintenance updates" />

<p>Updates: @(_sendUpdates ? "enabled" : "disabled")</p>

@code {
    private bool _sendUpdates;
}
```

This binding form is compiled in the shared Checkbox demo and in the customer-profile scenario. The repository's standalone WebAssembly compatibility evidence also exercised Checkbox binding; the component-specific behavior has not been rerun in every render mode.

## Parameters

`TValue` must be `bool` or `bool?`. Constructing the component with another type throws `InvalidOperationException`.

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Value` | `TValue` | `default` | No | Current checked value inherited from Blazor `InputBase<TValue>`. `null` is supported only when `TValue` is `bool?`. |
| `ValueChanged` | `EventCallback<TValue>` | Empty callback | No | Receives values produced by user interaction and supports `@bind-Value`. |
| `ValueExpression` | `Expression<Func<TValue>>?` | Generated fallback outside a form | No | Identifies the bound field for Blazor forms and validation. |
| `DisplayName` | `string?` | `null` | No | Inherited Blazor input metadata used by validation infrastructure. |
| `Label` | `string?` | `null` | No | Label used for the checked state and as the fallback label for unchecked and indeterminate states. |
| `UncheckedLabel` | `string?` | `null` | No | Replaces `Label` while the value is `false`. |
| `IndeterminateLabel` | `string?` | `null` | No | Replaces `Label` while a nullable value is `null`. |
| `Required` | `string?` | `null` | No | Text rendered after the visible label, such as `*`. It does not add the HTML `required` attribute or a validation rule. |
| `Circular` | `bool` | `false` | No | Uses a circular indicator instead of the default rounded-square indicator. |
| `Size` | `CheckboxSize` | `CheckboxSize.Medium` | No | Indicator size. Values: `Medium`, `Large`. |
| `LabelPosition` | `LabelPosition` | `LabelPosition.After` | No | Places the label after or before the indicator. Values: `After`, `Before`. |
| `Class` | `string?` | `null` | No | Adds CSS classes to the component wrapper. |
| `Style` | `string?` | `null` | No | Adds inline styles to the component wrapper. |
| Unmatched attributes | `Dictionary<string, object>?` | `null` | No | Applied to the native checkbox input. Use this for attributes such as `id`, `disabled`, `aria-label`, `aria-describedby`, `name`, or `accesskey`. |

## Events and binding

| Event or binding | Type | When it occurs |
| --- | --- | --- |
| `@bind-Value` | `TValue` | Updates the bound value when the native checkbox raises `change`. |
| `ValueChanged` | `EventCallback<TValue>` | Receives the new value through the inherited `InputBase<TValue>` binding contract. |

The explicit form is:

```razor
<Checkbox Value="_accepted"
          ValueChanged="OnAcceptedChanged"
          Label="Accept the terms" />

@code {
    private bool _accepted;

    private void OnAcceptedChanged(bool value)
    {
        _accepted = value;
    }
}
```

For `Checkbox<bool?>`, `null` renders the component's indeterminate visual and the indeterminate label. User interaction changes `null` to `true`, then toggles between `true` and `false`; there is no user gesture that restores `null`. Set the bound value to `null` in application code when an indeterminate state is needed.

## Child content and composition

`Checkbox` has no child-content slot. Supply label text through `Label`, `UncheckedLabel`, and `IndeterminateLabel`.

The component can participate in an `EditForm` through its inherited `InputBase<TValue>` behavior. The `Required` parameter is only a visual text marker; use normal Blazor validation attributes or custom validation for required business rules.

## Services and containers

Use the standard `AddBluentUI()` registration described in [Getting Started](../getting-started/index.md). `<Containers />` is not required by `Checkbox`.

The component has no direct JavaScript dependency during normal use. If an `accesskey` attribute is supplied, the inherited input base uses the registered DOM helper after first render to identify the operating system.

## Styling and theming

Include the standard theme and component bundles from [the theming and assets guide](../guides/theming-localization-rtl-and-assets.md). The source styles use Bluent design tokens for foreground, brand, disabled, spacing, typography, border radius, and indicator colors, so Checkbox follows the active Bluent light/dark token set.

Use `Size`, `Circular`, `LabelPosition`, `Class`, and `Style` for the supported public customization surface. Internal selectors and generated state classes are implementation details, not a compatibility contract.

## Localization and RTL

Checkbox has no built-in localized strings or culture-sensitive formatting. Applications provide all label and required-marker text.

The component has a targeted `[dir="rtl"]` rule that moves its transparent native input to the right. Label spacing uses a logical inline property for the required marker. Component-specific visual and interaction behavior in RTL has not been runtime verified.

## Accessibility and keyboard interaction

The source renders a native `<input type="checkbox">` and associates a rendered `<label>` with its generated or supplied `id`. The two indicator SVGs are marked `aria-hidden="true"`. A `disabled` unmatched attribute reaches the native input and also selects the component's disabled visual state when its value is `true`.

Provide `Label` or an explicit accessible-name attribute such as `aria-label`. `Required` is visual text only and does not set `aria-required`.

For a nullable `null` value, the source displays an indeterminate icon but does not set the native input's `indeterminate` property or `aria-checked="mixed"`. Assistive technology therefore must not be assumed to announce a mixed state. Native focus and Space-key behavior, validation announcements, and RTL keyboard behavior have not been independently runtime tested.

## Hosting and render modes

See [Hosting models and render modes](../compatibility/hosting-and-render-modes.md) for the repository-wide evidence and setup.

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Verified | Checkbox binding was exercised in the compiled onboarding example. |
| Interactive Server | Unverified | The representative mode baseline passed, but Checkbox-specific behavior was not separately recorded. |
| Interactive WebAssembly | Unverified | The representative mode baseline passed, but Checkbox-specific behavior was not separately recorded. |
| Interactive Auto | Unverified | The representative mode baseline passed, but Checkbox-specific behavior was not separately recorded. |
| Static SSR | Limited | Markup can render, but user interaction and two-way binding require an interactive render mode. |

## JavaScript and static assets

Normal Checkbox interaction does not import a component-specific JavaScript module or require a manual script tag. It requires:

- `_content/Bluent.UI/bluent.ui.theme.default.min.css` or another packaged Bluent theme;
- `_content/Bluent.UI/bluent.ui.components.min.css`.

The optional inherited `accesskey` handling uses the base package's dynamically imported module. There is no Checkbox-specific cleanup or browser API.

## Common mistakes

### A non-Boolean type throws during component construction

Bind only `bool` or `bool?`. Checkbox validates its generic type in its constructor.

### The nullable value never returns to indeterminate

User interaction produces only `true` and `false`. Assign `null` from application code to restore the indeterminate visual state.

### The required marker does not validate the field

`Required` renders only the supplied marker text. Add the appropriate Blazor validation rule to the model.

## Known limitations

- The visual indeterminate state is not exposed as a native or ARIA mixed state.
- User interaction cannot set the value back to `null`.
- There is no child-content slot.
- Component-specific keyboard, assistive-technology, RTL, and non-WebAssembly render-mode behavior remains unverified.

## Related components

- `RadioGroup` and `Switch` are listed in the [component inventory](inventory.md).
- [Getting Started](../getting-started/index.md)
- [Theming, localization, RTL, and browser assets](../guides/theming-localization-rtl-and-assets.md)

## Source and verification

- Component source: `src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor`
- Component logic: `src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs`
- Styles: `src/Bluent.UI/Styles/Components/_checkbox.scss`
- Compiled demo: `src/Bluent.UI.Demo.Pages/Pages/Components/Checkboxes.razor`
- Compiled scenario: `src/Bluent.UI.Demo.Pages/Pages/Scenarios/CustomerProfile.razor`
- Source verified against `Dev` commit `07e61ed8552176c1719ec94c81ea3fda867bae9e`
- Verification date: 2026-07-26

The API, example, styles, nullable behavior, and generated markup are source verified. The repository previously recorded standalone WebAssembly binding evidence; no new browser, visual, keyboard, or assistive-technology verification was performed for this page.
