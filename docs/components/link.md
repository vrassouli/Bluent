# Link

`Link` is Bluent's lightweight text action/navigation primitive. It renders as an anchor when `Href` is supplied and as a button when `Href` is empty.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Link Text="Documentation" Href="/docs" />
<Link Text="Refresh" OnClick="RefreshAsync" />
```

## Public API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Text` | `string` | required | Rendered text content. |
| `Href` | `string?` | `null` | When non-empty, renders an `<a>`; otherwise renders a `<button type="button">`. |
| `Appearance` | `LinkAppearance` | `Default` | `Default` or `Subtle`. |
| `OnClick` | `EventCallback` | empty | Invoked from the rendered element's click handler. |

The component inherits normal Bluent `Class`, `Style`, `Id`, tooltip parameters, disabled detection through unmatched attributes, and other common attributes.

## Render and disabled behavior

- Empty/whitespace `Href` => `<button type="button">`.
- Non-empty `Href` => `<a href="...">`.
- If the component is considered disabled through inherited unmatched attributes, the source omits the anchor `href` value.
- The click handler still invokes `OnClick`; source does not guard `ClickHandler()` with `IsDisabled`.
- When an `Href` is present but the component is disabled, the element remains an `<a>` because tag selection is based on `Href`; only the href attribute is suppressed.

That distinction matters: do not claim disabled `Link` automatically becomes a disabled native button.

## Accessibility and keyboard behavior

When used without `Href`, native button semantics are available. With `Href`, native anchor semantics apply while the href exists. Disabled-anchor behavior should be verified in the target application because current source removes navigation but does not establish a complete disabled-link accessibility pattern such as `aria-disabled` or click suppression.

## Evidence boundary

Source verified from `Link.cs` and `LinkAppearance.cs`. Do not invent icons, child content, target/rel-specific parameters, router active-state matching, or automatic disabled-event suppression that are not part of the current public component surface.
