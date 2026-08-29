# Public component inventory and documentation coverage

This inventory tracks Bluent's public component families and canonical documentation coverage. It is derived from current public source, demos/examples, package projects, and the component references maintained under this directory.

It tracks component families rather than every helper type, enum, internal renderer, configuration record, or nested implementation component. A family page may document several tightly coupled public types.

## Status definitions

### Documentation

- **Not started** — no canonical component reference exists.
- **Draft** — a reference exists but still contains unverified sections.
- **Source verified** — API names, types, defaults, assets, and examples were checked against current source.
- **Runtime verified** — examples were also run in the stated hosting/render modes.

### Example

- **Verify** — demo/example existence or currency still needs checking.
- **None** — no repository example identified.
- **Present** — a current repository example exists.
- **Compiled** — an example is included in automated build validation.

### Validation

- **Not validated** — no recorded build/runtime result.
- **Build** — documentation/example participates in a successful solution build or compiled demo path.
- **Runtime** — documented interaction was exercised.
- **Automated** — validation runs in CI.

## Main UI package

Namespace: `Bluent.UI.Components`

| Family | Package | Source area | Documentation | Example | Validation |
| --- | --- | --- | --- | --- | --- |
| Accordion | `Bluent.UI` | `src/Bluent.UI/Components/AccordionComponent/` | Not started | Verify | Not validated |
| ActionCard | `Bluent.UI` | `src/Bluent.UI/Components/ActionCardComponent/` | Not started | Verify | Not validated |
| AudioCapture | `Bluent.UI` | `src/Bluent.UI/Components/AudioCaptureComponent/` | Not started | Verify | Not validated |
| Avatar | `Bluent.UI` | `src/Bluent.UI/Components/AvatarComponent/` | Not started | Verify | Not validated |
| [Badge](badge.md) | `Bluent.UI` | `src/Bluent.UI/Components/BadgeComponent/` | Source verified | Compiled demo | Build |
| Breadcrumb | `Bluent.UI` | `src/Bluent.UI/Components/BreadcrumbComponent/` | Not started | Verify | Not validated |
| [Button](button.md) | `Bluent.UI` | `src/Bluent.UI/Components/ButtonComponent/` | Source verified | Compiled demo | Build |
| [ButtonGroup](button-group.md) | `Bluent.UI` | `src/Bluent.UI/Components/ButtonGroupComponent/` | Source verified | Compiled demo | Build |
| Calendar | `Bluent.UI` | `src/Bluent.UI/Components/CalendarComponent/` | Not started | Verify | Not validated |
| Card | `Bluent.UI` | `src/Bluent.UI/Components/CardComponent/` | Not started | Verify | Not validated |
| [Checkbox](checkbox.md) | `Bluent.UI` | `src/Bluent.UI/Components/CheckBoxComponent/` | Source verified | Compiled component demo and scenario | Runtime in standalone WebAssembly |
| DataGrid | `Bluent.UI` | `src/Bluent.UI/Components/DataGridComponent/` | Not started | Verify | Not validated |
| DataPager | `Bluent.UI` | `src/Bluent.UI/Components/DataPagerComponent/` | Not started | Verify | Not validated |
| [DateField](date-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/DateFieldComponent/` | Source verified | Compiled demo | Build |
| [Dialog](dialog.md) | `Bluent.UI` | `src/Bluent.UI/Components/DialogComponent/` | Runtime verified | Runnable nested-dialog demo | Automated render tests; desktop/mobile and LTR/RTL |
| [DockPanel](dock-panel.md) | `Bluent.UI` | `src/Bluent.UI/Components/DockPanelComponent/` | Source verified | Verify | Runtime still required |
| [Drawer](drawer.md) | `Bluent.UI` | `src/Bluent.UI/Components/DrawerComponent/` | Source verified | Compiled task example | Build; representative disposal runtime evidence |
| DropdownList | `Bluent.UI` | `src/Bluent.UI/Components/DropdownListComponent/` | Not started | Verify | Not validated |
| [DropdownSelect](dropdown-select.md) | `Bluent.UI` | `src/Bluent.UI/Components/DropdownSelectComponent/` | Source verified | Verify | Not validated |
| [FileSelect](file-select.md) | `Bluent.UI` | `src/Bluent.UI/Components/FileSelectComponent/` | Source verified | Verify | Not validated |
| Icon | `Bluent.UI` | `src/Bluent.UI/Components/IconComponent/` | Not started | Verify | Not validated |
| Label | `Bluent.UI` | `src/Bluent.UI/Components/LabelComponent/` | Not started | Verify | Not validated |
| Link | `Bluent.UI` | `src/Bluent.UI/Components/LinkComponent/` | Not started | Verify | Not validated |
| List | `Bluent.UI` | `src/Bluent.UI/Components/ListComponent/` | Not started | Verify | Not validated |
| [MaskedField](masked-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/MaskedFieldComponent/` | Source verified | Compiled demo | Build |
| [MediaQuery](media-query.md) | `Bluent.UI` | `src/Bluent.UI/Components/MediaQueryComponent/` | Source verified | Verify | Runtime still required |
| [Menu](menu.md) | `Bluent.UI` | `src/Bluent.UI/Components/MenuComponent/` | Source verified | Verify | Runtime/keyboard still required |
| [MenuList](menu.md) | `Bluent.UI` | `src/Bluent.UI/Components/MenuListComponent/` | Source verified | Verify | Runtime/keyboard still required |
| [MessageBar](message-bar.md) | `Bluent.UI` | `src/Bluent.UI/Components/MessageBarComponent/` | Source verified | Compiled feedback task | Build; runtime dismissal still required |
| [NavList](nav-list.md) | `Bluent.UI` | `src/Bluent.UI/Components/NavListComponent/` | Source verified | Verify | Runtime/keyboard still required |
| [NumericField](numeric-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/NumericFieldComponent/` | Source verified | Compiled demo | Build |
| [OtpField](otp-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/OtpFieldComponent/` | Source verified | Compiled demo | Build; runtime still required |
| [Overflow](overflow.md) | `Bluent.UI` | `src/Bluent.UI/Components/OverflowComponent/` | Source verified | Verify | Runtime/JS measurement still required |
| [Overlay](overlay.md) | `Bluent.UI` | `src/Bluent.UI/Components/OverlayComponent/` | Source verified | Verify | Not validated |
| [Popover](popover.md) | `Bluent.UI` | `src/Bluent.UI/Components/PopoverComponent/` | Source verified | Compiled task example | Build; representative measurement runtime evidence |
| ProgressBar | `Bluent.UI` | `src/Bluent.UI/Components/ProgressBarComponent/` | Not started | Verify | Not validated |
| PropertyEditor | `Bluent.UI` | `src/Bluent.UI/Components/PropertyEditorComponent/` | Not started | Verify | Not validated |
| [RadioGroup](radio-group.md) | `Bluent.UI` | `src/Bluent.UI/Components/RadioGroupComponent/` | Source verified | Verify | Not validated |
| [RangeSlider](range-slider.md) | `Bluent.UI` | `src/Bluent.UI/Components/RangeSliderComponent/` | Source verified | Compiled demo | Build; runtime still required |
| [SelectField](select-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/SelectFieldComponent/` | Source verified | Compiled demo | Build |
| Skeleton | `Bluent.UI` | `src/Bluent.UI/Components/SkeletonComponent/` | Not started | Verify | Not validated |
| [Slider](slider.md) | `Bluent.UI` | `src/Bluent.UI/Components/SliderComponent/` | Source verified | Compiled demo | Build; runtime still required |
| [Spacer](spacer.md) | `Bluent.UI` | `src/Bluent.UI/Components/SpacerComponent/` | Source verified | Verify | Source only |
| Spinner | `Bluent.UI` | `src/Bluent.UI/Components/SpinnerComponent/` | Not started | Verify | Not validated |
| [SplitPanel](split-panel.md) | `Bluent.UI` | `src/Bluent.UI/Components/SplitPanelComponent/` | Source verified | Verify | Runtime/pointer still required |
| [Stack](stack.md) | `Bluent.UI` | `src/Bluent.UI/Components/StackComponent/` | Source verified | Verify | Source only |
| [Switch](switch.md) | `Bluent.UI` | `src/Bluent.UI/Components/SwitchComponent/` | Source verified | Compiled demo | Build |
| [TabList](tab-list.md) | `Bluent.UI` | `src/Bluent.UI/Components/TabListComponent/` | Source verified | Verify | Runtime/keyboard/overflow still required |
| Tag | `Bluent.UI` | `src/Bluent.UI/Components/TagComponent/` | Not started | Verify | Not validated |
| [TextField](text-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/TextFieldComponent/` | Source verified | Compiled demo | Build |
| [TileLayout](tile-layout.md) | `Bluent.UI` | `src/Bluent.UI/Components/TileLayoutComponent/` | Source verified | Verify | Source only |
| [TimeField](time-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/TimeFieldComponent/` | Source verified | Compiled demo | Build |
| [Toast](toast.md) | `Bluent.UI` | `src/Bluent.UI/Components/ToastComponent/` | Source verified | Compiled feedback task | Build; timer/hover/accessibility runtime still required |
| Toolbar | `Bluent.UI` | `src/Bluent.UI/Components/ToolbarComponent/` | Not started | Verify | Not validated |
| Tooltip | `Bluent.UI` | `src/Bluent.UI/Components/TooltipComponent/` | Not started | Verify | Not validated |
| Tree | `Bluent.UI` | `src/Bluent.UI/Components/TreeComponent/` | Not started | Verify | Not validated |
| Wizard | `Bluent.UI` | `src/Bluent.UI/Components/WizardComponent/` | Not started | Verify | Not validated |

### Infrastructure and shared UI types

The main package also exposes or contains cross-component infrastructure such as `BluentDynamicComponent`, field/input/overflow/UI base classes, the parameterless [`Containers`](containers.md) host and overlay containers, shared enums, and service-facing configuration/result types. These types must be classified individually as consumer-facing infrastructure, helper/configuration API, or internal during the remaining #406 inventory pass.

## Charts package

Namespace: `Bluent.UI.Charts.Components`

| Family or public type | Package | Source area | Documentation | Example | Validation |
| --- | --- | --- | --- | --- | --- |
| Chart | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Chart` | Not started | Verify | Not validated |
| Gauge | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Gauge` | Not started | Verify | Not validated |
| Dataset | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Dataset` | Not started | Verify | Not validated |
| Legend | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Legend` | Not started | Verify | Not validated |
| Scale | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Scale` | Not started | Verify | Not validated |
| Subtitle | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Subtitle` | Not started | Verify | Not validated |
| Title | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Title` | Not started | Verify | Not validated |
| Tooltip | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/Tooltip` | Not started | Verify | Not validated |
| XScale | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/XScale` | Not started | Verify | Not validated |
| YScale | `Bluent.UI.Charts` | `src/Bluent.UI.Charts/Components/YScale` | Not started | Verify | Not validated |

The Charts inventory must distinguish Razor components from public configuration models during reference authoring. The package's Chart.js asset loading also requires runtime validation.

## Diagrams package

Namespace: `Bluent.UI.Diagrams.Components`

| Family or public type | Package | Source area | Documentation | Example | Validation |
| --- | --- | --- | --- | --- | --- |
| Diagram | `Bluent.UI.Diagrams` | `src/Bluent.UI.Diagrams/Components/Diagram` | Not started | Verify | Not validated |
| DrawingCanvas | `Bluent.UI.Diagrams` | `src/Bluent.UI.Diagrams/Components/DrawingCanvas` | Not started | Verify | Not validated |
| Circle | `Bluent.UI.Diagrams` | `src/Bluent.UI.Diagrams/Components/Circle` | Not started | Verify | Not validated |
| Line | `Bluent.UI.Diagrams` | `src/Bluent.UI.Diagrams/Components/Line` | Not started | Verify | Not validated |
| Rect | `Bluent.UI.Diagrams` | `src/Bluent.UI.Diagrams/Components/Rect` | Not started | Verify | Not validated |

## Utilities package

Primary source root: `src/Bluent.UI.Utilities/`

| Family | Package | Source area | Documentation | Example | Validation |
| --- | --- | --- | --- | --- | --- |
| AppBusyIndicator | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/AppBusyIndicator` | Not started | Verify | Not validated |
| Hierarchy | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/Hierarchy` | Not started | Verify | Not validated |
| MdiTab | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/MdiTab` | Not started | Verify | Not validated |
| ToolbarButtons | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/ToolbarButtons` | Not started | Verify | Not validated |

## Coverage summary

| Package | Tracked families/types | Source-verified references | Runtime-verified references |
| --- | ---: | ---: | ---: |
| `Bluent.UI` | 56 | 33 | 1 |
| `Bluent.UI.Charts` | 10 | 0 | 0 |
| `Bluent.UI.Diagrams` | 5 | 0 | 0 |
| `Bluent.UI.Utilities` | 4 | 0 | 0 |
| **Total** | **75** | **33** | **1** |

The source-verified main-UI count now includes the completed action/input, overlay/feedback, navigation, and layout references through `DockPanel`, `MediaQuery`, `Menu`/`MenuList`, `NavList`, `Overflow`, `Overlay`, `Spacer`, `SplitPanel`, `Stack`, `TabList`, and `TileLayout`. Dialog retains its separately recorded runtime verification.

## Prioritization

Continue in coherent batches from #406: finish newly discovered main-UI families and remaining feedback/navigation/layout gaps, then data/list/tree, specialized UI, Charts, Diagrams, and Utilities.

## Maintenance rules

- Add a row when a new public component family is introduced.
- Do not mark a row source verified until the reference follows [TEMPLATE.md](TEMPLATE.md) and its API claims are checked against current source.
- Link each completed family name to its canonical page.
- Record demo paths during source verification.
- Recalculate the summary whenever statuses change.
- Review public helper/configuration types during each family pass.
- Treat deletions and renames as migration-documentation changes.
- Keep `.agents/skills/bluent/COMPONENT-INDEX.md` mechanically consistent with this ledger.

## Known limitations of this inventory

- The current ledger is still a family-level source inventory rather than a compiler/reflection-generated public API inventory.
- Nested, generic, dynamically rendered, service, configuration, and inherited public types still require the Phase A classification pass from #406.
- Demo/runtime presence is not assumed when evidence has not been checked.
- A deterministic automated inventory/coverage drift check is still required before #406 acceptance.

These limitations are tracked as validation work, not hidden behind a claim of complete API coverage.
