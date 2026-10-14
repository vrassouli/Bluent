# Bluent v3 inventory — #494

Own the 66 retrieval families and 140 source candidates on the separate v3 worktree; not 140 confirmed public markup APIs. Penpot Bluent v3 Design System page 39 ID 44b12572-0104-807e-8008-ca032a4746f0, board 44b12572-0104-807e-8008-ca035bbc8ca7.

Run python scripts/quality/audit_v3_public_inventory.py --check and python -m unittest discover -s scripts/quality -p test_v3_public_inventory.py -v. The --write mode updates a reviewed snapshot only.

Razor and concrete C# renderables count. Abstract bases do not. Dataset<TKey,TValue> must not disappear behind abstract Dataset. Internal paths require classification; do not silently call them public or private. Forty-six single-candidate families and 19 multi-family primary components have provisional routes; split composite families into separate implementation issues after checking public API. Each issue requires Penpot/source/Fluent mapping, dependency, docs, demo, Skill, migration and verified tests. Source verification is not runtime/AT evidence. Never merge into stable Dev or publish NuGet.

See docs/v3/inventory/README.md.

Dedicated child issue routes, source/demo evidence only: AccordionPanel #507, DataGridColumn #508, Chart Dataset #509, DrawingCanvas #510. Public runtime and final design acceptance still pending.

Current gate: 106 concrete consumer candidates, 42 singleton family, 22 family primary, 42 child issues #507–#548; 34 exported CLR review-classified types including abstract Overflow #472. Tooltip #456 is service-based. Special routes: source-only ToolbarButtonItem #528 and documented-type HierarchyItemBrowser #539. Do NOT claim public markup/assembly/runtime certification merely from this source ledger. All child issues stay Backlog until their own design and Ready gates.

2026-10-14: CLR metadata proves 140/140 candidate types are actually exported, including 34 review/internal-path/abstract types. Never infer private API from Internal folders. Current 106 concrete consumer candidates have unique issues (42 singleton, 22 primary composite, 42 dedicated #507-#548). Regression cases: Containers, DockBar, DockContainer, DrawerContent are consumer-facing. MasterContainer is source-only. The new compiled CLR CI gate preserves type exports; parameter signature, supported markup, runtime and AT tests are still independent.

2026-10-14 compiled API snapshot: namespace + generic/concrete/abstract disambiguation protects duplicate CLR names. public-component-contracts.json snapshots 140 exported CLR types, 779 declared public properties incl Parameter and CascadingParameter roles, 194 declared public methods, base types and abstract flags. CI runs --check-contracts plus four negative/positive tests (mutate Button.Appearance, delete Button from a TEMP snapshot; reformat JSON without false failure). Do not run --write-contracts to hide an unapproved API change. Inherited parameter signatures, constructors/events, attribute values/defaults, runtime/AT are separate acceptance gates.
