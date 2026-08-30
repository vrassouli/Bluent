# MediaQuery

`MediaQuery` reports the largest Bluent breakpoint matched by the browser during its first rendered pass. Use it when application code needs the initial responsive breakpoint value; do not treat the current implementation as a continuous resize observer.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<MediaQuery OnChange="BreakpointChanged" />

@code {
    private Breakpoints _breakpoint;

    private void BreakpointChanged(Breakpoints breakpoint)
        => _breakpoint = breakpoint;
}
```

## Public API

| Member | Type | Notes |
| --- | --- | --- |
| `OnChange` | `EventCallback<Breakpoints>` | Invoked with the first matching breakpoint discovered during initial render. |
| `DomHelper` | `IDomHelper` | Public injected property used internally for browser media-query evaluation; consumers normally do not set it. |

`MediaQuery` inherits `ComponentBase`; it does not expose `ChildContent`, `Class`, `Style`, or the common `BluentUiComponentBase` surface.

## Breakpoints

Current `Breakpoints` values are:

```csharp
Xs  = 0
Sm  = 576
Md  = 768
Lg  = 992
Xl  = 1200
Xxl = 1400
```

The component checks them from largest to smallest using browser queries shaped as `(min-width: Npx)` and emits the first match.

## Important runtime behavior

The current source calls the browser only from `OnAfterRenderAsync(firstRender)` and performs no source-defined registration for subsequent viewport changes. Therefore:

- `OnChange` currently describes the callback name, not a persistent media-query subscription.
- Do not claim that resizing the browser automatically triggers another callback without separate runtime evidence or a future implementation change.
- Browser/JS interop is required to compute the initial value; static prerendered markup alone cannot supply it.

## Accessibility

`MediaQuery` does not render user-facing UI. Accessibility concerns apply to the conditional/responsive UI that consumes the reported breakpoint, not to this component itself.

## Evidence boundary

Source verified from `MediaQuery.cs` and `Breakpoints.cs`. Do not invent arbitrary query strings, child rendering, breakpoint-change listeners, orientation queries, or container-query behavior.
