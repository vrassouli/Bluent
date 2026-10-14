# Bluent v3 public-component source census — #494

Status: preliminary source candidates, not a finalized public API or runtime inventory.

## Design provenance
Canonical owned Penpot file: Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000).
Page 39 · Public component inventory · #494 (44b12572-0104-807e-8008-ca032a4746f0).
Editable pipeline board (44b12572-0104-807e-8008-ca035bbc8ca7): source discovery → internal/public classification → per-component issue routing → CI source gate.

## Deterministic discovery
Use:
- python scripts/quality/audit_v3_public_inventory.py --write (only for intentional snapshot changes)
- python scripts/quality/audit_v3_public_inventory.py --check (CI drift gate)
- python -m unittest discover -s scripts/quality -p test_v3_public_inventory.py -v

Source snapshot: public-component-sources.json. It scans .razor and concrete public C# component classes in Bluent.UI, Charts, Diagrams and Utilities. The current counts are 140 source candidates versus 66 retrieval families (58 main UI, 2 Charts, 2 Diagrams, 4 Utilities). The older summary 57+2+2+4=65 was inaccurate. Generic concrete C# components (for example Dataset<TKey,TValue>) are scanned separately from abstract base classes. Rows marked internal-path-review and infrastructure-review MUST be inspected; not all .razor or public C# classes are consumer markup.

Each item records package, source kind, provisional classification and family. The current 140 source candidates divide into 102 public-component candidates and 38 internal/infrastructure/review exceptions (18 infrastructure, 18 Internal/Internals paths and 2 explicitly documented composite renderers). Those two composite renderers are TabListTabItem (instantiated by Tab) and HierarchyTreeItem (recursively instantiated by HierarchyTreeBrowser). These are design/internal-classification proposals, not a claim that the CLR types are private.

Every one of the 102 public candidates has exactly one provisional issue route, enforced by tests and CI: 46 sole-family candidates use their family issue, 19 primary components in composite families use their family issue, and 37 independent child components have their own GitHub issues #507–#543. Of the 37 child issues, 35 have existing consumer markup evidence in docs/demo, one (HierarchyItemBrowser, #539) has a documented type reference and one (ToolbarButtonItem, #528) is flagged for source-only API investigation. All 37 routes record evidence-level metadata. CI guards source existence and existing markup/documentation references; it must fail on name/usage drift. This is NOT complete visual/runtime/AT approval. New public components without a unique issue route fail tests.

Explicit family exception: Tooltip family #456 has no standalone consumer Tooltip wrapper. It is a cross-component capability inherited from BluentUiComponentBase and service-backed renderer; see docs/components/tooltip.md. The family issue remains for behavior/keyboard/hover/service/visual acceptance; no fake standalone component row is introduced.

## Remaining gates for #494
- Confirm each candidate against actual public assembly/markup and demos; classify helpers and internal renderers deliberately.
- Create one independently traceable implementation issue per confirmed public component, or a justified explicit exception. Capture source path, Fluent/extension status, dependency, existing defects, Penpot reference, docs/demo/Skill/migration and DoD.
- Upgrade this snapshot gate to strict issue/doc/demo/Skill ownership checks after the route audit, and validate native runtime separately.
- Keep PR on a task branch targeting bluent-v3. Never merge into stable Dev / 2.x or publish NuGet.
