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

Each item includes package, markup-name candidate, source location/kind, provisional family and corresponding family issue #428–#493, with provisional componentIssue equal to the family issue for 45 single-candidate families; multi-candidate families remain unrouted until split and verification. A family issue is NOT automatically one implementation issue for each public component. SOURCE VERIFIED is NOT RUNTIME VERIFIED.

## Remaining gates for #494
- Confirm each candidate against actual public assembly/markup and demos; classify helpers and internal renderers deliberately.
- Create one independently traceable implementation issue per confirmed public component, or a justified explicit exception. Capture source path, Fluent/extension status, dependency, existing defects, Penpot reference, docs/demo/Skill/migration and DoD.
- Upgrade this snapshot gate to strict issue/doc/demo/Skill ownership checks after the route audit, and validate native runtime separately.
- Keep PR on a task branch targeting bluent-v3. Never merge into stable Dev / 2.x or publish NuGet.


