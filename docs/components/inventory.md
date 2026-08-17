# Public component inventory and documentation coverage

This inventory is the Sprint 1 baseline for tracking Bluent's public component surface and documentation coverage. It is derived from component namespaces, Razor files, public parameter declarations, package project files, and demo references visible in the repository on 2026-07-25.

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
- **Build** — documentation example compiles.
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
| Button | `Bluent.UI` | `src/Bluent.UI/Components/ButtonComponent/` | Not started | Verify | Not validated |
| ButtonGroup | `Bluent.UI` | `src/Bluent.UI/Components/ButtonGroupComponent/` | Not started | Verify | Not validated |
| Calendar | `Bluent.UI` | `src/Bluent.UI/Components/CalendarComponent/` | Not started | Verify | Not validated |
| Card | `Bluent.UI` | `src/Bluent.UI/Components/CardComponent/` | Not started | Verify | Not validated |
| [Checkbox](checkbox.md) | `Bluent.UI` | `src/Bluent.UI/Components/CheckBoxComponent/` | Source verified | Compiled component demo and scenario | Runtime in standalone WebAssembly |
| DataGrid | `Bluent.UI` | `src/Bluent.UI/Components/DataGridComponent/` | Not started | Verify | Not validated |
| DataPager | `Bluent.UI` | `src/Bluent.UI/Components/DataPagerComponent/` | Not started | Verify | Not validated |
| DateField | `Bluent.UI` | `src/Bluent.UI/Components/DateFieldComponent/` | Not started | Verify | Not validated |
| Dialog | `Bluent.UI` | `src/Bluent.UI/Components/DialogComponent/` | [Runtime verified](dialog.md) | Runnable nested-dialog demo | Automated render tests; desktop/mobile and LTR/RTL |
| DockPanel | `Bluent.UI` | `src/Bluent.UI/Components/DockPanelComponent/` | Not started | Verify | Not validated |
| Drawer | `Bluent.UI` | `src/Bluent.UI/Components/DrawerComponent/` | Not started | Verify | Not validated |
| DropdownSelect | `Bluent.UI` | `src/Bluent.UI/Components/DropdownSelectComponent/` | Not started | Verify | Not validated |
| FileSelect | `Bluent.UI` | `src/Bluent.UI/Components/FileSelectComponent/` | Not started | Verify | Not validated |
| Icon | `Bluent.UI` | `src/Bluent.UI/Components/IconComponent/` | Not started | Verify | Not validated |
| Label | `Bluent.UI` | `src/Bluent.UI/Components/LabelComponent/` | Not started | Verify | Not validated |
| List | `Bluent.UI` | `src/Bluent.UI/Components/ListComponent/` | Not started | Verify | Not validated |
| MaskedField | `Bluent.UI` | `src/Bluent.UI/Components/MaskedFieldComponent/` | Not started | Verify | Not validated |
| MediaQuery | `Bluent.UI` | `src/Bluent.UI/Components/MediaQueryComponent/` | Not started | Verify | Not validated |
| Menu | `Bluent.UI` | `src/Bluent.UI/Components/MenuComponent/` | Not started | Verify | Not validated |
| MenuList | `Bluent.UI` | `src/Bluent.UI/Components/MenuListComponent/` | Not started | Verify | Not validated |
| MessageBar | `Bluent.UI` | `src/Bluent.UI/Components/MessageBarComponent/` | Not started | Verify | Not validated |
| NavList | `Bluent.UI` | `src/Bluent.UI/Components/NavListComponent/` | Not started | Verify | Not validated |
| NumericField | `Bluent.UI` | `src/Bluent.UI/Components/NumericFieldComponent/` | Not started | Verify | Not validated |
| OtpField | `Bluent.UI` | `src/Bluent.UI/Components/OtpFieldComponent/` | Not started | Verify | Not validated |
| Overflow | `Bluent.UI` | `src/Bluent.UI/Components/OverflowComponent/` | Not started | Verify | Not validated |
| Overlay | `Bluent.UI` | `src/Bluent.UI/Components/OverlayComponent/` | Not started | Verify | Not validated |
| Popover | `Bluent.UI` | `src/Bluent.UI/Components/PopoverComponent/` | Not started | Verify | Not validated |
| ProgressBar | `Bluent.UI` | `src/Bluent.UI/Components/ProgressBarComponent/` | Not started | Verify | Not validated |
| PropertyEditor | `Bluent.UI` | `src/Bluent.UI/Components/PropertyEditorComponent/` | Not started | Verify | Not validated |
| RadioGroup | `Bluent.UI` | `src/Bluent.UI/Components/RadioGroupComponent/` | Not started | Verify | Not validated |
| RangeSlider | `Bluent.UI` | `src/Bluent.UI/Components/RangeSliderComponent/` | Not started | Verify | Not validated |
| SelectField | `Bluent.UI` | `src/Bluent.UI/Components/SelectFieldComponent/` | Not started | Verify | Not validated |
| Skeleton | `Bluent.UI` | `src/Bluent.UI/Components/SkeletonComponent/` | Not started | Verify | Not validated |
| Slider | `Bluent.UI` | `src/Bluent.UI/Components/SliderComponent/` | Not started | Verify | Not validated |
| Spacer | `Bluent.UI` | `src/Bluent.UI/Components/SpacerComponent/` | Not started | Verify | Not validated |
| Spinner | `Bluent.UI` | `src/Bluent.UI/Components/SpinnerComponent/` | Not started | Verify | Not validated |
| SplitPanel | `Bluent.UI` | `src/Bluent.UI/Components/SplitPanelComponent/` | Not started | Verify | Not validated |
| Stack | `Bluent.UI` | `src/Bluent.UI/Components/StackComponent/` | Not started | Verify | Not validated |
| TabList | `Bluent.UI` | `src/Bluent.UI/Components/TabListComponent/` | Not started | Verify | Not validated |
| Tag | `Bluent.UI` | `src/Bluent.UI/Components/TagComponent/` | Not started | Verify | Not validated |
| TextField | `Bluent.UI` | `src/Bluent.UI/Components/TextFieldComponent/` | Not started | Verify | Not validated |
| TimeField | `Bluent.UI` | `src/Bluent.UI/Components/TimeFieldComponent/` | Not started | Verify | Not validated |
| Toast | `Bluent.UI` | `src/Bluent.UI/Components/ToastComponent/` | Not started | Verify | Not validated |
| Toolbar | `Bluent.UI` | `src/Bluent.UI/Components/ToolbarComponent/` | Not started | Verify | Not validated |
| Tree | `Bluent.UI` | `src/Bluent.UI/Components/TreeComponent/` | Not started | Verify | Not validated |
| Wizard | `Bluent.UI` | `src/Bluent.UI/Components/WizardComponent/` | Not started | Verify | Not validated |

### Infrastructure and shared UI types

The main package also exposes or contains cross-component infrastructure such as:

- `BluentDynamicComponent`
- field, input, overflow-item, and UI component base classes
- `Containers` and specialized overlay containers
- shared enums such as appearance, field size, and orientation
- service-facing configuration and result types for dialogs, drawers, popovers, toasts, and related features

These types must be reviewed individually before deciding whether they need public reference pages, conceptual documentation, or an explicit “infrastructure only” classification.

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

Diagram internals, selection contracts, drawing tools, and nested shapes require a second-level API review before individual page scope is finalized.

## Utilities package

Primary source root: `src/Bluent.UI.Utilities/`

| Family | Package | Source area | Documentation | Example | Validation |
| --- | --- | --- | --- | --- | --- |
| AppBusyIndicator | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/AppBusyIndicator` | Not started | Verify | Not validated |
| Hierarchy | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/Hierarchy` | Not started | Verify | Not validated |
| MdiTab | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/MdiTab` | Not started | Verify | Not validated |
| ToolbarButtons | `Bluent.UI.Utilities` | `src/Bluent.UI.Utilities/ToolbarButtons` | Not started | Verify | Not validated |

Utilities includes services and abstractions in addition to Razor components. The documentation should explain the application pattern first, then its public component and service API.

## Coverage summary

| Package | Tracked families/types | Source-verified references | Runtime-verified references | Automated examples |
| --- | ---: | ---: | ---: | ---: |
| `Bluent.UI` | 52 | 2 | 1 | 2 |
| `Bluent.UI.Charts` | 10 | 0 | 0 | 0 |
| `Bluent.UI.Diagrams` | 5 | 0 | 0 | 0 |
| `Bluent.UI.Utilities` | 4 | 0 | 0 | 0 |
| **Total** | **71** | **2** | **1** | **2** |

Badge and Checkbox now have source-verified canonical references, while Dialog retains its separately recorded runtime verification. A demo page or public source file is not counted as canonical documentation until it is reviewed against the [component reference template](TEMPLATE.md).

## Prioritization

Document these groups first because they are central to onboarding or high-risk for AI-generated mistakes:

1. Button and basic inputs: Button, TextField, NumericField, DateField, TimeField, Checkbox, SelectField
2. Overlay services: Containers, Dialog, Drawer, Popover, Toast, Tooltip behavior where applicable
3. Forms and validation: input bases, binding, validation messages, localization
4. Data presentation: DataGrid, DataPager, List, Tree
5. Navigation and application structure: Menu, NavList, TabList, Toolbar, DockPanel
6. Specialized packages: Chart/Gauge, Diagram/DrawingCanvas, MDI, hierarchy utilities

## Maintenance rules

- Add a row when a new public component family is introduced.
- Do not mark a row source verified until the reference follows [TEMPLATE.md](TEMPLATE.md).
- Link each completed family name to its canonical page.
- Record demo paths during source verification.
- Count an example as compiled only when it participates in a repeatable build.
- Recalculate the summary whenever statuses change.
- Review public helper/configuration types during each family pass.
- Treat deletions and renames as migration-documentation changes.

## Known limitations of this baseline

- The GitHub code index is relevance-based and is not a compiler/reflection inventory.
- Nested, generic, dynamically rendered, and inherited public components may need separate rows.
- Public service APIs and configuration types are noted but not exhaustively enumerated here.
- Demo presence and runtime behavior are deliberately not assumed.
- A later automated inventory should compare compiled public Razor/component types with this file and fail on drift.

These limitations are tracked as validation work, not hidden behind a claim of complete API coverage.
