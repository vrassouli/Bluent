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

- actions and basic inputs: [Badge](badge.md), [Button](button.md), [ButtonGroup](button-group.md), [Checkbox](checkbox.md), [Link](link.md), [Switch](switch.md), and [RadioGroup](radio-group.md);
- fields and selection: [TextField](text-field.md), [NumericField](numeric-field.md), [DateField](date-field.md), [TimeField](time-field.md), [SelectField](select-field.md), [MaskedField](masked-field.md), [OtpField](otp-field.md), [DropdownSelect](dropdown-select.md), [DropdownList](dropdown-list.md), and [FileSelect](file-select.md);
- pointer/range input: [Slider](slider.md) and [RangeSlider](range-slider.md);
- overlays and feedback: [Dialog](dialog.md), [Drawer](drawer.md), [Popover](popover.md), [Overlay](overlay.md), [MessageBar](message-bar.md), [Toast](toast.md), the inherited [Tooltip capability](tooltip.md), plus shared [Containers](containers.md) infrastructure;
- navigation and overflow: [NavList](nav-list.md), [Menu/MenuList](menu.md), [TabList](tab-list.md), and abstract [Overflow](overflow.md) composition;
- layout/responsive: [Stack](stack.md), [Spacer](spacer.md), [SplitPanel](split-panel.md), [DockPanel](dock-panel.md), [MediaQuery](media-query.md), and [TileLayout](tile-layout.md).

Families not linked from the maintained [inventory](inventory.md) remain intentionally unverified; inspect current source/demo rather than inferring APIs from names.

## Current status

The reconciled inventory currently tracks 75 families/types across `Bluent.UI`, Charts, Diagrams, and Utilities. The main UI ledger contains 56 component families, of which 36 have source-verified canonical references; Dialog additionally retains separately recorded runtime verification.

The inventory changed from the earlier 71-item baseline after source discovery found public main-UI component directories that were absent from the old ledger: `DropdownList`, `Link`, `TileLayout`, and `Tooltip`. All four now have canonical source-verified coverage. `Containers` is classified as cross-component infrastructure rather than an ordinary family row.

A demo page or source file does not count as completed documentation. A reference progresses from draft to source verified, then runtime verified, using the status definitions in the inventory. High-risk JS/pointer/keyboard behavior remains explicitly marked as requiring runtime evidence where applicable.
