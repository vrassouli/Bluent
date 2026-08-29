# Component documentation

Bluent component documentation is developed from a source-derived inventory and a shared reference standard. This directory is the canonical API/behavior reference surface; the consumer skill routes here rather than duplicating the catalog.

## Start here

- [Public component inventory and coverage](inventory.md)
- [Component reference template](TEMPLATE.md)
- [Consumer skill component index](../../.agents/skills/bluent/COMPONENT-INDEX.md)
- [Getting Started](../getting-started/index.md)
- [Package selection and boundaries](../packages/index.md)
- [Hosting models and render modes](../compatibility/hosting-and-render-modes.md)
- [Theming, localization, RTL, and browser assets](../guides/theming-localization-rtl-and-assets.md)

## Source-verified main UI references

Current canonical coverage includes:

- actions/basic content: [Badge](badge.md), [Button](button.md), [ButtonGroup](button-group.md), [Checkbox](checkbox.md), [Link](link.md), [Card](card.md), [Avatar](avatar.md), [Tag](tag.md), [Switch](switch.md), and [RadioGroup](radio-group.md);
- fields and selection: [TextField](text-field.md), [NumericField](numeric-field.md), [DateField](date-field.md), [TimeField](time-field.md), [SelectField](select-field.md), [MaskedField](masked-field.md), [OtpField](otp-field.md), [DropdownSelect](dropdown-select.md), [DropdownList](dropdown-list.md), and [FileSelect](file-select.md);
- list/data: [ItemsList/ListItem](list.md), [DataList](data-list.md), [DataGrid](data-grid.md), [DataPager](data-pager.md), and [Tree](tree.md);
- pointer/range input: [Slider](slider.md) and [RangeSlider](range-slider.md);
- overlays and feedback: [Dialog](dialog.md), [Drawer](drawer.md), [Popover](popover.md), [Overlay](overlay.md), [MessageBar](message-bar.md), [Toast](toast.md), [ProgressBar](progress-bar.md), [Spinner](spinner.md), [Skeleton](skeleton.md), the inherited [Tooltip capability](tooltip.md), plus shared [Containers](containers.md) infrastructure;
- navigation and overflow: [NavList](nav-list.md), [Menu/MenuList](menu.md), [TabList](tab-list.md), [Toolbar](toolbar.md), and abstract [Overflow](overflow.md) composition;
- layout/responsive: [Stack](stack.md), [Spacer](spacer.md), [SplitPanel](split-panel.md), [DockPanel](dock-panel.md), [MediaQuery](media-query.md), and [TileLayout](tile-layout.md);
- primitives/metadata: typed [Icon](icon.md) and [Label](label.md).

Families not linked from the maintained [inventory](inventory.md) remain intentionally unverified; inspect current source/demo rather than inferring APIs from names.

## Current status

The source-reconciled inventory currently tracks 76 families/types across `Bluent.UI`, Charts, Diagrams, and Utilities. The main UI ledger contains 57 component families, of which 50 have source-verified canonical references; Dialog additionally retains separately recorded runtime verification.

The inventory grew from the earlier 71-item baseline after source discovery found public main-UI component families absent from the old ledger: `DropdownList`, `Link`, `TileLayout`, `Tooltip`, and `DataList`. All five now have canonical source-verified coverage. `Containers` is classified as cross-component infrastructure rather than an ordinary family row.

Seven main-UI families remain without source-verified canonical pages: `Accordion`, `ActionCard`, `AudioCapture`, `Breadcrumb`, `Calendar`, `PropertyEditor`, and `Wizard`.

A demo page or source file does not count as completed documentation. A reference progresses from draft to source verified, then runtime verified, using the status definitions in the inventory. High-risk JS/pointer/keyboard behavior remains explicitly marked as requiring runtime evidence where applicable.
