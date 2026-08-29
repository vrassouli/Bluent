# Bluent decision guide

Use this table to route a UI need to a likely Bluent family, then open the corresponding canonical reference or task example. A match here is a selection hint, not permission to invent undocumented parameters.

| Need | Prefer | Notes / verification route |
| --- | --- | --- |
| command/action | `Button`; group with `ButtonGroup` or `Toolbar` | Button source/demo currently verifies action, link, toggle, dropdown and split-button shapes; canonical page pending |
| compact status/count | `Badge` | canonical `docs/components/badge.md` |
| Boolean choice | `Checkbox` | canonical `docs/components/checkbox.md` |
| text/password/multiline entry | `TextField` | compiled task examples; canonical family page pending |
| numeric entry | `NumericField` | compiled task example; canonical family page pending |
| date/time entry | `DateField`, `TimeField`; `Calendar` where calendar UI is required | canonical family pages pending |
| single choice | `SelectField`, `DropdownSelect`, `RadioGroup` | choose based on interaction/layout; verify current source/demo |
| file input | `FileSelect` | verify current source/demo |
| OTP/code entry | `OtpField` | verify current source/demo |
| masked/formatted text | `MaskedField` | verify current source/demo |
| scalar/range selection | `Slider`, `RangeSlider` | verify current source/demo |
| form validation | Bluent fields inside Blazor `EditForm` | `references/foundation/forms-validation.md` and canonical task example |
| modal confirmation/workflow | `Dialog` | canonical `docs/components/dialog.md` |
| side-panel workflow | `Drawer` | canonical task example exists; family page pending |
| anchored transient content | `Popover` | canonical task example exists; family page pending |
| persistent inline status | `MessageBar` | canonical feedback task example |
| transient global status | `Toast` | canonical feedback task example |
| busy/progress state | `Spinner`, `ProgressBar`; utilities may provide app-level busy pattern | verify current source/demo |
| tabular data/CRUD | `DataGrid` + `DataPager` | canonical compiled task example |
| list presentation | `List` | verify current source/demo |
| hierarchical UI | `Tree`; `Hierarchy` for Utilities pattern | verify current source/demo; DnD claims require source/runtime evidence |
| app navigation | `NavList`, `Menu`/`MenuList`, `TabList`, `Breadcrumb` | canonical navigation task covers shared app layout; exact family APIs pending |
| command surface | `Toolbar` | verify current source/demo |
| stacked/flexible layout | `Stack`, `Spacer` | verify current source/demo |
| split/docked layout | `SplitPanel`, `DockPanel` | verify current source/demo |
| responsive conditional UI | `MediaQuery` | verify current source/demo |
| grouped visual content | `Card`, `ActionCard`, `Accordion` | verify current source/demo |
| avatar/icon/tag | `Avatar`, `Icon`, `Tag` | verify current source/demo |
| loading placeholder | `Skeleton` | verify current source/demo |
| charts | `Bluent.UI.Charts` `Chart` / `Gauge` family | canonical compiled chart task example; configuration types must be distinguished from Razor components |
| diagrams/drawing | `Diagram`, `DrawingCanvas`, shape types | canonical compiled simple-diagram task example |
| MDI/application utilities | `MdiTab`, `ToolbarButtons`, `AppBusyIndicator`, `Hierarchy` | inspect Utilities source/demo until canonical references exist |

## Raw/custom fallback

Use raw interactive HTML only after confirming no suitable Bluent family exists or a concrete platform/framework constraint prevents its use. Record the reason in implementation notes when the fallback is non-obvious.
