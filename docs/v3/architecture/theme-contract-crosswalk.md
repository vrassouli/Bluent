# Bluent v3 — theme/token contract crosswalk (Issue #417)

> **Status:** source- and package-verified **design research**, not an approved styling ADR, public v3 token API, Fluent parity claim or a #418 implementation.
>
> **Design evidence:** [Bluent v3 Figma CSS/token decision matrix — frame `14:3`](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) on page `14:2`. The earlier [foundation research frame `2:2`](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=2-2) remains a draft. **Read-only reference:** [Microsoft Fluent 2 Web (Community)](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD); Button example source node `9026:639`. Figma is the authorized fallback because the connected Penpot file is **PuyaStudio Runner**, not Bluent.

## Source of truth

- CSS source: `src/Bluent.UI/Styles/Themes/theme-default-{light,dark}.scss`, `Styles/Themes/theme/{light-theme,dark-theme}.scss`, `Styles/Themes/theme/{light,dark}/brand-palette.scss`, `Styles/Components/{_button,_field,_overlay}.scss`.
- Compiled input evidence: `src/Bluent.UI/Styles/Themes/theme-default-{light,dark}.css`. Token values were read directly from these emitted files, **not** copied from upstream Fluent examples.
- Build/config: `src/Bluent.UI/bundleconfig.json`, `src/Bluent.UI/Bluent.UI.csproj`, `src/Bluent.UI/wwwroot/`.
- Repeatable contract checker: `python scripts/quality/check_v3_theme_contract.py`. It verifies the theme bundle inventory declared by `bundleconfig.json`, **both scoped selectors per brand**, nine representative tokens per light/dark mode, the minified output presence, and uniqueness of branded theme hashes. It is source/static packaging evidence only; it cannot verify contrast, browser layout, Figma parity or NuGet consumer compatibility.
- Repeatable lexical audit: `python scripts/quality/audit_v3_css.py --json`.

## Verified current contract: default brand

| Token | Light | Dark | Architectural role |
| --- | --- | --- | --- |
| `--colorNeutralBackground1` | `#ffffff` | `#292929` | Surface/background candidate |
| `--colorNeutralForeground1` | `#242424` | `#ffffff` | Default foreground |
| `--colorNeutralStroke1` | `#d1d1d1` | `#666666` | Subtle border |
| `--colorNeutralStrokeAccessible` | `#616161` | `#adadad` | More prominent field/interactive stroke |
| `--colorBrandBackground` | `#1267B4` | `#18599B` | Brand-emphasis background |
| `--colorBrandForeground1` | `#1267B4` | `#4F82C8` | Brand-emphasis foreground |
| `--spacingHorizontalM` | `12px` | `12px` | Horizontal rhythm |
| `--borderRadiusMedium` | `4px` | `4px` | Control corners |
| `--durationFaster` | `100ms` | `100ms` | Short transition duration |

The existing default emitted SCSS scopes theme declarations under `[data-bui-theme=light]` and `[data-bui-theme=dark]`. Other brand bundles have their **own** generated palette even where file sizes are identical: ten minified brand bundles each weigh **166,423 bytes** in the measured source build, but **all ten SHA-256 values differ**. The default `bluent.ui.components.min.css` is **117,963 bytes**. These are local source/build figures, not published-size guarantees.

**Known branded themes from `bundleconfig.json`:** default, excel, office, outlook, powerapps, powerbi, powerpoint, stream, teams, word.

### Observed component use (source-verified)

| Component | Contract consumed | Observed literal or exception | Decision for #417 |
| --- | --- | --- | --- |
| Button | `--colorNeutralBackground1`, `--colorNeutralForeground1`, `--spacingHorizontalSNudge`, `--spacingHorizontalM`, `--borderRadiusMedium`, `--durationFaster` | Normal padding `5px`, icon glyph geometry `20px`, icon-only minimum width `32px` | Preserve existing API and CSS classes; test a **draft** component alias layer before altering sizes/density |
| Field | `--colorNeutralStroke1`, `--colorNeutralStrokeAccessible`, `--fontSizeBase300`, `--lineHeightBase300` | Existing `--fui-text-field-*` local aliases and sizes 24/32/40px | Keep private aliases until final naming decision; test validation line, disabled, focus/RTL |
| Overlay | `--zIndexOverlay`, `--durationGentle`, `--curveEasyEase` | Fixed positioning and literal `rgba(0,0,0,0.4)` scrim | Scope portal/theme behavior; assess accessibility/reduced motion and stacking |
| Shared components | `:root` declares 8 global `--zIndex*` variables | Global stacking contract currently shared with consumers | Migrate only with a protected compatibility bridge and documented integration order |

## Four draft decisions (synchronized to Figma board)

**D1 — Token bridge:** avoid renaming or removing working `--colorNeutral*`, `--spacing*`, `--borderRadius*`, `--duration*` values prematurely. Propose a staged private/component alias scheme while retaining existing semantics. Actual v3 tokens, design variables, light/dark and high-contrast mode tables, and API decisions belong to **#418**, not this audit.

**D2 — Theme boundaries:** preserve existing `[data-bui-theme]` scoping until tested. Nested themes can diverge from dialogs/overlays mounted in a portal outside their DOM subtree; verify how services pass the authoritative theme to overlay roots across Blazor WASM and SSR/interactive modes. Distinguish true theme inheritance from apparent screenshot matches.

**D3 — Cascade layers:** do **not** globally introduce `@layer` to all Bluent CSS now. Ordinary unlayered declarations outrank layered declarations in the normal cascade; transition would change consumer override behavior. Validate an opt-in layer strategy against legacy `!important`, specificity, custom theme CSS and third-party utility ordering **before** adoption.

**D4 — Bootstrap and bundling:** retain current Bootstrap **Sass** build-time grid/utility/breakpoint dependencies and branded static asset paths until a behavioral, selector, size and RTL parity report exists. The `Styles/Themes/styles.scss` import chain and `_drawer.scss` are confirmed dependencies. Do not assume Bootstrap JS is an obligatory runtime dependency from Sass imports alone.

## Package and migration checkpoint (Dev01)

`dotnet pack src/Bluent.UI/Bluent.UI.csproj -c Release --no-build -o <temporary directory>` **succeeded** on 2026-10-10. The generated **local, unpublished** `Bluent.UI.1.0.0.nupkg` contained **46 entries**, size **2,276,358 bytes**, including `README.md`, `Bluent.UI.nuspec`, `staticwebassets/bluent.ui.components.min.css` (**117,963 bytes**) and `staticwebassets/bluent.ui.theme.default.min.css` (**166,423 bytes**). The output went only into the Dev01 temporary directory. This is **not** a NuGet release, deployment, or comparison with the current published 2.x package.

For migration issue #424, record any changed CSS asset path, utility class, selector, token, component default, density, or overlay layering behavior as a table with old behavior, new behavior, breaking impact, and a verified replacement. Retain existing public 2.x intact while v3 is being designed.

## Acceptance gaps

- [x] Source-driven baseline CSS dependency inventory and reproducible scripts.
- [x] Actual Figma token/cascade design **research** board with verified palette values; screenshot reviewed, dark-mode label contrast fixed.
- [x] Compiled light/dark token crosswalk for default brand, 10 brand output checks, and isolated NuGet **pack** baseline.
- [ ] Approve the D1–D4 decisions; until approval they are candidate architecture, not commitments.
- [ ] Verify portal-mounted overlays and nested theme propagation in the intended render modes.
- [ ] Exercise keyboard focus, forced-colors/high-contrast, reduced motion and minimum interactive targets on a real browser.
- [ ] Record candidate cascade-layer specificity and consumer CSS precedence proofs (including `!important`).
- [ ] Demonstrate migration for grid/utility classes and lock equivalent CSS bundle size targets.
- [ ] Map the component styling-lab DOM/screenshots to the **reviewed** Figma design, not only to source values.

Do **not** move #417 to Review/Done until the missing gates and the ADR approval have evidence attached to its draft PR.
