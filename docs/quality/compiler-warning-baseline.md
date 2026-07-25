# Compiler Warning Baseline

**Baseline date:** 2026-07-25
**Baseline commit:** `4307a30`
**Environment:** macOS 26.5, Apple Silicon, .NET SDK 10.0.300
**Command:** `dotnet clean Bluent.sln --configuration Release` followed by
`dotnet build Bluent.sln --configuration Release --no-restore --verbosity minimal`

## Result

The clean baseline build succeeded with 10 warnings and no errors. All 10 were
pre-existing on Sprint 3's starting `Dev` commit
`864f0d308775e4fdebacc1c12504a098ad1cc73c`.

Each warning had a low-risk source correction. The accepted post-triage
baseline is zero compiler warnings; no warning was suppressed.

## Inventory and disposition

| Warning | Project and location | Cause | Recommended resolution | Risk | Disposition |
| --- | --- | --- | --- | --- | --- |
| `CS0067` | `Bluent.UI.Diagrams`: `Tools/KeyboardToolBase.cs:12` | The keyboard tool must implement `ITool.Completed` but never raises completion notifications. | Implement the unused contract event explicitly with no backing delegate. | Low; preserves the existing no-notification behavior and interface shape. | Fixed now. |
| `CS0067` | `Bluent.UI.Diagrams`: `Tools/KeyboardToolBase.cs:13` | The keyboard tool must implement `INotifyPropertyChanged.PropertyChanged` but has no changing public state to notify. | Implement the unused contract event explicitly with no backing delegate. | Low; preserves the existing no-notification behavior and interface shape. | Fixed now. |
| `CS0067` | `Bluent.UI.Diagrams`: `Tools/Drawings/Diagram/DiagramKeyboardToolBase.cs:14` | The diagram keyboard tool must implement `ITool.Completed` but never raises it. | Implement the unused contract event explicitly with no backing delegate. | Low; preserves behavior and the interface shape. | Fixed now. |
| `CS0067` | `Bluent.UI.Diagrams`: `Tools/Drawings/Diagram/DiagramKeyboardToolBase.cs:15` | The diagram keyboard tool must implement `INotifyPropertyChanged.PropertyChanged` but has no changing public state to notify. | Implement the unused contract event explicitly with no backing delegate. | Low; preserves behavior and the interface shape. | Fixed now. |
| `CS8604` | `Bluent.UI`: `Components/AvatarComponent/Avatar.razor.cs:49` | Re-reading nullable `Color` after a null check did not preserve nullable flow state for `ToString().Camelize()`. | Use `Color.Value` inside the guarded branch. | Low; the branch proves a value exists and output is unchanged. | Fixed now. |
| `CS8604` | `Bluent.UI`: `Components/AvatarComponent/Avatar.razor.cs:50` | Same nullable property re-read for the background class. | Use `Color.Value` inside the guarded branch. | Low; output is unchanged. | Fixed now. |
| `CS0168` | `Bluent.UI`: `Components/OverflowComponent/Overflow.razor.cs:51` | A caught `JSDisconnectedException` variable was never read. | Remove the variable name while preserving the narrow catch. | Low; exception and disposal behavior are unchanged. | Fixed now. |
| `CS0168` | `Bluent.UI`: `Components/SplitPanelComponent/SplitPanelContainer.razor.cs:113` | A caught `JSDisconnectedException` variable was never read. | Remove the variable name while preserving the narrow catch. | Low; exception and disposal behavior are unchanged. | Fixed now. |
| `CS0169` | `Bluent.UI`: `Components/TreeComponent/TreeItem.razor.cs:10` | `_dragOverBefore` was referenced only by commented-out experimental code. | Remove the unused private field. | Low; no compiled behavior used it. | Fixed now. |
| `CS0649` | `Bluent.UI.Demo.Pages`: `Pages/Components/DockPanels.razor:6` | `_panel` was never assigned; it and its unused toggle method were dead demo code. | Remove `_panel`, `_toggled`, and the unreferenced method. | Low; no markup invoked the method or assigned the reference. | Fixed now. |

## Regression policy

- Release and pull-request CI build the full solution in Release configuration
  with warnings treated as errors.
- New warnings must be fixed or added here with a narrow justification before a
  baseline change is accepted.
- Broad `NoWarn`, project-wide suppression, and warning-count-only gates are
  not acceptable substitutes for source triage.
- Generated or third-party warnings may be narrowly suppressed only when the
  source cannot be corrected and this document records the exact warning,
  origin, risk, and reason.
