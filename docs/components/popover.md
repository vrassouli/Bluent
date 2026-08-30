# Popover

`Popover` provides a transient surface anchored to a rendered Bluent trigger component. Use it for compact contextual content; use `Drawer` or `Dialog` for larger workflows.

## Package and namespace

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Registration: `builder.Services.AddBluentUI()`
- Layout: one `<Containers />` in the active interactive scope

## Minimal example

```razor
<Popover Placement="Placement.Bottom" SameWidth>
    <Trigger>
        <Button Text="Filters" />
    </Trigger>
    <Surface>
        <div class="p-3">Filter options</div>
    </Surface>
</Popover>
```

The current compiled task example is `docs/examples/tasks/drawer-and-popover.md`.

## Parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Trigger` | `RenderFragment` | required | Trigger content. The rendered trigger must participate in Bluent's trigger registration contract. |
| `Surface` | `RenderFragment` | required | Popover surface content. |
| `Placement` | `Placement` | `Top` | Requested anchored placement. |
| `Offset` | `int` | `6` | Trigger/surface offset. |
| `Padding` | `int` | `5` | Placement padding. |
| `DisplayArrow` | `bool` | `true` | Requests an arrow. |
| `KeepSurface` | `bool` | `false` | Passed to popover configuration for surface retention. |
| `TriggerEvents` | `string?` | `"click"` | Comma/space/semicolon-separated event names. |
| `HideEvents` | `string?` | `null` | Optional hide-event names using the same separators. |
| `SameWidth` | `bool` | `false` | Requests surface width matching the trigger. |
| `Appearance` | `PopoverAppearance` | `Default` | Surface appearance. |

## Imperative API

After the trigger has registered, `Show()` opens the popover. `Close()` closes it. `RefreshSurface(bool updatePosition = false)` refreshes surface content; with `updatePosition: true`, source calls `Show` again to recalculate placement. `Dispose()` destroys the registered trigger/surface through `IPopoverService`.

Calling `Show()` before trigger registration throws `InvalidOperationException`.

## Composition and service behavior

`Popover` renders only its `Trigger` in its own Razor tree. The `Surface` is handed to `IPopoverService` and receives the current `Popover` as a cascading value. This is a service/container-backed overlay, not inline hidden content.

`Trigger` and `Surface` are both required. Missing Bluent service registration also fails initialization.

## Accessibility and interaction

Placement, event-triggering, dismissal and focus behavior are interactive/runtime concerns. Do not claim static SSR support. The current source does not itself establish a generic ARIA relationship between arbitrary trigger and surface content; accessibility semantics depend on the concrete trigger/surface composition.

## Known limitations and mistakes

- Do not omit `AddBluentUI()` or the shared `Containers` host.
- Do not assume arbitrary plain HTML trigger content implements the Bluent trigger-registration contract.
- `TriggerEvents`/`HideEvents` are string event names; use verified event names from existing examples/source rather than inventing aliases.
- The source initialization error for a missing popover service currently mentions `ITooltipService`; treat that text as an implementation-message defect, not a consumer requirement.
- Do not duplicate positioning logic in application JavaScript.

## Evidence

Source verified against `Popover.razor`, `Popover.razor.cs`, `IPopoverService` usage, and the compiled drawer/popover task example on 2026-08-29. Representative measurement has existing interactive runtime evidence through the task/hosting documentation; full keyboard/focus/accessibility behavior is not claimed here.