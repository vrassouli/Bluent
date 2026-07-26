# Confirmation dialog

Use a modal confirmation before a consequential action, and change state only
when the returned result is affirmative.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components` and `Bluent.UI.Services.Abstractions`
- Services: `builder.Services.AddBluentUI()`
- Layout: one `<Containers />` in the same interactive service scope
- Assets: both base stylesheets from the [shared setup](README.md#shared-consumer-setup)

## Complete source

[`ConfirmationDialog.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/ConfirmationDialog.razor)
is the canonical compiled source. It injects `IDialogService`, awaits
`ShowMessageBoxAsync`, and checks for `MessageBoxResult.Yes`.

## Expected behavior

The action opens a Yes/Cancel dialog. Yes archives the request; cancel or
dismissal leaves it active and reports that outcome.

## Common mistakes

- Do not mutate state before awaiting the result.
- Do not compare a message-box result with an unrelated Boolean or string.
- Missing `AddBluentUI()` or `<Containers />` prevents the service-backed
  overlay from working.
- Put the container in the same interactive scope as the caller.

## Render modes and evidence

The source is build-verified in WebAssembly. Dialog display and result handling
require interactivity. Representative dialog service behavior has runtime
evidence in the modes listed by the
[hosting guide](../../compatibility/hosting-and-render-modes.md).
