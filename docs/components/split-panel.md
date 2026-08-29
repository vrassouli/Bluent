# SplitPanelContainer

`SplitPanelContainer` composes a multi-region application layout with optional header/footer, side, top/bottom, start/end, and center areas. Non-center regions can be fixed, automatically resizable, or explicitly resizable.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic composition

```razor
<SplitPanelContainer StartMaxSize="420" EndMaxSize="420">
    <Start>
        Navigation
    </Start>
    <Center>
        Main content
    </Center>
    <End>
        Inspector
    </End>
</SplitPanelContainer>
```

## Region content

The public render-fragment regions are:

- `Header`
- `Footer`
- `StartSide`
- `EndSide`
- `Top`
- `Bottom`
- `Start`
- `End`
- `Center`

Only supplied regions are rendered. `Center` is not resizable.

## Resize configuration

Each non-center region has a corresponding `ResizeMode` parameter, defaulting to `ResizeMode.Auto`:

```csharp
public enum ResizeMode
{
    Auto,
    Fixed,
    Resizable
}
```

Parameters follow the region names, for example `StartResizeMode`, `EndResizeMode`, `HeaderResizeMode`, and `FooterResizeMode`.

Each non-center region also exposes a nullable integer maximum size such as `StartMaxSize`, `EndMaxSize`, `TopMaxSize`, etc. Sizes are handled as pixel values by the current implementation.

## Programmatic sizing

`SplitPanelContainer` exposes:

```csharp
void SetSize(SplitArea area, int size)
```

The `SplitArea` type used by this API comes from the split-panel implementation. Prefer normal region parameters/composition unless application code genuinely needs programmatic sizing and has verified the matching public type/version.

## Runtime behavior

Resizing is interactive and pointer-driven:

- On first interactive render, the component registers pointer-up and pointer-move handlers through `IDomHelper`.
- Starting a resize may query the current region bounding rectangle from the browser.
- Pointer movement updates an in-memory pixel size and rerenders the layout.
- Handler registration is skipped when `RendererInfo.IsInteractive` is false.
- Interop handlers are unregistered during async disposal; `JSDisconnectedException` is swallowed during teardown.

Static SSR can emit the initial region markup, but source-defined drag resizing requires an interactive render mode/browser interop.

## Current source limitations

- Minimum-size parameters exist only as commented-out code in the current implementation and are not public API.
- The resize path currently clamps at zero and the configured region maximum; do not invent `MinSize` parameters.
- Resizing is pointer based. Current source does not establish keyboard-resizable separator behavior or ARIA separator/value semantics.
- Runtime/browser behavior still deserves dedicated high-risk verification before making stronger accessibility or pointer-device claims.

## Accessibility

Current source does not establish keyboard-operable splitters, `role="separator"`, `aria-orientation`, or `aria-valuenow` semantics. Do not claim those behaviors from the visual resizer alone.

## Evidence boundary

Source verified from `SplitPanelContainer.razor`, `SplitPanelContainer.razor.cs`, and `ResizeMode.cs`. Internal helper components such as `SplitPanel` and `PanelResizer` are implementation details and should not be substituted for the consumer-facing `SplitPanelContainer` API.
