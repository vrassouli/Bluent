# Theme, dark mode, and RTL

Use `IBluentTheme` to change the active theme family, light/dark mode, and
document direction after the application becomes interactive.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components` and
  `Bluent.UI.Interops.Abstractions`
- Services: `builder.Services.AddBluentUI()`
- Initial document attributes: `data-bui-theme="light"` and `dir="ltr"` (or
  the application's chosen initial values)
- Assets: exactly one packaged theme stylesheet plus the component stylesheet

## Complete source

[`ThemeAndRtl.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/ThemeAndRtl.razor)
is the canonical compiled runtime source. The consumer
[`index.html`](../../../samples/Bluent.TaskExamples/wwwroot/index.html)
contains the initial document attributes and stylesheet link.

## Expected behavior

Light/dark actions update `data-bui-theme`. Theme-family actions replace the
active `bluent.ui.theme.{name}.min.css` link. LTR/RTL actions update the root
`dir` attribute.

## Common mistakes

- Theme family and light/dark mode are independent settings.
- Pass only a packaged theme family such as `default` or `teams`.
- Keep one active link whose filename follows the packaged theme pattern.
- `IBluentTheme` does not persist preferences; application code must store and
  reapply them.
- Apply initial attributes early to reduce a flash of the wrong mode or
  direction.

## Render modes and evidence

The theme service calls compile in the WebAssembly consumer and the demo has
runtime visual evidence for light/dark and LTR/RTL. These operations require
browser interop; static SSR can only use the initial document attributes. See
the full [theming and RTL guide](../../guides/theming-localization-rtl-and-assets.md).
