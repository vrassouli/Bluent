# Icons

Bluent uses a strongly typed icon model. Application code should select bundled Fluent icons through `FluentIcons` rather than writing Fluent CSS class names.

## Fluent icons

Import the icon namespace:

```razor
@using Bluent.UI.Icons
```

Then select icons through IntelliSense:

```razor
<Button Text="Save" Icon="@FluentIcons.Save" />
<MenuItem Title="Delete" Icon="@FluentIcons.Delete" />
<NavItem Text="Settings" Icon="@FluentIcons.Settings" />
```

`FluentIcons.Save` is an `IconDefinition`. An icon definition contains the regular source and, when the Fluent set provides it, the corresponding filled source. Components such as buttons, navigation items, list items, tabs, and menu items use the filled source for their active/hover state automatically.

Do not write classes such as `icon-ic_fluent_save_20_regular` in application code. The `FluentIcons` catalog is generated from Bluent's bundled `FluentSystemIcons-Resizable.json`, so the compiler and IDE can discover and validate icon names.

## Rendering an icon directly

Use the `Icon` component with its `Value` parameter:

```razor
<Icon Value="@FluentIcons.Settings" />
```

To request a specific state explicitly:

```razor
<Icon Value="@FluentIcons.Settings" Variant="IconVariant.Filled" />
```

If a definition has no filled source, requesting `Filled` falls back to its regular source.

## Custom SVG icons

Create an `IconDefinition` from a complete SVG document:

```csharp
private static readonly IconDefinition ProductIcon = IconDefinition.FromSvg("""
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="..." />
    </svg>
    """);
```

Then pass it to any typed icon parameter:

```razor
<Button Text="Product" Icon="@ProductIcon" />
```

SVG content is rendered as markup. Only use trusted developer-controlled SVG strings; do not pass unsanitized user input to `IconDefinition.FromSvg`.

## Image icons

Image files can be represented explicitly:

```csharp
private static readonly IconDefinition PowerPointIcon =
    IconDefinition.FromImage("/assets/icons/powerpoint.svg");
```

```razor
<Icon Value="@PowerPointIcon" Style="width: 32px; height: 32px;" />
```

## Custom active variants

Applications can define their own regular/filled pair:

```csharp
private static readonly IconDefinition CustomAction = new(
    IconSource.Svg(RegularSvg),
    IconSource.Svg(FilledSvg));
```

The same definition can then be passed to a stateful component:

```razor
<Button Icon="@CustomAction" />
```

## API model

- `IconDefinition` represents an icon and its optional filled state.
- `IconSource` represents one renderable source.
- `IconSourceKind` distinguishes CSS-class, SVG, and image sources.
- `IconVariant` selects regular or filled rendering.
- `FluentIcons` is generated from the bundled Fluent icon metadata.

The source type is explicit. Bluent no longer guesses whether a string is a CSS class, SVG document, or image URL.

## Breaking migration from the string API

Old code:

```razor
<Button Icon="icon-ic_fluent_save_20_regular"
        ActiveIcon="icon-ic_fluent_save_20_filled" />
```

New code:

```razor
<Button Icon="@FluentIcons.Save" />
```

Old direct rendering:

```razor
<Icon Content="icon-ic_fluent_settings_20_regular" />
```

New direct rendering:

```razor
<Icon Value="@FluentIcons.Settings" />
```

`Content`, `ActiveIcon`, `IconClass`, `ActiveIconClass`, and `SvgGenerator` are not part of the new icon architecture.
