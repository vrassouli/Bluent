# MessageBar

`MessageBar` displays persistent inline status or feedback inside the page. Prefer it when the message should remain associated with the current content; use `Toast` for transient global feedback.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`

## Minimal example

```razor
<MessageBar Type="MessageBarType.Success" Dismissable>
    Changes saved.
</MessageBar>
```

## Parameters and events

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Type` | `MessageBarType` | `Default` | Controls semantic visual type and default icon. |
| `Dismissed` | `bool` | `false` | External dismissed state. Supports `@bind-Dismissed`. |
| `DismissedChanged` | `EventCallback<bool>` | — | Raised by built-in dismissal when `OnDismiss` is not supplied. |
| `Dismissable` | `bool` | `false` | Renders a dismiss button. |
| `ChildContent` | `RenderFragment?` | `null` | Main message body. |
| `Actions` | `RenderFragment?` | `null` | Optional action area. |
| `Multiline` | `bool` | `false` | Adds multiline styling. |
| `OnDismiss` | `EventCallback` | — | Overrides the component's built-in dismissed-state transition when supplied. |
| `Icon` | `IconDefinition?` | `null` | Overrides the default type icon. |

`MessageBarType` selects the default icon: warning, danger, success and information have dedicated Fluent icons; `Default` uses `FluentIcons.Alert`.

## Dismissal behavior

When `Dismissable` is true, the component renders a transparent small icon-only Button. If `OnDismiss` has a delegate, clicking dismiss invokes it and does **not** automatically set the component's internal dismissed state. Without `OnDismiss`, the component sets its internal state and invokes `DismissedChanged(true)`.

When dismissed, the Razor component returns without rendering the message bar.

## Important source-observed state caveat

Current `OnParametersSetAsync` contains asymmetric synchronization: whenever its internal `_dismissed` value differs from the public `Dismissed` parameter, it sets `_dismissed = true`. Therefore a transition from externally dismissed back to `Dismissed="false"` does not reliably reopen the same instance through this synchronization path. Consumers should not assume two-way reopen semantics until this behavior is corrected and runtime-verified.

## Accessibility

The current root is a plain `<div>` and source does not add `role="status"`, `role="alert"`, or a live-region attribute automatically. Add application-level semantics only when appropriate for the urgency and update behavior; do not document an implicit live region that the component does not render.

The built-in dismiss Button is icon-only in current markup and no explicit accessible name is supplied by `MessageBar` itself. Treat accessible naming as a current limitation requiring runtime/accessibility follow-up.

## Styling and composition

`Multiline` and non-default `Type` add CSS classes. `Actions` renders after the dismiss area. Standard inherited Bluent component attributes/classes/styles apply to the root.

## Evidence

Source verified against `MessageBar.razor` and `MessageBar.razor.cs` on 2026-08-29. Runtime dismissal/reopen and assistive-technology behavior remain unverified.