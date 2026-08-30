# Bluent consumer-skill dogfood matrix

Issue #406 requires representative consumer scenarios to prove that the portable skill routes an agent to verified Bluent APIs without hidden one-off knowledge. This matrix records which scenarios are covered by canonical task sources, where runtime evidence exists, and where browser evidence is still deliberately unclaimed.

The dogfood rule is: start from `.agents/skills/bluent/SKILL.md`, route through `DECISION-GUIDE.md` / `COMPONENT-INDEX.md`, then use only the linked canonical documentation and task examples. If a scenario needs undocumented repository knowledge, that is a skill/documentation gap to fix.

| Required scenario | Skill route / canonical evidence | Current proof | Remaining evidence |
| --- | --- | --- | --- |
| Login/data-entry form with Bluent fields/buttons and validation | `references/patterns/forms.md`, `TextField`, `Checkbox`, `Button`; `docs/examples/tasks/form-validation.md` | Canonical task in `Bluent.TaskExamples` | Focused browser validation only if stronger runtime/accessibility claims are needed |
| CRUD/list screen with actions and data presentation | `references/patterns/crud.md`, `DataGrid`, `DataPager`, `Toolbar`/`Button`; `docs/examples/tasks/data-grid-paging.md` | Canonical task in `Bluent.TaskExamples` | DataGrid JS/runtime behavior remains separately marked |
| Dialog confirmation flow | `references/patterns/overlays.md`, `Dialog`; `docs/examples/tasks/confirmation-dialog.md` | Task plus existing automated Dialog render/runtime evidence | No extra skill-specific scenario required |
| Tree hierarchy with selection and DnD where supported | `references/patterns/drag-drop.md`, `Tree`; `docs/components/tree.md`; `samples/Bluent.TaskExamples/Pages/Tasks/TreeDragDrop.razor` | Consumer task added to the compiled TaskExamples project | Current-head CI must confirm compilation; browser drag/drop/keyboard evidence remains required before runtime guarantees |
| Light/dark theme-aware custom layout | foundation theming + `Stack`/layout routes; `docs/examples/tasks/theme-dark-mode-and-rtl.md` | Canonical task in `Bluent.TaskExamples` | Existing runtime/theme evidence may be reused where host matches |
| Persian/RTL-compatible form/navigation behavior | foundation RTL/localization + form/navigation routes; `docs/examples/tasks/theme-dark-mode-and-rtl.md`, navigation task | Canonical tasks in `Bluent.TaskExamples` | Component-specific RTL behavior that is source-unverified remains explicitly unclaimed |
| Charts scenario | `Chart composition`; `docs/examples/tasks/chart-dashboard.md` | Typed chart task in `Bluent.TaskExamples` | Interactive canvas/JS behavior still requires target-host runtime evidence |
| Diagrams scenario | `Diagram / DrawingCanvas`, `Basic shapes`; `docs/examples/tasks/simple-diagram.md` | Diagram task in `Bluent.TaskExamples` | Editing/tool/pointer/keyboard behavior remains runtime-only work |
| Utilities scenario | `AppBusyIndicator`; `samples/Bluent.TaskExamples/Pages/Tasks/UtilitiesBusyIndicator.razor` | Utilities package reference, DI registration, and consumer task added to `Bluent.TaskExamples` | Current-head CI must confirm compilation; composite Hierarchy/MDI runtime behavior remains separate work |

## Findings already fed back into the docs/skill

The dogfood/retrieval pass reinforced several design choices:

- tightly coupled Chart plugin/scale types belong under one `Chart composition` retrieval family rather than separate agent routes;
- Diagram primitive shapes belong in one basic-shapes route while `Diagram`/`DrawingCanvas` own interaction/tool guidance;
- Utilities are workflow families, not a flat list of service/helper CLR symbols;
- low-level `IDomHelper` and concrete service implementations should not be suggested to normal consumers when component/service APIs already cover the task;
- Tree drag/drop events describe application integration contracts, not automatic persistence or keyboard-accessible reordering;
- `Bluent.UI.Utilities` requires its own project/package reference plus `AddBluentUtilities()` when service-backed Utilities features are consumed.

Product/API defects found during source verification are tracked in #411 rather than being silently changed as part of #406.

## Exit criteria for this matrix

Before #406 is review-ready:

1. all task sources, including the new Tree and Utilities dogfood pages, compile in `Bluent.TaskExamples` on the PR head;
2. `scripts/quality/check_consumer_skill.py`, Markdown-link checks, solution build/tests, and package validation pass on the PR head;
3. high-risk runtime claims remain limited to evidence actually exercised in a browser/host;
4. any new product defect discovered during dogfood is appended to #411.
