# #552 Wave A: actual Bluent Icon #429 browser and accessibility checkpoint

**2026-10-20 · source-owned audit branch · current 2.x implementation / existing public demo**. Scope is **live Blazor WebAssembly browser observation** of the real `/components/icons` page; this is not a Fluent Web Components or React same-state comparison, nor a product fix or OS/AT signoff.

## Reproduction and provenance

- **Original source:** `src/Bluent.UI/Components/IconComponent/Icon.cs`, `src/Bluent.UI/Icons/IconDefinition.cs`, and `src/Bluent.UI.Demo.Pages/Pages/Components/Icons.razor`, base checked out at [`1b023a5c`](https://github.com/vrassouli/Bluent/commit/1b023a5c).
- Build: actual `dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug` on .NET 10.0.401: **0 warnings / 0 errors**; real `dotnet run --no-build` hosts, not mock DOM or a standalone HTML reproduction.
- Browser probe: `node scripts/quality/probe_v3_icon_browser.mjs chrome` and `node scripts/quality/probe_v3_icon_browser.mjs edge`; disposable local port + unique temporary Chrome/Edge user-data profiles, explicitly terminated and deleted. Tested real browser engines with CDP DevTools.
- Real scenarios per engine: Light/LTR, Dark/RTL (document `data-bui-theme` and `dir`), and Chromium `forced-colors:active` + `prefers-contrast:more` **emulation**. This is **not** Windows OS Contrast Themes, physical device rendering, or native browser zoom.
- Each engine yielded **15/15 positive checks PASS** for fixture/mode, distinct bundled Regular/Filled font glyph classes with loaded CSS font, SVG path present, custom image URL loaded, and a Save Button retaining both text and icon. Total **30/30** source-render and fixture assertions. This count does **not** mean 30 a11y or parity passes; the defects below are *measured observations*, not tests that incorrectly assert their absence.

## Recorded actual source render findings (both engines, all 3 scenarios)

| Input / anatomy | Browser measurement and output | Classification / owner |
| --- | --- | --- |
| `Settings` Regular | real `i.bui-icon.icon-ic_fluent_settings_20_regular`, font `FluentSystemIcons-Resizable`, glyph `::before` content PUA codepoint, bounding **28×31 CSSpx** | Existing supported form; matched Fluent visual size/shape not yet assessed |
| `Settings` Filled | distinct `i.bui-icon.icon-ic_fluent_settings_20_filled`, same font and **28×31 CSSpx**, distinct `::before` PUA glyph | Existing supported form; not a full upstream variant/asset audit |
| Custom SVG | **Real defect in original demo:** `<Icon Style="width: 32px; height: 32px;" Value="@CustomSvgIcon"/>` produces an inline `span.bui-icon` with requested CSS width/height but the unbounded child `svg` paints at **377×377 CSSpx**. The inline span reports a layout box of **377×16 CSSpx**; its own width/height styles do not size the SVG. Reproduced in Chrome **and** Edge in Light, Dark/RTL and Forced Colors. | **#429** visual sizing/overflow bug; investigate SVG `width/height`, display model and untrusted/custom markup sizing, then design-approved component-owned fix |
| Custom image | Original `<Icon Value="@PowerPointIcon" Style="width: 32px; height: 32px;" />` resolves; `img.bui-icon` box **32×32 CSSpx** and `naturalWidth>0`. **It has no `alt`**: Chromium partial AX tree reports an exposed `image` node with an **empty accessible name**. | **#429** accessibility default/decorative-vs-informative-image semantics needs policy; also demo should supply intentional accessible labeling |
| Button with Save icon | Real Button retains `Save` text and icon; presence verified. | No claim of icon/text pixel alignment or keyboard/AT approval on this new run |

Captured `Accessibility.getPartialAXTree` gives `generic` with empty name for each standalone Regular/Filled/SVG root, and exposed `image` with empty name for Image. **Partial browser AX is not a screen-reader test**; do not infer that a font glyph is always silent or that every icon should expose its own name. Icon-only controls should get contextual accessible names on the **control**, not rely on PUA glyphs; decorative icons should be hidden according to the eventual #420/#429 policy.

### Real screenshots and numeric browser captures

| Mode | Chrome | Edge |
| --- | --- | --- |
| Light/LTR | [Chrome screenshot](evidence/BLUENT-ICON-CHROME-LIGHT-LTR.png) | [Edge screenshot](evidence/BLUENT-ICON-EDGE-LIGHT-LTR.png) |
| Dark/RTL | [Chrome screenshot](evidence/BLUENT-ICON-CHROME-DARK-RTL.png) | [Edge screenshot](evidence/BLUENT-ICON-EDGE-DARK-RTL.png) |
| CSS Forced Colors emulation | [Chrome screenshot](evidence/BLUENT-ICON-CHROME-FORCED-COLORS.png) | [Edge screenshot](evidence/BLUENT-ICON-EDGE-FORCED-COLORS.png) |

[Chrome raw DOM/CSS/AX JSON](evidence/BLUENT-ICON-CHROME-BROWSER.json) · [Edge raw DOM/CSS/AX JSON](evidence/BLUENT-ICON-EDGE-BROWSER.json). Screenshots are real Chromium captures, not edited artwork. The screenshot viewport is 1240×960 CSSpx. The measured overlarge SVG may extend beyond the current viewport; the numeric SVG rectangle is preserved independently.

## Owner decision and remaining work

1. Keep product code unmodified in **audit-only PR #553**. The existing **#429** issue owns the SVG sizing correction, image/decorative icon ARIA default, safe custom SVG handling, and final public Color variant decision. Do not create duplicate product issues or advance its **Backlog** status without design-first Ready prerequisites.
2. Agree the wrapper/SVG sizing contract with #420 and an editable **Bluent v3 Penpot** component design. Test explicit vs implicit sizes, icon-only Buttons, labels, modern Fluent SVG icon assets, 16/20/24/28 sizes, RTL direction, dark tokens, Forced Colors and 320px.
3. Native NVDA/JAWS/VoiceOver/TalkBack, real Windows Contrast Themes, **published InteractiveServer**, same-state Fluent reference screenshot parity, and the official upstream exact icon-package snapshot are **not** verified by this step. Avoid counting this as #429 Done, Fluent visual parity, a native AT pass, or an approved Color API.
4. The source-only [Icon variant audit](FLUENT-PARITY-ICON-VARIANTS.md) remains separate from this **live browser** evidence. `python -m unittest discover -s scripts/quality -p test_v3_icon_browser_evidence.py -v` only guards recorded observations and source provenance; CI does **not** launch browsers.

**Status:** #552 In progress · PR #553 Draft · #429 product owner Backlog · no edits to stable `Dev` or released 2.x packages.
