# #552 Wave D — cross-component Icon / control ARIA source evidence

**2026-10-20. 2.x source-current real Blazor WebAssembly Chrome/Edge observation. No product, demo, Penpot, Figma or public API changes. Not Fluent parity nor real native OS/screen-reader signoff.** Extends Button [hover/toggle accessible-name finding](FLUENT-PARITY-BUTTON-TOGGLE-STATES.md) across unrelated host controls; the public 18-pilot acceptance ledger is **not** updated or approved by this broader exploratory spot-check.

## Source provenance and exact reproducible actions

- Read actual existing demo files `Menus.razor`, `TabLists.razor`, `NavLists.razor` and `Accordions.razor` and their original `.razor` / `.razor.cs` components, from source at `fdd77bca`. With the original .NET 10 WebAssembly Debug demo hosted unchanged, the self-contained quality script uses disposable **actual Chromium engines** and CDP `Input.dispatchMouseEvent` for hover and native pointer click.
- Reproduce: `node scripts/quality/probe_v3_cross_component_icons.mjs chrome`; then `edge`. Both tested Light/LTR, Dark/RTL, and **Chromium Forced Colors emulation**. No synthetic DOM role/ARIA changes were made, no non-target browser processes terminated, and isolated profiles were deleted.
- **36/36 Chrome + 36/36 Edge = 72/72 fixture/DOM/state assertions**, 12 captured cases per engine. They are **not** parity/a11y passes; they anchor the observed current gaps. Each case contains initial/hoved/pointer-click source DOM + browser partial AX and one real screenshot.

## Findings that should stay with the correct component owners

| Original source specimen | Real native interaction / source behavior | Chrome + Edge Accessibility Tree finding | Owner |
| --- | --- | --- | --- |
| TabList Size/Small, icon-labeled **First Tab** | Initially selected; real pointer selects **Second Tab** then returns to **First Tab**; the `selected` CSS class tracks actual selection | Native `button` role, not `tab`; **no `aria-selected`**, and accessible name starts with a PUA icon-font character followed by `First Tab` | [TabList #465](https://github.com/vrassouli/Bluent/issues/465), shared Icon #429 |
| NavList, expandable **Components** | Real pointer click changes original wrapper from `expandable` to `expandable expanded`; filled icon appears on Hover | Clickable **div** exposed as `generic`, with empty root accessible name; no intrinsic `role=button` or `aria-expanded` state; original nested descendants remain distinct, not a control name | [NavList #466](https://github.com/vrassouli/Bluent/issues/466), shared #420/#429 |
| Accordion, **Accordion header 1** | Real pointer click adds original parent `accordion-panel expanded`; content actually expands | Clickable **div.header** exposed as `generic` with empty accessible name; no native button role and no `aria-expanded` for header | [Accordion #469](https://github.com/vrassouli/Bluent/issues/469) + [AccordionPanel #507](https://github.com/vrassouli/Bluent/issues/507) |
| MenuList / **Disabled Items** example: icon-labeled **Undo** | Original element is `<div class="menu-item disabled" disabled>`; inactive Filled glyph, Regular shown (including Hover) | Non-interactive **generic** role with empty name and **no exposed disabled AX property**; `disabled` HTML attribute on a `div` does not confer native button/menu-item semantics | [MenuItem #517](https://github.com/vrassouli/Bluent/issues/517), parent MenuList / #420 |

The TabList finding **does not mean click selection is broken**; Accordion and NavList also expand on mouse click. An apparent disabled visual class is **not equivalent** to exposing accessible disabled state. No test in this pass proves keyboard Tab/Enter/Space support, that a disabled item cannot trigger a click, or how a physical screen reader speaks a nested subtree.

## Source-backed screenshot and machine evidence

| Original demo case (Light/LTR) | Chrome screenshot | Edge screenshot |
| --- | --- | --- |
| Disabled MenuItem | [PNG](evidence/BLUENT-CROSS-ICON-CHROME-LIGHT-LTR-MENU.png) | [PNG](evidence/BLUENT-CROSS-ICON-EDGE-LIGHT-LTR-MENU.png) |
| Selected TabList | [PNG](evidence/BLUENT-CROSS-ICON-CHROME-LIGHT-LTR-TAB.png) | [PNG](evidence/BLUENT-CROSS-ICON-EDGE-LIGHT-LTR-TAB.png) |
| Expanded NavList | [PNG](evidence/BLUENT-CROSS-ICON-CHROME-LIGHT-LTR-NAV.png) | [PNG](evidence/BLUENT-CROSS-ICON-EDGE-LIGHT-LTR-NAV.png) |
| Expanded Accordion | [PNG](evidence/BLUENT-CROSS-ICON-CHROME-LIGHT-LTR-ACCORDION.png) | [PNG](evidence/BLUENT-CROSS-ICON-EDGE-LIGHT-LTR-ACCORDION.png) |

Also recorded eight original screenshots for Dark/RTL and Forced Colors, and complete [Chrome DOM/AX + actual pointer transitions](evidence/BLUENT-CROSS-ICON-CHROME.json) / [Edge DOM/AX + actual pointer transitions](evidence/BLUENT-CROSS-ICON-EDGE.json). The JSON includes selected state from click-second/click-first, accordion ancestor expansion, nav class changes, observed icon glyph variation, and concrete AX roles/names; screenshots alone are not used to infer semantic roles.

## Design-first handoff

- **#465 TabList**: approve native tablist/tab/tabpanel accessibility structure, `aria-selected` state, roving tab-focus/keyboard and decorative icon names, then implement and validate all sizes/themes/RTL/render modes.
- **#466 NavList**: choose expandable disclosure vs navigation-item semantics on an actual actionable element, keyboard and focus behavior, contextual accessible name, `aria-expanded` linked to actual content. Do not simply assign role=button to a whole wrapper containing nested links (nested controls/ARIA architecture must be designed first).
- **#469 / #507 Accordion**: native disclosure semantics and focusable/keyboard-operable header with meaningful name and expanded state; coordinate nested header actions so events do not fire the wrong control.
- **#517 MenuItem**: choose menu/list control role and tested disabled semantics, keyboard behavior and checked state; a plain div disabled attribute is not enough. Keyboard navigation and parent popup constraints must be designed with MenuList.
- **#429 / #420**: decorative vs informative Icon semantics across all consumers; no blanket ARIA override of caller intent, avoid private-use glyph leakage. Keep design approvals and implementations in **their respective owner branches**, not in PR #553.

**Not tested**: approved current Fluent 2 same-state reference, actual native screen readers, Firefox/Safari, production-published InteractiveServer, actual Windows Contrast Theme settings or mobile AT. **Workflow** #552 In progress, PR #553 Draft; product issue lifecycle unchanged, stable `Dev` untouched.
