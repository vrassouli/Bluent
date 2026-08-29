# Bluent component index

This index is a retrieval map, not an API catalog. Canonical component pages under `docs/components/` remain authoritative. If a behavior is marked runtime-unverified, inspect the canonical page/source rather than guessing.

## Main UI — `Bluent.UI`

| Family | Typical need | Canonical reference |
| --- | --- | --- |
| Accordion | grouped expandable content | `docs/components/accordion.md` |
| ActionCard | prominent clickable/link/expandable content | `docs/components/action-card.md` |
| AudioCapture | browser microphone capture | `docs/components/audio-capture.md` |
| Avatar | person/entity avatar | `docs/components/avatar.md` |
| Badge | compact status/count/value | `docs/components/badge.md` |
| Breadcrumb | hierarchy/location trail | `docs/components/breadcrumb.md` |
| Button | commands, links, toggle/dropdown/split actions | `docs/components/button.md` |
| ButtonGroup | grouped related buttons | `docs/components/button-group.md` |
| Calendar | culture-aware date/month/year selection | `docs/components/calendar.md` |
| Card | grouped/selectable/link content | `docs/components/card.md` |
| Checkbox | Boolean/nullable choice | `docs/components/checkbox.md` |
| DataGrid | virtualized tabular provider-backed data | `docs/components/data-grid.md` |
| DataList | virtualized templated collection/provider list | `docs/components/data-list.md` |
| DataPager | page navigation for data | `docs/components/data-pager.md` |
| DateField | date entry | `docs/components/date-field.md` |
| Dialog | modal/confirmation workflow | `docs/components/dialog.md` |
| DockPanel | service-backed named dock/tool-window layout | `docs/components/dock-panel.md` |
| Drawer | side-panel workflow | `docs/components/drawer.md` |
| DropdownList | provider-backed virtualized/filterable selection | `docs/components/dropdown-list.md` |
| DropdownSelect | custom popover-backed selected-value display | `docs/components/dropdown-select.md` |
| FileSelect | browser file selection | `docs/components/file-select.md` |
| Icon | typed SVG/image/CSS icon rendering | `docs/components/icon.md` |
| Label | metadata-aware field/content label | `docs/components/label.md` |
| Link | lightweight button-or-anchor text action | `docs/components/link.md` |
| List | explicitly authored selectable/navigation list | `docs/components/list.md` |
| MaskedField | formatted/masked text input | `docs/components/masked-field.md` |
| MediaQuery | initial browser breakpoint detection | `docs/components/media-query.md` |
| Menu | popover-backed command/action menu | `docs/components/menu.md` |
| MenuList | lower-level menu item composition | `docs/components/menu.md` |
| MessageBar | persistent inline status/message | `docs/components/message-bar.md` |
| NavList | application navigation and nested NavItem composition | `docs/components/nav-list.md` |
| NumericField | numeric entry | `docs/components/numeric-field.md` |
| OtpField | one-time-password/code entry | `docs/components/otp-field.md` |
| Overflow | abstract overflow composition used by concrete controls | `docs/components/overflow.md` |
| Overlay | lightweight visual/click-catching backdrop; not the service host | `docs/components/overlay.md` |
| Popover | anchored transient surface | `docs/components/popover.md` |
| ProgressBar | determinate/indeterminate progress indication | `docs/components/progress-bar.md` |
| PropertyEditor | reflection-driven object/property editing | `docs/components/property-editor.md` |
| RadioGroup | single-choice set | `docs/components/radio-group.md` |
| RangeSlider | bounded two-thumb range selection | `docs/components/range-slider.md` |
| SelectField | single- or source-observed array selection | `docs/components/select-field.md` |
| Skeleton | visual loading placeholder | `docs/components/skeleton.md` |
| Slider | scalar pointer-driven range selection | `docs/components/slider.md` |
| Spacer | flexible flex-layout spacing | `docs/components/spacer.md` |
| Spinner | indeterminate busy state | `docs/components/spinner.md` |
| SplitPanel | pointer-resizable multi-region application layout | `docs/components/split-panel.md` |
| Stack | flex stack layout | `docs/components/stack.md` |
| Switch | immediate Boolean on/off setting | `docs/components/switch.md` |
| TabList | overflow-aware tabbed navigation/content | `docs/components/tab-list.md` |
| Tag | compact optional-action/dismiss label | `docs/components/tag.md` |
| TextField | text/password/textarea-style entry | `docs/components/text-field.md` |
| TileLayout | CSS-driven responsive tile layout | `docs/components/tile-layout.md` |
| TimeField | time entry | `docs/components/time-field.md` |
| Toast | transient global status | `docs/components/toast.md` |
| Toolbar | overflow-aware command bar | `docs/components/toolbar.md` |
| Tooltip | inherited service-backed contextual help capability | `docs/components/tooltip.md` |
| Tree | hierarchical expand/check/drag-drop data/navigation | `docs/components/tree.md` |
| Wizard | multi-step workflow | `docs/components/wizard.md` |

All 57 currently tracked `Bluent.UI` component families have source-verified canonical routes. Consumer-facing overlay infrastructure remains separate: `docs/components/containers.md` documents the parameterless shared `<Containers />` host.

## Charts — `Bluent.UI.Charts`

| Consumer family | Typical need | Canonical reference |
| --- | --- | --- |
| Chart composition | canvas chart with typed datasets, legend/title/subtitle/tooltip and x/y scales | `docs/components/chart.md` |
| Gauge | scalar gauge visualization | `docs/components/gauge.md` |

`Dataset`, `Legend`, `Title`, `Subtitle`, Charts `Tooltip`, `Scale`, `XScale`, and `YScale` are public composition/configuration components within the Chart family rather than separate top-level consumer families. The compiled end-to-end pattern is `docs/examples/tasks/chart-dashboard.md`.

## Diagrams — `Bluent.UI.Diagrams`

| Consumer family | Typical need | Canonical reference |
| --- | --- | --- |
| Diagram / DrawingCanvas | interactive drawing/diagram surface, selection/tools/pan/scale | `docs/components/diagram.md` |
| Basic shapes | declarative circle/line/rectangle shapes nested in a canvas | `docs/components/diagram-shapes.md` |

The compiled display pattern is `docs/examples/tasks/simple-diagram.md`. Editing/pointer/keyboard behavior remains runtime-sensitive; follow the limitations in the canonical pages.

## Utilities — `Bluent.UI.Utilities`

| Consumer family | Typical need | Canonical reference |
| --- | --- | --- |
| AppBusyIndicator | application-level busy progress driven by `IBusyIndicator` | `docs/components/app-busy-indicator.md` |
| Hierarchy | tree/file-browser-style hierarchical navigation and selection | `docs/components/hierarchy-utilities.md` |
| MDI tabs | dynamic multi-document tabs and activation lifecycle | `docs/components/mdi-tabs.md` |
| ToolbarButtons | `CommandManager` save/undo/redo toolbar helpers | `docs/components/toolbar-buttons.md` |

Utilities registration is `builder.Services.AddBluentUtilities()` when service-backed MDI/busy-indicator features are used. Supporting abstractions and models belong to their family pages and should not be treated as extra visual component families.

## Coverage source

The complete maintained coverage ledger is `docs/components/inventory.md`. When this index and the inventory disagree, treat that as drift to fix rather than guessing which API is correct. Product/API gaps found during verification are tracked in issue #411.
