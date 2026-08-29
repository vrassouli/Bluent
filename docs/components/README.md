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

## Main UI coverage

All 57 currently tracked `Bluent.UI` component families now have source-verified canonical references. The maintained [inventory](inventory.md) remains the authoritative coverage ledger.

Coverage includes:

- actions/basic content: [Accordion](accordion.md), [ActionCard](action-card.md), [Avatar](avatar.md), [Badge](badge.md), [Button](button.md), [ButtonGroup](button-group.md), [Card](card.md), [Checkbox](checkbox.md), [Link](link.md), [Tag](tag.md), [Switch](switch.md), and [RadioGroup](radio-group.md);
- fields/selection/capture: [TextField](text-field.md), [NumericField](numeric-field.md), [DateField](date-field.md), [TimeField](time-field.md), [Calendar](calendar.md), [SelectField](select-field.md), [MaskedField](masked-field.md), [OtpField](otp-field.md), [DropdownSelect](dropdown-select.md), [DropdownList](dropdown-list.md), [FileSelect](file-select.md), and [AudioCapture](audio-capture.md);
- list/data: [ItemsList/ListItem](list.md), [DataList](data-list.md), [DataGrid](data-grid.md), [DataPager](data-pager.md), [Tree](tree.md), and [PropertyEditor](property-editor.md);
- pointer/range input: [Slider](slider.md) and [RangeSlider](range-slider.md);
- overlays/feedback: [Dialog](dialog.md), [Drawer](drawer.md), [Popover](popover.md), [Overlay](overlay.md), [MessageBar](message-bar.md), [Toast](toast.md), [ProgressBar](progress-bar.md), [Spinner](spinner.md), [Skeleton](skeleton.md), the inherited [Tooltip capability](tooltip.md), plus shared [Containers](containers.md) infrastructure;
- navigation/workflow/overflow: [Breadcrumb](breadcrumb.md), [NavList](nav-list.md), [Menu/MenuList](menu.md), [TabList](tab-list.md), [Toolbar](toolbar.md), [Wizard](wizard.md), and abstract [Overflow](overflow.md) composition;
- layout/responsive: [Stack](stack.md), [Spacer](spacer.md), [SplitPanel](split-panel.md), [DockPanel](dock-panel.md), [MediaQuery](media-query.md), and [TileLayout](tile-layout.md);
- primitives/metadata: typed [Icon](icon.md) and [Label](label.md).

## Current status

The source-reconciled inventory currently tracks 76 families/types across `Bluent.UI`, Charts, Diagrams, and Utilities. Main UI coverage is 57/57 source verified; Dialog additionally retains separately recorded runtime verification.

The inventory grew from the earlier 71-item baseline after source discovery found public main-UI component families absent from the old ledger: `DropdownList`, `Link`, `TileLayout`, `Tooltip`, and `DataList`. All five now have canonical source-verified coverage. `Containers` is classified as cross-component infrastructure rather than an ordinary family row.

Charts, Diagrams, and Utilities still require source classification/reference coverage. High-risk JS, browser-permission, pointer, keyboard, RTL, and accessibility behavior remains explicitly marked as requiring runtime evidence where applicable; source verification is not presented as runtime verification.

A demo page or source file does not count as completed documentation. A reference progresses from draft to source verified, then runtime verified, using the status definitions in the inventory.
