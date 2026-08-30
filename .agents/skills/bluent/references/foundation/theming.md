# Theming

Canonical source: `docs/guides/theming-localization-rtl-and-assets.md`.

Bluent theme bundles provide design tokens; the component bundle provides component styles. Use exactly one packaged theme family link plus `bluent.ui.components.min.css` in the standard setup.

Current packaged theme families documented by the canonical guide include default, excel, office, outlook, powerapps, powerbi, powerpoint, stream, teams and word.

Light/dark mode uses the document-root `data-bui-theme` value (`light` or `dark`). Runtime changes are made through `IBluentTheme`; do not invent CSS-class toggles when the canonical theme API is available.

Treat theme-family switching, persistence, CSP and first-render behavior exactly as documented by the canonical guide. Do not present internal selectors as a stable public contract.
