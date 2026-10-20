# #552 Wave B — actual Button #428 icon alignment and accessible-name experiment

**2026-10-20. Real unchanged 2.x Blazor WebAssembly Button demo, isolated v3 audit branch. Evidence only; no product code changes, design acceptance, or Fluent component parity.**

## Executed in original component, not a mock

Actual `src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor` `Size` groups were exercised under `dotnet run --no-build` after verified .NET 10 Debug build. The source Button component is `src/Bluent.UI/Components/ButtonComponent/Button.razor` and its styling is `_button.scss`. Temporary Chrome and Edge processes and unique browser profiles were cleaned up. Run `node scripts/quality/probe_v3_button_icon_alignment.mjs chrome`, then `edge`, for unchanged source. Add the explicit `semantic-candidate` argument for the **browser-only** ARIA experiment; it restores all attributes before screenshots and never modifies the Blazor component or its CSS.

Each browser × Light/LTR, Dark/RTL, Chromium Forced Colors emulation inspected the **three actual sizes** and their `text-only`, `icon-with-text`, and `icon-only` sibling Buttons. Sources are below; the emulated CSS media is not an actual Windows OS Contrast Themes or assistive technology session.

| Current Bluent specimen | Native button box (CSSpx) | Regular icon glyph element | Text line box | Icon/text box center-Y difference |
| --- | ---: | ---: | ---: | ---: |
| Small icon-only | 24×24 | 16×16 | n/a | n/a |
| Medium icon-only | 32×32 | 20×20 | n/a | n/a |
| Large icon-only | 40×40 | 22×22 | n/a | n/a |
| Small icon + text | native width from content | 16×16 | 16px tall | **0px** |
| Medium icon + text | native width from content | 20×20 | 20px tall | **0px** |
| Large icon + text | native width from content | 22×22 | 22px tall | **0px** |

All these source DOM **box center differences were 0px**, reproduced on both engines in all three modes. This proves **flex-box geometry**, not visual ink centering or pixelwise reference appearance. **Do not report a fresh icon-text vertical alignment bug from these measurements**; visual glyph ink/optical alignment still needs screenshot/Figma reference signoff.

## Reproduced browser accessibility gap affecting BOTH kinds of Button

- The original unmodified `icon-only` Buttons have `aria-label=null`, `title=null`, and native Chromium partial AX `role=button` with accessible name solely U+E60F, a **private-use Unicode icon-font glyph**. All three sizes and three modes reproduce in **both Chrome and Edge**; this is not a usable task-specific accessible name.
- The original `icon-with-text` Button has a name prefixed with the same private-use glyph, e.g. U+E60F followed by `Small with icon`; the text-only neighbor has the clean `Small` name. The icon glyph is contaminating accessible text as well as naming icon-only controls.
- Existing `Button.razor` renders both `<Icon Class="active-icon" />` and `<Icon Class="icon" />` when the definition has Filled; the visible regular glyph currently enters accessible-name computation; hidden Filled DOM variants remain a separate state to verify on hover/toggle. Owner **#428**, with component-specific icon policy coordinated through **#429/#420**. Do not invent new duplicate product issues.

## Browser-only ARIA candidate, explicitly NOT the product default

Only inside the temporary browser, add `aria-hidden="true"` to the **two icon children** (regular and filled) and set an illustrative contextual `aria-label="Cursor-click example"` on icon-only **Button**. Real Chromium AX then reports clean `Small with icon` / `Medium with icon` / `Large with icon` and `Cursor-click example` for the icon-only control. Remove the test attributes immediately and verify the original PUA-based AX names return; screenshots are of restored original DOM.

Checks: **Chrome 45/45 + Edge 45/45** positive fixture, geometry, AX candidate and restoration assertions, across 3 modes × 3 size rows. They include an **intentional** reproduction of the current missing semantics; green checks are **not** evidence that the product is fixed. Actual native OS screen-reader NVDA/JAWS and all render modes remain untested.

## Reproducible source evidence

| Scenario | Chrome actual-source screenshot | Edge actual-source screenshot |
| --- | --- | --- |
| Light / LTR | [PNG](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME-LIGHT-LTR.png) | [PNG](evidence/BLUENT-BUTTON-ICON-ALIGN-EDGE-LIGHT-LTR.png) |
| Dark / RTL | [PNG](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME-DARK-RTL.png) | [PNG](evidence/BLUENT-BUTTON-ICON-ALIGN-EDGE-DARK-RTL.png) |
| CSS Forced Colors emulation | [PNG](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME-FORCED-COLORS.png) | [PNG](evidence/BLUENT-BUTTON-ICON-ALIGN-EDGE-FORCED-COLORS.png) |

Full [Chrome DOM/AX original](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME.json) and [Edge original](evidence/BLUENT-BUTTON-ICON-ALIGN-EDGE.json), with separate [Chrome semantic candidate](evidence/BLUENT-BUTTON-ICON-ALIGN-CHROME-SEMANTIC-CANDIDATE.json) and [Edge semantic candidate](evidence/BLUENT-BUTTON-ICON-ALIGN-EDGE-SEMANTIC-CANDIDATE.json). The candidate runs also capture 3 additional PNGs per browser; no byte changes were made to the underlying Blazor source.

## Owner handoff and acceptance boundaries

1. **#428** should implement an accessible naming contract for icon-only Buttons, including a documented required contextual name or reliable validation, and hide purely decorative icon glyphs from AX for Buttons with adjacent text. Respect caller-supplied `AdditionalAttributes` precedence under #420; do not derive accessible name from icon's catalog identifier or PUA glyph. Consider populated tooltip vs actual control name separately.
2. **#429** should supply consistent source-kind (font/SVG/image) decorative semantics as part of its component contract, with an opt-in informative policy for genuinely meaningful standalone images. Do not blanket-hide all `Icon` uses without considering semantics.
3. Add design owner Penpot/Figma evidence once actually connected. **Penpot currently points to unrelated PuyaStudio Runner and Figma Starter tool call limit blocked inspection**; no editable Icon/Button board was changed or approved.
4. Validate final implementation in **Chrome/Edge + released host scenarios (WASM/InteractiveServer), actual Windows contrast/AT, keyboard and content localization**, and reference Fluent 2 optical alignment on accepted designs. An unchanged-source browser-positive QA report cannot close #428/#429.

**Status:** #552 In progress / PR #553 Draft; component owner issues remain Backlog (unless a separate reviewed issue status changes); product stable `Dev` untouched.
