# Icon and IconDefinition

`Icon` renders Bluent's typed `IconDefinition` abstraction. Prefer typed icon definitions over memorized CSS class strings when a Bluent component accepts `IconDefinition?`.

## Package and namespaces

```razor
@using Bluent.UI.Components
@using Bluent.UI.Icons
```

Package: `Bluent.UI`

## Basic usage

```razor
<Icon Value="@FluentIcons.Save" />
<Button Text="Save" Icon="@FluentIcons.Save" />
```

## Icon component API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Value` | `IconDefinition?` | editor-required | Typed icon definition. No output is rendered when the resolved source is absent. |
| `Variant` | `IconVariant` | `Regular` | Requests the regular or filled source. |

The component inherits common Bluent `Class`, `Style`, `Id`, tooltip, and unmatched-attribute support.

## IconDefinition

`IconDefinition` is a readonly record struct containing a required regular `IconSource` and optional filled `IconSource`.

Factory methods:

```csharp
IconDefinition.FromCss(regularClass, filledClass?)
IconDefinition.FromSvg(regularSvg, filledSvg?)
IconDefinition.FromImage(regularSource, filledSource?)
```

When `IconVariant.Filled` is requested but the definition has no filled source, `GetSource` falls back to the regular source.

## Rendering by source kind

Current `Icon` rendering is source-kind dependent:

- SVG source => `<span>` containing the supplied SVG markup.
- Image source => `<img src="...">`.
- CSS-class source => `<i>` with the icon CSS class added to the component classes.

Unsupported source kinds throw `ArgumentOutOfRangeException`.

## Consumer guidance

Use the repository-provided typed icon catalog (for example `FluentIcons.Save`) where it contains the desired icon. Construct an `IconDefinition` directly only when integrating a custom CSS, SVG, or image icon source.

Do not fall back to string icon class names for Bluent parameters that now accept `IconDefinition?`; that bypasses the typed consumer surface introduced by the current API.

## Accessibility

The `Icon` component does not automatically decide whether an icon is decorative or meaningful and does not synthesize `alt`, `aria-label`, or `aria-hidden` semantics. Supply appropriate unmatched attributes/context according to usage. In particular, icon-only interactive controls need an accessible name on the control, not merely a visual icon.

Image-backed icons render an `<img>`; consumers should not assume an automatic alt value is supplied.

## Evidence boundary

Source verified from `Icon.cs` and `Bluent.UI.Icons.IconDefinition`. Do not invent icon-name strings, size/color parameters, automatic accessibility labels, or filled variants that the selected definition does not contain.
