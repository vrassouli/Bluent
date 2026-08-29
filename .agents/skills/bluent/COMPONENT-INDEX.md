# Bluent component index

This index is a retrieval map, not an API catalog. Canonical component pages under `docs/components/` remain authoritative. Families without a source-verified canonical page are deliberately marked as such so an agent knows to inspect current source/demo rather than guess.

## Main UI — `Bluent.UI`

| Family | Typical need | Canonical reference |
| --- | --- | --- |
| Accordion | grouped expandable content | pending canonical reference |
| ActionCard | prominent actionable content card | pending canonical reference |
| AudioCapture | capture audio input | pending canonical reference |
| Avatar | person/entity avatar | pending canonical reference |
| Badge | compact status/count/value | `docs/components/badge.md` |
| Breadcrumb | hierarchy/location trail | pending canonical reference |
| Button | commands, links, toggle/dropdown/split actions | `docs/components/button.md` |
| ButtonGroup | grouped related buttons | `docs/components/button-group.md` |
| Calendar | calendar/date presentation | pending canonical reference |
| Card | grouped visual content | pending canonical reference |
| Checkbox | Boolean/nullable choice | `docs/components/checkbox.md` |
| DataGrid | tabular data and CRUD presentation | pending canonical reference |
| DataPager | page navigation for data | pending canonical reference |
| DateField | date entry | `docs/components/date-field.md` |
| Dialog | modal/confirmation workflow | `docs/components/dialog.md` |
| DockPanel | docked application layout | pending canonical reference |
| Drawer | side-panel workflow | pending canonical reference |
| DropdownSelect | dropdown selection | pending canonical reference |
| FileSelect | file selection | pending canonical reference |
| Icon | icon rendering | pending canonical reference |
| Label | field/content label | pending canonical reference |
| List | list presentation/selection | pending canonical reference |
| MaskedField | formatted/masked text input | pending canonical reference |
| MediaQuery | responsive conditional UI | pending canonical reference |
| Menu | menu interaction | pending canonical reference |
| MenuList | menu item composition | pending canonical reference |
| MessageBar | persistent inline status/message | pending canonical reference |
| NavList | application navigation | pending canonical reference |
| NumericField | numeric entry | `docs/components/numeric-field.md` |
| OtpField | one-time-password/code entry | pending canonical reference |
| Overflow | overflow-aware command/content grouping | pending canonical reference |
| Overlay | overlay surface/infrastructure | pending canonical reference |
| Popover | anchored transient surface | pending canonical reference |
| ProgressBar | progress indication | pending canonical reference |
| PropertyEditor | object/property editing | pending canonical reference |
| RadioGroup | single-choice set | pending canonical reference |
| RangeSlider | bounded range selection | pending canonical reference |
| SelectField | single- or source-observed array selection | `docs/components/select-field.md` |
| Skeleton | loading placeholder | pending canonical reference |
| Slider | scalar range selection | pending canonical reference |
| Spacer | flexible layout spacing | pending canonical reference |
| Spinner | indeterminate busy state | pending canonical reference |
| SplitPanel | resizable split layout | pending canonical reference |
| Stack | stacked layout | pending canonical reference |
| TabList | tabbed navigation/content | pending canonical reference |
| Tag | compact categorical/status label | pending canonical reference |
| TextField | text/password/textarea-style entry | `docs/components/text-field.md` |
| TimeField | time entry | `docs/components/time-field.md` |
| Toast | transient global status | pending canonical reference |
| Toolbar | command bar/overflow composition | pending canonical reference |
| Tree | hierarchical data/navigation | pending canonical reference |
| Wizard | multi-step workflow | pending canonical reference |

Cross-component infrastructure such as `Containers`, shared base classes, services and configuration/result types must be selected from canonical setup/task/component docs, not inferred from this table.

## Charts — `Bluent.UI.Charts`

Tracked families/types: Chart, Gauge, Dataset, Legend, Scale, Subtitle, Title, Tooltip, XScale, YScale. The current inventory requires a component-vs-configuration classification pass before separate canonical pages are treated as authoritative. Use the canonical chart task example meanwhile: `docs/examples/tasks/chart-dashboard.md`.

## Diagrams — `Bluent.UI.Diagrams`

Tracked families/types: Diagram, DrawingCanvas, Circle, Line, Rect. Use `docs/examples/tasks/simple-diagram.md` for the current compiled pattern; individual family references remain pending source verification.

## Utilities — `Bluent.UI.Utilities`

Tracked families: AppBusyIndicator, Hierarchy, MdiTab, ToolbarButtons. Utilities includes services/abstractions as well as Razor components; inspect the current source/demo until canonical family documentation is added.

## Coverage source

The complete maintained coverage ledger is `docs/components/inventory.md`. When this index and the inventory disagree, treat that as drift to fix rather than guessing which API is correct.
