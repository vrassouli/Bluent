# Theming, localization, RTL, and browser assets

This guide describes Bluent's cross-cutting application requirements as implemented in the current source.

## Required base assets

Applications using `Bluent.UI` should include one theme bundle and the component bundle:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
```

The theme bundle includes icons, reset/base styles, light and dark tokens for the selected theme family, and layout utilities. The component bundle contains component-specific styles.

## Theme families

The current build defines these theme bundles:

- `default`
- `excel`
- `office`
- `outlook`
- `powerapps`
- `powerbi`
- `powerpoint`
- `stream`
- `teams`
- `word`

For example:

```html
<link href="_content/Bluent.UI/bluent.ui.theme.teams.min.css" rel="stylesheet" />
```

Each theme bundle contains both light and dark token sets.

## Light and dark mode

Bluent reads the `data-bui-theme` attribute on the document root. Valid modes used by the current implementation are `light` and `dark`.

Set the initial mode before the app becomes interactive:

```html
<html lang="en" data-bui-theme="light" dir="ltr">
```

At runtime, inject `IBluentTheme`:

```razor
@using Bluent.UI.Interops.Abstractions
@inject IBluentTheme Theme

<Button @onclick="Theme.SetDarkThemeModeAsync">Dark</Button>
<Button @onclick="Theme.SetLightThemeModeAsync">Light</Button>
```

The service updates `data-bui-theme` on `document.documentElement`.

## Switching theme families

`IBluentTheme.SetThemeAsync(string theme)` replaces the filename of the first document-head link whose URL contains `bluent.ui.theme`.

```csharp
await Theme.SetThemeAsync("teams");
```

Important constraints:

- Keep exactly one active Bluent theme link unless the application deliberately manages precedence.
- Keep the standard `bluent.ui.theme.{name}.min.css` filename pattern.
- Pass a theme family that is actually packaged.
- The current script assumes a matching link exists; missing or renamed links require application-side error handling and should be covered by future library hardening.

Theme family and light/dark mode are independent: the family chooses the token set, while `data-bui-theme` selects its light or dark values.

## Right-to-left layout

Set direction on the document root:

```html
<html lang="fa" data-bui-theme="light" dir="rtl">
```

Or switch it at runtime:

```csharp
await Theme.SetRtlDirectionAsync();
await Theme.SetLtrDirectionAsync();
```

The service updates the root `dir` attribute. The styles include RTL-aware utilities and targeted RTL rules for component families such as accordion, action card, breadcrumb, menu list, navigation list, progress bar, tag, tree, and wizard.

A `.rtl` utility class also sets `direction: rtl`, but the document-level `dir="rtl"` attribute is preferred for an application-wide direction because it provides semantic direction to the browser and descendants.

RTL is present in source but does not yet have a recorded component-by-component visual and interaction test. Do not interpret the available selectors as a complete RTL compatibility guarantee.

## Localization

`AddBluentUI()` calls `AddLocalization()`; no separate localization registration is required for the built-in Bluent resources.

Current localized resource usage is visible in:

- message-box action labels
- date-field text and parsing errors
- time-field text
- dropdown-list text
- dropdown-select text

Components such as date and time fields may also accept or use `CultureInfo` for parsing, formatting, calendars, separators, and supported date ranges.

Configure the application's culture using normal ASP.NET Core or Blazor localization mechanisms. Bluent consumes the active culture and its own packaged resources; it does not replace application-level culture configuration.

When documenting a localized component, verify:

- available resource cultures
- fallback behavior
- parsing and display culture
- calendar range
- validation-message formatting
- whether changing culture after startup is supported

## JavaScript loading

The main package uses an ES module at:

```text
./_content/Bluent.UI/bluent.ui.js
```

Services and interop helpers load it through:

```csharp
jsRuntime.InvokeAsync<IJSObjectReference>("import", modulePath)
```

Therefore, the base package does not require a manual global `<script>` tag in the standard setup.

Implications:

- The component must be running in an interactive browser context before invoking interop.
- Static SSR alone cannot execute module-dependent behavior.
- Static web assets must be mapped and served correctly.
- Components should dispose module references; disposal and reconnect behavior still require render-mode validation.
- A restrictive Content Security Policy must allow the application's Blazor static assets and module-loading strategy.

A global bundle is produced by the source build, but the current public setup uses module imports. Do not add `bluent.ui.global.js` to consumer documentation unless a verified scenario specifically requires it.

## Specialized assets

### Diagrams

Applications using `Bluent.UI.Diagrams` must include:

```html
<link href="_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css" rel="stylesheet" />
```

Diagram JavaScript and runtime behavior need package-specific validation.

### Charts

The Charts project packages a chart JavaScript asset and is built around Chart.js behavior. Its exact consumer loading lifecycle must be verified in the chart reference before a manual script requirement is documented.

## Persistence and first-render behavior

The current `IBluentTheme` API changes the active document but does not itself document persistence across reloads.

Applications that persist theme or direction preferences should:

1. Read the preference before or during startup.
2. Apply initial HTML attributes early to avoid a flash of the wrong mode or direction.
3. Apply the matching runtime state after interactivity begins.
4. Validate prerender/hydration behavior in Blazor Web Apps.

Persistence recommendations will be expanded after render-mode validation in [Issue #366](https://github.com/vrassouli/Bluent/issues/366).

## Verification sources

Reviewed on 2026-07-25:

- `src/Bluent.UI/bundleconfig.json`
- `src/Bluent.UI/Styles/Themes/`
- `src/Bluent.UI/Styles/Components/`
- `src/Bluent.UI/Interops/Abstractions/IBluentTheme.cs`
- `src/Bluent.UI/Interops/BluentTheme.cs`
- `src/Bluent.UI.Scripts/src/Theme/Theme.ts`
- `src/Bluent.UI/Extensions/ServiceCollectionExtensions.cs`
- localized component and service resource usage
- WebAssembly and Blazor Web App root documents

This guide is source-verified. Visual RTL coverage, culture coverage, CSP behavior, and render-mode runtime behavior remain validation tasks.
