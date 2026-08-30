# Public component inventory and documentation coverage

This inventory tracks Bluent's public consumer-facing component families and canonical documentation coverage. It is derived from current public source, demos/examples, package projects, and the component references maintained under this directory.

It tracks **retrieval families**, not every public helper type, enum, nested renderer, service implementation, or configuration record. A canonical family page may document several tightly coupled public types. Consumer-facing infrastructure and service/configuration APIs are classified separately when they are important for correct usage.

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
| [Accordion](accordion.md) | `Bluent.UI` | `src/Bluent.UI/Components/AccordionComponent/` | Source verified | Verify | Runtime/keyboard still required |
| [ActionCard](action-card.md) | `Bluent.UI` | `src/Bluent.UI/Components/ActionCardComponent/` | Source verified | Verify | Runtime/keyboard still required |
| [AudioCapture](audio-capture.md) | `Bluent.UI` | `src/Bluent.UI/Components/AudioCaptureComponent/` | Source verified | Verify | Browser/media runtime required |
| [Avatar](avatar.md) | `Bluent.UI` | `src/Bluent.UI/Components/AvatarComponent/` | Source verified | Verify | Source only |
| [Badge](badge.md) | `Bluent.UI` | `src/Bluent.UI/Components/BadgeComponent/` | Source verified | Compiled demo | Build |
| [Breadcrumb](breadcrumb.md) | `Bluent.UI` | `src/Bluent.UI/Components/BreadcrumbComponent/` | Source verified | Verify | Source only |
| [Button](button.md) | `Bluent.UI` | `src/Bluent.UI/Components/ButtonComponent/` | Source verified | Compiled demo | Build |
| [ButtonGroup](button-group.md) | `Bluent.UI` | `src/Bluent.UI/Components/ButtonGroupComponent/` | Source verified | Compiled demo | Build |
| [Calendar](calendar.md) | `Bluent.UI` | `src/Bluent.UI/Components/CalendarComponent/` | Source verified | Verify | Runtime/keyboard/culture still required |
| [Card](card.md) | `Bluent.UI` | `src/Bluent.UI/Components/CardComponent/` | Source verified | Verify | Source only |
| [Checkbox](checkbox.md) | `Bluent.UI` | `src/Bluent.UI/Components/CheckBoxComponent/` | Source verified | Compiled component demo and scenario | Runtime in standalone WebAssembly |
| [DataGrid](data-grid.md) | `Bluent.UI` | `src/Bluent.UI/Components/DataGridComponent/` | Source verified | Compiled data-grid task | Build; JS/runtime still required |
| [DataList](data-list.md) | `Bluent.UI` | `src/Bluent.UI/Components/DataListComponent/` | Source verified | Verify | Runtime/virtualization still required |
| [DataPager](data-pager.md) | `Bluent.UI` | `src/Bluent.UI/Components/DataPagerComponent/` | Source verified | Compiled data-grid task | Build |
| [DateField](date-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/DateFieldComponent/` | Source verified | Compiled demo | Build |
| [Dialog](dialog.md) | `Bluent.UI` | `src/Bluent.UI/Components/DialogComponent/` | Runtime verified | Runnable nested-dialog demo | Automated render tests; desktop/mobile and LTR/RTL |
| [DockPanel](dock-panel.md) | `Bluent.UI` | `src/Bluent.UI/Components/DockPanelComponent/` | Source verified | Verify | Runtime still required |
| [Drawer](drawer.md) | `Bluent.UI` | `src/Bluent.UI/Components/DrawerComponent/` | Source verified | Compiled task example | Build; representative disposal runtime evidence |
| [DropdownList](dropdown-list.md) | `Bluent.UI` | `src/Bluent.UI/Components/DropdownListComponent/` | Source verified | Verify | Runtime/virtualization still required |
| [DropdownSelect](dropdown-select.md) | `Bluent.UI` | `src/Bluent.UI/Components/DropdownSelectComponent/` | Source verified | Verify | Not validated |
| [FileSelect](file-select.md) | `Bluent.UI` | `src/Bluent.UI/Components/FileSelectComponent/` | Source verified | Verify | Not validated |
| [Icon](icon.md) | `Bluent.UI` | `src/Bluent.UI/Components/IconComponent/` | Source verified | Typed icon usage | Source only |
| [Label](label.md) | `Bluent.UI` | `src/Bluent.UI/Components/LabelComponent/` | Source verified | Verify | Source only |
| [Link](link.md) | `Bluent.UI` | `src/Bluent.UI/Components/LinkComponent/` | Source verified | Verify | Source only |
| [List](list.md) | `Bluent.UI` | `src/Bluent.UI/Components/ListComponent/` | Source verified | Verify | Runtime/keyboard still required |
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
| [ProgressBar](progress-bar.md) | `Bluent.UI` | `src/Bluent.UI/Components/ProgressBarComponent/` | Source verified | Verify | Source only |
| [PropertyEditor](property-editor.md) | `Bluent.UI` | `src/Bluent.UI/Components/PropertyEditorComponent/` | Source verified | Verify | Runtime/reflection/editor matrix still required |
| [RadioGroup](radio-group.md) | `Bluent.UI` | `src/Bluent.UI/Components/RadioGroupComponent/` | Source verified | Verify | Not validated |
| [RangeSlider](range-slider.md) | `Bluent.UI` | `src/Bluent.UI/Components/RangeSliderComponent/` | Source verified | Compiled demo | Build; runtime still required |
| [SelectField](select-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/SelectFieldComponent/` | Source verified | Compiled demo | Build |
| [Skeleton](skeleton.md) | `Bluent.UI` | `src/Bluent.UI/Components/SkeletonComponent/` | Source verified | Verify | Source only |
| [Slider](slider.md) | `Bluent.UI` | `src/Bluent.UI/Components/SliderComponent/` | Source verified | Compiled demo | Build; runtime still required |
| [Spacer](spacer.md) | `Bluent.UI` | `src/Bluent.UI/Components/SpacerComponent/` | Source verified | Verify | Source only |
| [Spinner](spinner.md) | `Bluent.UI` | `src/Bluent.UI/Components/SpinnerComponent/` | Source verified | Verify | Source only |
| [SplitPanel](split-panel.md) | `Bluent.UI` | `src/Bluent.UI/Components/SplitPanelComponent/` | Source verified | Verify | Runtime/pointer still required |
| [Stack](stack.md) | `Bluent.UI` | `src/Bluent.UI/Components/StackComponent/` | Source verified | Verify | Source only |
| [Switch](switch.md) | `Bluent.UI` | `src/Bluent.UI/Components/SwitchComponent/` | Source verified | Compiled demo | Build |
| [TabList](tab-list.md) | `Bluent.UI` | `src/Bluent.UI/Components/TabListComponent/` | Source verified | Verify | Runtime/keyboard/overflow still required |
| [Tag](tag.md) | `Bluent.UI` | `src/Bluent.UI/Components/TagComponent/` | Source verified | Verify | Source only |
| [TextField](text-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/TextFieldComponent/` | Source verified | Compiled demo | Build |
| [TileLayout](tile-layout.md) | `Bluent.UI` | `src/Bluent.UI/Components/TileLayoutComponent/` | Source verified | Verify | Source only |
| [TimeField](time-field.md) | `Bluent.UI` | `src/Bluent.UI/Components/TimeFieldComponent/` | Source verified | Compiled demo | Build |
| [Toast](toast.md) | `Bluent.UI` | `src/Bluent.UI/Components/ToastComponent/` | Source verified | Compiled feedback task | Build; timer/hover/accessibility runtime still required |
| [Toolbar](toolbar.md) | `Bluent.UI` | `src/Bluent.UI/Components/ToolbarComponent/` | Source verified | Verify | Runtime/overflow still required |
| [Tooltip](tooltip.md) | `Bluent.UI` | `src/Bluent.UI/Components/TooltipComponent/` | Source verified | Common base usage | Runtime/positioning/accessibility still required |
| [Tree](tree.md) | `Bluent.UI` | `src/Bluent.UI/Components/TreeComponent/` | Source verified | Compiled dogfood task | Build; drag/drop/keyboard runtime still required |
| [Wizard](wizard.md) | `Bluent.UI` | `src/Bluent.UI/Components/WizardComponent/` | Source verified | Verify | Runtime/focus/validation flow still required |

### Infrastructure and shared UI API

| Surface | Classification | Canonical route |
| --- | --- | --- |
| `<Containers />` and specialized overlay containers | Consumer infrastructure | [containers.md](containers.md) |
| `IDialogService` / dialog config/results | Consumer service/configuration API | [dialog.md](dialog.md) |
| `IDrawerService` / drawer config/results | Consumer service/configuration API | [drawer.md](drawer.md) |
| `IDockService` / dock configuration | Consumer service/configuration API | [dock-panel.md](dock-panel.md) |
| `IToastService`, `ToastConfiguration`, `ToastConfigurator` | Consumer service/configuration API | [toast.md](toast.md) |
| `IPopoverService` / popover settings | Mostly component infrastructure; direct use is advanced | [popover.md](popover.md) |
| `ITooltipService` / tooltip settings | Mostly inherited-component infrastructure | [tooltip.md](tooltip.md) |
| `IPropertyEditorProvider`, `IPropertyEditorTypeRegistry` | Consumer extension points | [property-editor.md](property-editor.md) |
| `IDomHelper`, `DomRect` | Low-level browser/DOM infrastructure; not normal app UI API | [consumer-api-surface.md](consumer-api-surface.md) |
| Component/input/overflow base classes and concrete service implementations | Framework/internal extension surface unless a canonical page explicitly requires them | [consumer-api-surface.md](consumer-api-surface.md) |

## Charts package

Namespace: `Bluent.UI.Charts.Components`

| Retrieval family | Public types covered | Documentation | Example | Validation |
| --- | --- | --- | --- | --- |
| [Chart composition](chart.md) | `Chart`, `Dataset<TKey,TValue>`, `Legend`, `Title`, `Subtitle`, Charts `Tooltip`, `Scale`, `XScale`, `YScale`, `ChartType` and closely related Chart.js config types | Source verified | Compiled task | Build; interactive canvas/runtime still required |
| [Gauge](gauge.md) | `Gauge` and gauge configuration | Source verified | Verify | Browser/JS runtime still required |

Charts exposes additional public Chart.js configuration/model types. They are configuration helpers for these two retrieval families rather than independent component-family rows.

## Diagrams package

Namespace: `Bluent.UI.Diagrams.Components`

| Retrieval family | Public types covered | Documentation | Example | Validation |
| --- | --- | --- | --- | --- |
| [Diagram / DrawingCanvas](diagram.md) | `Diagram`, `DrawingCanvas`, tool/selection/command integration and diagram container behavior | Source verified | Compiled task | Build; pointer/keyboard/tool runtime still required |
| [Basic shapes](diagram-shapes.md) | `Circle`, `Line`, `Rect` | Source verified | Compiled task | Build; dynamic parameter behavior source-only |

Public element/tool/command abstractions support these families and are not separate retrieval families unless a future consumer workflow needs dedicated documentation.

## Utilities package

Primary source root: `src/Bluent.UI.Utilities/`

| Retrieval family | Public types covered | Documentation | Example | Validation |
| --- | --- | --- | --- | --- |
| [AppBusyIndicator](app-busy-indicator.md) | `AppBusyIndicator`, `IBusyIndicator`, `AddBluentUtilities()` registration | Source verified | Compiled dogfood task | Build; visual/a11y runtime still required |
| [Hierarchy](hierarchy-utilities.md) | `HierarchyItemBrowser`, `HierarchyTreeBrowser`, hierarchy items/selections/delegate | Source verified | Verify | Composite runtime/accessibility still required |
| [MdiTab](mdi-tabs.md) | `MdiTab`, `MdiTabList`, `IMdiService`, `IMdiDocument`, MDI toolbar/document contracts | Source verified | Verify | Runtime lifecycle/focus still required |
| [ToolbarButtons](toolbar-buttons.md) | `SaveToolbarButton`, `UndoToolbarButton`, `RedoToolbarButton`, `CommandManager` integration | Source verified | Verify | Source only |

## Coverage summary

| Package | Retrieval families | Source-verified references | Runtime-verified references |
| --- | ---: | ---: | ---: |
| `Bluent.UI` | 57 | 57 | 1 |
| `Bluent.UI.Charts` | 2 | 2 | 0 |
| `Bluent.UI.Diagrams` | 2 | 2 | 0 |
| `Bluent.UI.Utilities` | 4 | 4 | 0 |
| **Total** | **65** | **65** | **1** |

All 65 currently tracked consumer retrieval families now have source-verified canonical references. Dialog retains its separately recorded runtime verification. Public helper/configuration/service types are intentionally grouped with the component/workflow that consumes them instead of inflating the retrieval index with one row per CLR type.

## Prioritization

The remaining #406 work is runtime evidence for high-risk families, final public helper/service/config classification spot-checks, final state/CI evidence, and acceptance review. Deterministic source/inventory/index drift validation is implemented by `scripts/quality/check_consumer_skill.py` and runs in the Quality workflow.

## Maintenance rules

- Add a retrieval-family row when a new public consumer capability is introduced.
- Map every top-level main-UI `*Component` source directory to the main table or explicitly classify it as infrastructure.
- Do not mark a row source verified until the reference follows [TEMPLATE.md](TEMPLATE.md) and its API claims are checked against current source.
- Link each completed family name to its canonical page.
- Keep helper/configuration types grouped with the family that makes them useful unless independent retrieval materially improves consumer use.
- Record demo paths during source verification.
- Recalculate the summary whenever statuses change.
- Treat deletions and renames as migration-documentation changes.
- Keep `.agents/skills/bluent/COMPONENT-INDEX.md` mechanically consistent with this ledger.

## Known limitations of this inventory

- It is a consumer retrieval inventory rather than a compiler/reflection-generated list of every public CLR symbol.
- Runtime/demo presence is not assumed when evidence has not been checked.
- Accessibility, pointer, browser API, JS interop, RTL and render-mode claims remain limited to explicitly recorded evidence.

These limitations are tracked as validation work, not hidden behind a claim of complete runtime coverage.