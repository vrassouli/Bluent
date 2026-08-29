# Toast

`Toast` provides transient global feedback. Consumer code normally uses `IToastService`; the service renders toast instances through Bluent's shared overlay containers.

## Package and namespaces

- Package: `Bluent.UI`
- Component/configuration namespace: `Bluent.UI.Components`
- Service namespace: `Bluent.UI.Services.Abstractions`
- Registration: `builder.Services.AddBluentUI()`
- Layout: one `<Containers />` in the active interactive scope

## Typical service usage

```razor
@inject IToastService ToastService

<Button Text="Save" OnClick="Save" />

@code {
    private async Task Save()
    {
        // save work...
        await ToastService.ShowAsync("Saved", c => c
            .SetMessage("Your changes were saved.")
            .SetIntend(ToastIntend.Success));
    }
}
```

See `docs/examples/tasks/feedback.md` for the compiled feedback pattern.

## `IToastService`

Current public overloads are:

```csharp
Task<dynamic?> ShowAsync(RenderFragment content, ToastConfiguration? config = null);
Task<dynamic?> ShowAsync(string title, Action<ToastConfigurator>? config = null);
Task<dynamic?> ShowAsync<TContent>(ToastConfiguration? config = null,
    IEnumerable<KeyValuePair<string, object?>>? parameters = null)
    where TContent : ComponentBase;
```

Use the string/configurator overload for the standard title/message toast, a `RenderFragment` for custom inline content, or `TContent` for a component-backed toast.

## Configuration

`ToastConfiguration` contains `Duration` (default `2500` ms) and `Placement` (default `BottomEnd`). A `null` duration disables automatic timeout in the component.

The standard-string overload uses `ToastConfigurator`, whose current defaults differ slightly: duration `3500` ms and placement `BottomEnd`. Its fluent methods are `SetDuration`, `SetPlace`, `SetMessage`, `SetDismissTitle`, and `SetIntend`.

Do not flatten these two different defaults into one invented global default.

## Component behavior

The underlying `Toast` has `ChildContent`, `Duration`, `Placement`, `OnClose`, and inherited root attributes/styles. It starts/restarts a timer when duration changes, pauses the timer on pointer enter, resumes it on pointer leave, and closes by entering its hide animation. `OnClose` fires after the hide animation ends and may carry a dynamic result.

The timer is disposed with the component.

## Accessibility and runtime

Toast lifecycle depends on interactive rendering, timers, animation events, the shared container and service registration. Do not claim static SSR interaction support.

The root source shown here is a plain `<div>`; generic live-region/alert semantics are not established by the `Toast` component itself. The default content may provide additional semantics/content, but consumers should not assume every custom toast is automatically announced by assistive technology without runtime verification.

## Known limitations and mistakes

- Do not instantiate a service-backed global toast system manually when `IToastService` fits the task.
- Do not omit `AddBluentUI()` or `<Containers />`.
- Await `ShowAsync` only when the close/result lifecycle matters; remember that duration and user dismissal can control completion.
- `ToastConfigurator.SetPlace` is the current method name; do not invent `SetPlacement`.
- `ToastIntend` is the current public type name; preserve that API spelling.

## Evidence

Source verified against `Toast.razor`, `Toast.razor.cs`, `ToastConfiguration`, `ToastConfigurator`, and `IToastService` on 2026-08-29. The feedback task provides compiled consumer evidence; timer/hover/announcement behavior still requires dedicated browser/accessibility verification.