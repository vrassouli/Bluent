# Bluent consumer-skill dogfood matrix

Issue #406 requires representative consumer scenarios to prove that the portable skill routes an agent to verified Bluent APIs without hidden one-off knowledge. This matrix records which scenarios are already covered by compiled canonical tasks, where runtime evidence exists, and where a focused follow-up scenario is still required.

The dogfood rule is: start from `.agents/skills/bluent/SKILL.md`, route through `DECISION-GUIDE.md` / `COMPONENT-INDEX.md`, then use only the linked canonical documentation and compiled examples. If a scenario needs undocumented repository knowledge, that is a skill/documentation gap to fix.

| Required scenario | Skill route / canonical evidence | Current proof | Remaining evidence |
| --- | --- | --- | --- |
| Login/data-entry form with Bluent fields/buttons and validation | `references/patterns/forms.md`, `TextField`, `Checkbox`, `Button`; `docs/examples/tasks/form-validation.md` | Compiled canonical task | Focused browser validation only if stronger runtime/accessibility claims are needed |
| CRUD/list screen with actions and data presentation | `references/patterns/crud.md`, `DataGrid`, `DataPager`, `Toolbar`/`Button`; `docs/examples/tasks/data-grid-paging.md` | Compiled canonical task | DataGrid JS/runtime behavior remains separately marked |
| Dialog confirmation flow | `references/patterns/overlays.md`, `Dialog`; `docs/examples/tasks/confirmation-dialog.md` | Compiled task plus existing automated Dialog render/runtime evidence | No extra skill-specific scenario required |
| Tree hierarchy with selection and DnD where supported | `references/patterns/drag-drop.md`, `Tree`; `docs/components/tree.md` | Source-verified API and event/data contract | **Gap:** add a compiled Tree consumer task; browser drag/drop/keyboard evidence remains required before runtime guarantees |
| Light/dark theme-aware custom layout | foundation theming + `Stack`/layout routes; `docs/examples/tasks/theme-dark-mode-and-rtl.md` | Compiled canonical task | Existing runtime/theme evidence may be reused where host matches |
| Persian/RTL-compatible form/navigation behavior | foundation RTL/localization + form/navigation routes; `docs/examples/tasks/theme-dark-mode-and-rtl.md`, navigation task | Compiled canonical tasks | Component-specific RTL behavior that is source-unverified remains explicitly unclaimed |
| Charts scenario | `Chart composition`; `docs/examples/tasks/chart-dashboard.md` | Compiled typed chart task | Interactive canvas/JS behavior still requires target-host runtime evidence |
| Diagrams scenario | `Diagram / DrawingCanvas`, `Basic shapes`; `docs/examples/tasks/simple-diagram.md` | Compiled diagram task | Editing/tool/pointer/keyboard behavior remains runtime-only work |
| Utilities scenario | `AppBusyIndicator`, `Hierarchy`, `MdiTab`, `ToolbarButtons` | Source-verified canonical family docs | **Gap:** add one compiled Utilities task rather than relying on source-only usage |

## Findings already fed back into the docs/skill

The dogfood/retrieval pass reinforced several design choices:

- tightly coupled Chart plugin/scale types belong under one `Chart composition` retrieval family rather than separate agent routes;
- Diagram primitive shapes belong in one basic-shapes route while `Diagram`/`DrawingCanvas` own interaction/tool guidance;
- Utilities are workflow families, not a flat list of service/helper CLR symbols;
- low-level `IDomHelper` and concrete service implementations should not be suggested to normal consumers when component/service APIs already cover the task;
- Tree drag/drop events describe application integration contracts, not automatic persistence or keyboard-accessible reordering.

Product/API defects found during source verification are tracked in #411 rather than being silently changed as part of #406.

## Exit criteria for this matrix

Before #406 is review-ready:

1. the two explicit compiled-task gaps above are either implemented or precisely justified as out of scope;
2. all canonical task sources still compile in `Bluent.TaskExamples`;
3. `scripts/quality/check_consumer_skill.py`, Markdown-link checks, solution build/tests, and package validation pass on the PR head;
4. high-risk runtime claims remain limited to evidence actually exercised in a browser/host;
5. any new product defect discovered during dogfood is appended to #411.
