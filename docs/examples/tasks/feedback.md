# Toast and MessageBar feedback

Use `MessageBar` for feedback that belongs in the page flow and
`IToastService` for short-lived global feedback.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components` and `Bluent.UI.Services.Abstractions`
- Services: `builder.Services.AddBluentUI()`
- Layout: one `<Containers />` for toasts
- Assets: both base stylesheets from the [shared setup](README.md#shared-consumer-setup)

## Complete source

[`Feedback.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/Feedback.razor)
is the canonical compiled source. It combines a persistent `MessageBar` with a
success toast configured for the bottom-end placement.

## Expected behavior

Saving changes updates the inline message and opens a transient success toast.
Resetting returns the inline guidance to its initial state.

## Common mistakes

- Do not use a toast as the only durable record of an important failure.
- `IToastService` requires registration and the shared container.
- Do not fire service calls from a static SSR-only component and expect browser
  interaction.
- Toast placement is logical (`BottomEnd`) and responds to document direction.

## Render modes and evidence

The source is build-verified in WebAssembly. Toasts and button callbacks
require interactivity; the initial MessageBar can produce display-only markup
in static SSR.
