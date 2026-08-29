# Bluent component index

This index is a retrieval map, not an API catalog. Canonical component pages under `docs/components/` remain authoritative. Families without a source-verified canonical page are deliberately marked as such so an agent knows to inspect current source/demo rather than guess.

## Main UI — `Bluent.UI`

| Family | Typical need | Canonical reference |
| --- | --- | --- |
| Accordion | grouped expandable content | pending canonical reference |
| ActionCard | prominent actionable content card | pending canonical reference |
| AudioCapture | capture audio input | pending canonical reference |
| Avatar | person/entity avatar | `docs/components/avatar.md` |
| Badge | compact status/count/value | `docs/components/badge.md` |
| Breadcrumb | hierarchy/location trail | pending canonical reference |
| Button | commands, links, toggle/dropdown/split actions | `docs/components/button.md` |
| ButtonGroup | grouped related buttons | `docs/components/button-group.md` |
| Calendar | calendar/date presentation | pending canonical reference |
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
| PropertyEditor | object/property editing | pending canonical reference |
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
| Wizard | multi-step workflow | pending canonical reference |

Consumer-facing overlay infrastructure: `docs/components/containers.md` documents the parameterless shared `<Containers />` host for Drawer, Dialog, Popover, Tooltip, and Toast containers. Shared base classes, services, and configuration/result types must be selected from canonical setup/task/component docs, not inferred from this table.

The main-UI family ledger is source-reconciled to include previously omitted `DropdownList`, `Link`, `TileLayout`, `Tooltip`, and `DataList`; `Containers` remains classified as cross-component infrastructure rather than an ordinary component-family row.

## Charts — `Bluent.UI.Charts`

Tracked families/types: Chart, Gauge, Dataset, Legend, Scale, Subtitle, Title, Tooltip, XScale, YScale. The current inventory requires a component-vs-configuration classification pass before separate canonical pages are treated as authoritative. Use the canonical chart task example meanwhile: `docs/examples/tasks/chart-dashboard.md`.

## Diagrams — `Bluent.UI.Diagrams`

Tracked families/types: Diagram, DrawingCanvas, Circle, Line, Rect. Use `docs/examples/tasks/simple-diagram.md` for the current compiled pattern; individual family references remain pending source verification.

## Utilities — `Bluent.UI.Utilities`

Tracked families: AppBusyIndicator, Hierarchy, MdiTab, ToolbarButtons. Utilities includes services/abstractions as well as Razor components; inspect the current source/demo until canonical family documentation is added.

## Coverage source

The complete maintained coverage ledger is `docs/components/inventory.md`. When this index and the inventory disagree, treat that as drift to fix rather than guessing which API is correct.
