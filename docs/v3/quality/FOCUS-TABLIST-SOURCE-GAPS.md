# #552 / #465 — TabList source-level keyboard and ARIA gap audit

Status: **source evidence only / not a Fluent parity acceptance**. Owner: #465; cross-cutting architecture: #420; audit: #552. Product implementation and design approval are out of scope for this report.

## Reviewed sources

- `src/Bluent.UI/Components/TabListComponent/TabList.razor`
- `src/Bluent.UI/Components/TabListComponent/TabList.razor.cs`
- `src/Bluent.UI/Components/TabListComponent/TabListTabItem.razor`
- `src/Bluent.UI/Components/TabListComponent/TabListTabItem.razor.cs`

## Concrete findings

| Finding | Direct source evidence | Owner/gate |
| --- | --- | --- |
| No built-in roving keyboard focus | Tab item render attaches `onclick`, but no `onkeydown` or focus handler. The parent exposes `SelectedIndex` and `SelectTab`, not a separate focused tab index. | #465 / design-first |
| Panel tab semantics not emitted by the component | Parent renders generic `div.header`, `div.panels`, and `div.tab-panel`. Tab item renders native `button` (or `a`) and emits neither `role=tab`, `aria-selected` nor managed `tabindex`. | #465 / AX and browser evidence |
| Selected panel lacks a generated accessible relationship | No matching tab/panel generated IDs, `aria-controls`, or `aria-labelledby` emitted; `SelectedTab` only drives the CSS class. | #465 / design + AX |
| Link and panel tab paths differ | `Href` switches a tab item from a `button type=button` to `a href`; location updates call `SelectTab` or `DeselectTab`. A navigation link must not be indiscriminately assigned `role=tab`. | #465 / decide link grouping separately |
| Index is not stable identity | Parent stores `_tabItems` and `_tabs` separately, selects by integer index and on removal only removes entries and rerenders. Reorder/removal restoration needs an explicit logical-item policy. | #465 / #420 |
| Provided attributes are a separate path | Both components accept `AdditionalAttributes`, so consumers can manually supply some ARIA/keyboard metadata. This does **not** establish managed, coherent component defaults. | verify rendered DOM; do not claim impossible customization |

## Next evidence gates

1. Obtain reviewed Penpot design for #420 focus ownership and #465 TabList role/activation model.
2. Test actual product DOM in InteractiveServer and WASM: native Tab/Shift+Tab, arrows in LTR/RTL, selection vs focus, disabled/removal/reorder, navigation links, deferred panel focus, and aria tree.
3. Record Chrome/Edge screenshots, real accessibility tree, contrast/forced-colors, and OS screen-reader manual checks separately.
4. Remediate only under owner #465, then re-run and link evidence here. Keep all 33 existing acceptance cases `planned` until product tests actually run.

This audit is a reproducible static finding, **not** a product change, browser PASS, screen-reader certification, design signoff or completion of #552.
