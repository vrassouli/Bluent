# RTL and localization

Canonical source: `docs/guides/theming-localization-rtl-and-assets.md`.

For application-wide RTL, prefer the document-root `dir="rtl"`; runtime direction changes use `IBluentTheme.SetRtlDirectionAsync()` / `SetLtrDirectionAsync()` as documented. Do not treat the presence of RTL CSS selectors as proof that every component is fully RTL-verified.

`AddBluentUI()` registers localization. Configure application culture through normal ASP.NET Core/Blazor mechanisms; Bluent consumes the active culture and packaged resources.

Persian-specific note: `TextField` source currently exposes `ArabicToPersianConversion`, `DigitOnly`, and `AsciiDigits`, but its canonical component page is still pending. Verify those APIs against the installed package/current source before using them in consumer code.

For date/time parsing, localized strings, calendar behavior, or dynamic culture changes, inspect the exact component source/reference and do not generalize from the cross-cutting guide.
