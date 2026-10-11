# Fluent 2 linked component reference matrices — Bluent v3 #419

> **Status:** design evidence, **not** a finished component implementation or approved visual/API parity. Verified in the separate editable `Bluent v3 Design System` Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. Penpot file revision **42** was saved as **`Bluent v3 · #419 linked form/grid references 2026-10-10`**. The upstream `Microsoft Fluent 2 Web (Community)` file remains read-only and unchanged.

All matrices below were created using **`LibraryVariantComponent.instance()` on exact imported source variants**. Actual `isComponentInstance()` / `component()` linkage was checked in Penpot, each completed board was **exported as a PNG and visually inspected**, and the entire set was re-read after the saved version. These are **static Penpot design instances**, *not* working HTML controls, runtime interactions or automated visual regression tests.

## Verified design artifact inventory

| Family and fixed axes | Source library variants | New linked instances | Penpot page ID | Penpot board ID |
| --- | ---: | ---: | --- | --- |
| **Button** — Medium / icon+label, 5 appearance × 5 state | 150 | 25 (previously completed) | `07c521b9-e441-80bd-8008-c4b57568c3ef` | `07c521b9-e441-80bd-8008-c4b5759995ec` |
| **Input** — Medium, 7 state × 4 appearance | 84 | **28** | `07c521b9-e441-80bd-8008-c4d65ae7b089` | `07c521b9-e441-80bd-8008-c4d65b54658b` |
| **Checkbox** — 5 state × 3 status × 2 style | 30 | **30** | `07c521b9-e441-80bd-8008-c4d69e1290a6` | `07c521b9-e441-80bd-8008-c4d69e2a5bfe` |
| **Dialog** — 2 layout × 2 size | 4 | **4** | `07c521b9-e441-80bd-8008-c4d6ead3600b` | `07c521b9-e441-80bd-8008-c4d6eae7cfb0` |
| **DataGrid cell – Medium** — 7 cell/layout/style variants | 7 | **7** | `07c521b9-e441-80bd-8008-c4d7543f25ff` | `07c521b9-e441-80bd-8008-c4d7545257d7` |
| **Switch** — 5 state × 2 Checked × 4 layout | 40 | **40** | `07c521b9-e441-80bd-8008-c4d793a549ff` | `07c521b9-e441-80bd-8008-c4d793b68198` |

**This iteration: 109/109 linked upstream references, 0 unlinked in five boards. Combined with Button: 134 linked reference specimens in six full/subset design boards.** Neither 134 linked specimens nor six boards means 134 Blazor components or completed product API coverage. The original source variants are reusable instances that remained linked; none was detached or made into a competing local source library component.

## Input → current Bluent TextField

The exact upstream `Input` component (ID `131b0055-4dfd-5274-b259-45c21ea2374c`) has **84 variants**: 3 sizes × 7 states × 4 appearances. The new board fixes size at `Medium (Default)` and includes every combination of:

- **States:** Rest, Hover, Pressed, Focus, Error, Disabled, Read only.
- **Appearance:** Filled lighter, Filled darker, Outline, Underline.

The current `src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs` exposes *different* behavior: `Rows`, `ResizeTextarea`, `GainFocus`, `DigitOnly`, `AsciiDigits`, `ArabicToPersianConversion`, and inherited Blazor form-binding semantics. The source's TextField is not simply a 1:1 upstream `Input`: multi-row input, Persian conversion, validation/error, read-only and appearance design must be mapped explicitly. Do not infer that upstream seven *visual* states imply all of those Blazor capabilities are implemented or validated.

## Checkbox → current Bluent Checkbox<TValue>

The upstream `Checkbox` (ID `497b3553-d0e5-53d3-9c38-15a4f88d192b`) contributes its complete **30** combinations:

- State: Rest, Hover, Pressed, Focus, Disabled.
- Status: Unchecked, Checked, **Indeterminate**.
- Style: Standard, Circular.

Existing Bluent `src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs` already exposes `Label`, `UncheckedLabel`, `IndeterminateLabel`, `Circular`, `Size`, `LabelPosition`; its `Checkbox<TValue>` explicitly accepts **`bool` and `bool?`**. The class generation differentiates true/false/**null** into checked/unchecked/indeterminate. **Important:** current `Toggle()` maps `null` through `ValueAsBool == true` into a boolean, rather than preserving an arbitrary three-state cycle. Therefore tri-state design and interaction must be **reviewed**, not assumed from the visual matrix. Label association, `aria-checked=mixed`, keyboard, disabled state and validation also require real user interaction tests.

## Dialog → actual Bluent Dialog and shared host

The upstream `Dialog` component (ID `6806bf65-c164-5171-92cd-4cb84102ffa3`) has exactly four linked visual specimens: `320px`/`600px` × `Text`/`Placeholder`. Its imported layouts include title/body/close controls and illustrative action slots. Bluent `Dialog.razor.cs` instead exposes `Size` (`DialogSize`), `ChildContent` and `OnClose`; the actual `DialogContainer` lives under shared `<Containers/>`.

Issue #417's **real Chrome runtime experiment** confirmed that a locally themed page can be Dark while its globally hosted Dialog inherits the root Light mode. The v3 review must explicitly decide inherited theme context/host behavior. Additional *independent* gates: Escape/backdrop, focus trap/return focus, scroll lock, nested dialogs, delayed close animation, reduced-motion and SSR interactivity. **A static Penpot Dialog image does not cover modal behavior.**

## DataGrid cell → current Bluent DataGrid<TItem>

The imported `DataGrid cell - Medium` (ID `5cd3dfcb-e9d0-539a-b917-90dc6582535f`) provides **seven cell-only** representations: Cell actions, Single select, Multi-select, Text Primary, Text Secondary, Swappable Primary, and Link Primary. Those are **not a full Fluent DataGrid component** in this source library.

Bluent `src/Bluent.UI/Components/DataGridComponent/DataGrid.razor.cs` has `ItemsProvider`, `Columns`, `RowSize` (default 32), and virtualizers for main/frozen sections; `RefreshAsync()` refreshes them. This makes pagination/virtualization, column definitions, frozen regions, sorting, keyboard navigation, selection, filters, responsive behaviors and consumer overrides **functional concerns** that cannot be validated with these seven Penpot cells. Do not substitute the new cell board for DataGrid's own implementation/demo/a11y acceptance matrix.

## Switch → current Bluent Switch

The upstream `Switch` (ID `33756525-5af9-5f3d-a369-d85a217449f1`) has exactly **40** variants: `Checked=True/False` × `Layout=Switch+Label above/before/after/Switch` × `State=Rest/Hover/Pressed/Focus/Disabled`. All 40 were linked in one board and rendered.

Bluent `src/Bluent.UI/Components/SwitchComponent/Switch.razor.cs` produces the `bui-switch` class and a `label-before` class when `LabelPosition != After` (other binding and value properties may be inherited from common component classes and must be inspected when implementing the dedicated issue). The upstream **label above** mode should not be claimed supported based only on inherited Bluent LabelPosition. `aria-checked`, Space-key switching, disabled semantics, hit target, label activation and RTL before/after layout all require runtime acceptance.

## Adoption rules and open gates

The primary objective of Issue #419 is **design-source traceability**. We now have an upstream visual reference for Button, Input, Checkbox, Dialog, Switch and DataGrid **cells**. Each later individual component issue must still:

1. Author/approve **Bluent-specific editable** component variants, drawing on but **not modifying** the source-linked Fluent references.
2. Compare existing public APIs, names, events, binding and behavior; decide deliberate extensions and compatibility changes before coding.
3. Cover full visual states, Light/Dark, Brand × Mode, density, RTL, keyboard/focus, disabled/errors, forced-colors, reduced motion, responsive/reflow and interactive component behaviors.
4. Build a **100%-feature demo**, documentation, migration guide and component-specific Skills; report actual browser/host coverage separately from design screenshots.
5. Keep the CSS ADR #417 and token implementation #418 gates in force; keep stable `Dev` and NuGet **unchanged**. #419 stays **In progress**, PR #499 **Draft**.

**Source evidence is current as inspected on the isolated #419 task branch, not a guarantee of the published NuGet API.** Page/node IDs are exact Penpot plugin outputs; no Penpot URL was invented because no verified public workspace-origin URL was supplied.
