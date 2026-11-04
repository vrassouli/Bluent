# Icon

`Icon` renders a typed icon definition from the bundled Fluent CSS font, trusted inline SVG markup, or an image source. It provides one predictable `1em` viewport; the consuming layout controls its actual size, color context, and accessible meaning.

## Package and namespace

```razor
@using Bluent.UI.Components
@using Bluent.UI.Icons
```

The component is part of `Bluent.UI`. No additional service, container, or JavaScript registration is required. Include the packaged Bluent component stylesheet as described in [Getting Started](../getting-started/index.md).

## Minimal example

```razor
<Icon Value="@FluentIcons.Settings" aria-hidden="true" />
```

Use an explicit inherited font size or caller style to control dimensions:

```razor
<div style="font-size: 1.5rem; color: var(--colorBrandForeground1)">
    <Icon Value="@FluentIcons.Settings" aria-hidden="true" />
</div>

<Icon Value="@FluentIcons.Settings"
      Style="width:32px;height:32px;color:rebeccapurple"
      aria-hidden="true" />
```

The default root viewport is `1em × 1em`. It follows the inherited font size. An explicit caller CSS rule or `Style` dimension takes precedence. `Icon` has **no public `Size` parameter**; size remains ordinary CSS/layout.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Value` | `IconDefinition?` | `null` | Yes | Selects the Regular and optional Filled source definitions. A null value renders no icon. |
| `Variant` | `IconVariant` | `Regular` | No | Selects `Regular` or `Filled`. If a Filled source is not supplied, Filled requests fall back to Regular. |

`Icon` also inherits the common Bluent component parameters such as `Id`, `Class`, `Style`, and unmatched HTML attributes. No `Color` variant or dedicated size parameter is provided.

## Icon definitions and source kinds

`IconDefinition` is an immutable value with a required Regular source and an optional Filled source:

```csharp
var custom = IconDefinition.FromSvg(
    regularSvg: regularMarkup,
    filledSvg: filledMarkup);

var image = IconDefinition.FromImage(
    regularSource: "/assets/icons/document.svg");

var css = IconDefinition.FromCss(
    regularClass: "icon-ic_fluent_settings_20_regular",
    filledClass: "icon-ic_fluent_settings_20_filled");
```

| Factory | Rendered root | Notes |
| --- | --- | --- |
| `FromCss` | `<i>` | Applies the supplied CSS class to the root and uses the loaded icon-font rule. |
| `FromSvg` | `<span>` | Inserts the supplied SVG markup as trusted inline markup. |
| `FromImage` | `<img>` | Sets the native `src`; native image attributes such as `alt` are forwarded. |

The selected source kind determines the root element. Common component attributes (`AdditionalAttributes`, `Id`, `Class`, `Style`) are applied to that root. Caller `Class` and `Style` are merged using the base component contract; unmatched attributes are forwarded to the root.

## Sizing, color, and SVG scaling

- The root owns only a relative `1em` inline and block size. Its dimensions follow inherited font size by default.
- A caller's explicit CSS class or inline `Style` can override either dimension.
- The root inherits `currentColor`; CSS font glyphs and SVG artwork that uses `currentColor` follow the surrounding text color.
- An SVG should include a valid `viewBox` for predictable scaling. The component passes the SVG markup through; it does not synthesize or normalize a missing/invalid `viewBox`, width, height, or aspect ratio.
- SVG content may contain its own fills, strokes, or explicit sizing. Those author-supplied values remain part of the trusted source and can affect its appearance.

## Regular and Filled

`IconVariant` contains only `Regular` and `Filled`.

```razor
<Icon Value="@FluentIcons.Search" Variant="IconVariant.Regular" aria-hidden="true" />
<Icon Value="@FluentIcons.Search" Variant="IconVariant.Filled" aria-hidden="true" />
```

When a definition has only a Regular source, a Filled request uses that Regular source. No synthetic Filled glyph is generated. A Color variant is not part of the public contract.

## Accessibility

`Icon` does not infer whether an icon is decorative or informative and does not create an accessible name automatically. The consumer chooses the semantics at the use site.

Decorative CSS-font or SVG icon:

```razor
<Icon Value="@FluentIcons.Save" aria-hidden="true" />
```

Informative inline SVG:

```razor
<Icon Value="@InformationIcon"
      role="img"
      aria-label="Information" />
```

Informative image:

```razor
<Icon Value="@DocumentImage"
      alt="Document file" />
```

Decorative image:

```razor
<Icon Value="@DocumentImage"
      alt=""
      aria-hidden="true" />
```

When the icon appears inside an interactive parent, the parent control owns the contextual action name. Do not make a decorative child repeat the parent's accessible name. An icon-only interactive control needs its own meaningful accessible name supplied by the consumer.

The native root differs by source (`i`, `span`, or `img`); use the matching native attributes and semantics. The component does not add `role`, `aria-label`, `aria-hidden`, or image alternative text on the consumer's behalf.

## Trusted SVG boundary

`FromSvg` uses Blazor `MarkupString` to insert the supplied string as inline markup. It is **not an SVG sanitizer**. Only pass developer-owned, app-owned trusted SVG markup. Do not pass user-submitted SVG or other untrusted markup to `FromSvg`.

For content that is not trusted, use a safely hosted image URL or sanitize it with an application-owned, security-reviewed pipeline before it reaches the component.

## RTL

`Icon` does not automatically mirror directional artwork. Select the correct direction-specific glyph or SVG for the action and layout. Only mirror assets whose meaning and source design explicitly allow mirroring. The parent page's `dir` and surrounding layout remain in control.

## Common mistakes

### The icon is not the expected size

The default is relative to the inherited font size, not a fixed 20px. Set `font-size` on a parent or set an explicit width and height through `Style` or caller CSS.

### A Filled request still looks Regular

The definition may contain only a Regular source. Filled intentionally falls back to Regular when its Filled source is absent.

### An SVG appears stretched or does not scale predictably

Provide a valid `viewBox` in the source SVG. The component does not invent or normalize SVG geometry metadata.

### An icon is announced with no useful name or repeats a button's name

Set decorative/informative intent at the usage site. Use `aria-hidden="true"` for decorative SVG/font icons, `alt=""` for decorative images, and a meaningful name for standalone informative icons. Let an interactive parent own its action name.

## Known limitations

- A missing or invalid SVG `viewBox` is not repaired by the component.
- `FromSvg` does not sanitize markup; untrusted markup is unsupported.
- There is no automatic RTL mirroring and no `Color` variant.
- The bundled 20px font has three source glyphs whose intrinsic advance is 0.952em (19.04 CSS px at 20px): `hand_wave_filled`, `person_passkey_filled`, and `person_passkey_regular`. These are source font metrics, not component CSS normalization defects.

## Source and verification

- Component: `src/Bluent.UI/Components/IconComponent/Icon.cs`
- Source definitions: `src/Bluent.UI/Icons/`
- Styles: `src/Bluent.UI/Styles/Components/_icon.scss`
- Demo: `src/Bluent.UI.Demo.Pages/Pages/Components/Icons.razor`
- Tests: `tests/RegexSampleGeneratorTest/IconRenderTests.cs`
- Verification date: `2026-11-03`

The focused Release HtmlRenderer suite passes 6/6; the full Release solution build passes with 0 warnings and 0 errors, and the solution test suite passes 37/37. `Bluent.UI.Demo.Pages` also builds in Release with 0 warnings and 0 errors. Published Edge/WebAssembly runtime evidence is recorded below; full cross-browser/render-mode, native assistive-technology and final Fluent/owner design acceptance remain tracked separately in [Icon issue #429](https://github.com/vrassouli/Bluent/issues/429).
