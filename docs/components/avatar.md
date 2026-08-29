# Avatar

`Avatar` displays initials, a typed icon, an image, or a combination of those layers for a person/entity. It can also act as an interactive Popover trigger or expose an `OnClick` callback.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Avatar Name="Vahid Rassouli" AutoColor />
```

## Public API

| Parameter | Type | Default / notes |
| --- | --- | --- |
| `Initials` | `string?` | explicit initials; takes precedence over derived initials |
| `Name` | `string?` | used to derive initials when `Initials` is empty |
| `ImageSource` | `string?` | optional image src |
| `Icon` | `IconDefinition?` | optional typed icon |
| `InitialsSeperator` | `string?` | separator inserted between displayed initial characters; note public spelling |
| `AutoColor` | `bool` | `false` |
| `OnClick` | `EventCallback` | click callback |
| `Size` | `AvatarSize` | `Size32` |
| `Shape` | `AvatarShape` | `Circle` |
| `Color` | `ColorPalette?` | optional explicit palette |

`Avatar` also consumes a cascading `Popover?`. On first render, when one exists, it registers itself as the Popover trigger.

## Initials and color behavior

Explicit `Initials` wins. Otherwise `Name` is split on spaces and the first character of each non-empty part is concatenated.

When `InitialsSeperator` is non-null, it is inserted between each character of the resulting initials.

Explicit `Color` wins over `AutoColor`. Automatic color is deterministically derived from the Unicode bytes of the initials and falls back to `ColorPalette.Brand` when initials are absent.

## Layering

Current markup may render initials, icon, and image in the same avatar wrapper; they are not mutually exclusive at the component API level. Styling determines their visual stacking.

Image errors are handled by an inline `onerror` attribute that sets the image element's display to `none`.

## Accessibility and interaction cautions

The root is a clickable `<div>` when `OnClick` is used; source does not add button role, tabindex, or keyboard activation. Do not claim native button semantics.

Image-backed avatars do not receive an automatic `alt` attribute in current markup. Provide appropriate accessible context/unmatched attributes or surrounding text according to whether the image is informative or decorative.

The avatar's `Name` is used for initials generation; it is not automatically emitted as an accessible name.

## Evidence boundary

Source verified from `Avatar.razor(.cs)` and the public avatar enums. Do not invent fallback-image callbacks, automatic alt text, exclusive image/initial states, or keyboard button semantics absent from current source.
