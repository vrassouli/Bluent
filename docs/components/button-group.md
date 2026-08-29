# ButtonGroup

`ButtonGroup` visually groups related Bluent buttons into one command cluster.

## When to use

Use `ButtonGroup` when several closely related `Button` actions should read as one compact control group, such as cut/copy/paste. Use `Stack` or normal layout utilities when actions are merely adjacent and should retain independent visual boundaries.

## Package and namespace

```bash
dotnet add package Bluent.UI
```

```razor
@using Bluent.UI.Components
```

Follow [Getting Started](../getting-started/index.md) for `AddBluentUI()` and packaged styles.

## Minimal example

```razor
<ButtonGroup>
    <Button Text="Cut" />
    <Button Text="Copy" />
    <Button Text="Paste" />
</ButtonGroup>
```

The repository Button showcase compiles grouped buttons with several Button appearances. This page is source verified; no new browser run was performed.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `ChildContent` | `RenderFragment?` | `null` | No | Content rendered inside the group; intended for related Buttons. |
| `Class` / `Style` | inherited | `null` | No | Application CSS class and inline style. |
| Unmatched attributes | inherited | `null` | No | Applied to the root `<div>`. |

`ButtonGroup` deliberately has a small API. Do not infer group-level appearance, orientation, selection, or click parameters that are not present in source.

## Events and binding

`ButtonGroup` exposes no component-specific events or bindable state. Events belong to the child buttons.

## Child content and composition

`ChildContent` is rendered directly inside the root group `<div>`. The canonical use is a sequence of `Button` components. `Button` also uses `ButtonGroup` internally for split-button composition.

## Services and containers

`ButtonGroup` itself does not inject a component-specific service and does not require `<Containers />`. Use normal Bluent setup because its intended child buttons and their optional tooltip/dropdown behavior may require shared Bluent services.

## Styling and theming

The component contributes the group wrapper and relies on packaged component CSS for grouped-button presentation. Set appearance and size on child `Button` instances. Internal wrapper class names are not a public customization contract.

## Localization and RTL

`ButtonGroup` contains no built-in text and performs no culture-sensitive formatting. Child content supplies localized labels. Group-specific RTL visual verification is not recorded.

## Accessibility and keyboard interaction

The component renders a plain `<div>` and does not add a role, focus management, selection model, or group-level keyboard behavior. Native semantics and accessible names come from child controls. Add application semantics only when required by the surrounding interaction model.

## Hosting and render modes

| Render mode | Status | Notes |
| --- | --- | --- |
| Standalone WebAssembly | Unverified | Showcase compiles; no group-specific browser run recorded. |
| Interactive Server | Unverified | Wrapper itself is passive; child controls determine interaction requirements. |
| Interactive WebAssembly | Unverified | Same as above. |
| Interactive Auto | Unverified | Same as above. |
| Static SSR | Limited | Wrapper and initial child markup can render; child callbacks/dropdowns/tooltips need interactivity. |

## JavaScript and static assets

`ButtonGroup` imports no JavaScript. Include standard Bluent theme and component styles. Child controls may introduce shared Bluent interactive infrastructure.

## Common mistakes

### Looking for a group-level appearance or orientation

Those parameters do not exist on `ButtonGroup`. Configure the child buttons or use layout components when a different arrangement is needed.

### Expecting group-level selection state

`ButtonGroup` is visual composition, not a radio/toggle selection model. Bind state on individual Buttons or use the appropriate selection component.

## Known limitations

- No group-level events, selection state, appearance, size, or orientation API.
- Group-specific runtime, RTL, and accessibility verification is not recorded.

## Related components

- `Button`: `button.md`
- `Stack`: see [component inventory](inventory.md)

## Source and verification

- Component markup: `src/Bluent.UI/Components/ButtonGroupComponent/ButtonGroup.razor`
- Component logic: `src/Bluent.UI/Components/ButtonGroupComponent/ButtonGroup.razor.cs`
- Compiled showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor`
- Source verified against PR branch base commit `73e5de61133ec7037934f232addf5ddbf646e766`
- Verification date: 2026-08-29
