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

Each item records package, source kind, provisional support classification, evidence and family ownership. The 140 candidates are now **106 concrete consumer/API candidates with exactly one unique issue route each**, and **34 review-classified** (13 infrastructure, 18 paths under Internal/Internals, 2 composite renderers, 1 abstract public base). Routes: 42 singleton-family primary, 22 composite-family primary and 42 independently issued children #507–#548.

Five previously omitted consumer-facing CLR components now have standalone issue routes: [Containers #544](https://github.com/vrassouli/Bluent/issues/544), [DockBar #545](https://github.com/vrassouli/Bluent/issues/545), [DockContainer #546](https://github.com/vrassouli/Bluent/issues/546), [DrawerContent #547](https://github.com/vrassouli/Bluent/issues/547), and [MasterContainer #548](https://github.com/vrassouli/Bluent/issues/548). The first four have direct markup in real repository demos; MasterContainer is strictly source-only and needs an API-use review. Among all 42 child issues, 39 have markup evidence, one HierarchyItemBrowser #539 has documented-type evidence and two ToolbarButtonItem #528 / MasterContainer #548 are source-only.

**Compiled CLR finding:** real Release binaries and an independent PE metadata inspection proved **all 140 classes are exported as public types**, including the 34 review-classified exceptions. Thus Internal folder names and library-only usage do NOT mean the CLR API is private or safe to remove without migration approval. The new compiled job preserves exported type presence/visibility, but does NOT certify component semantics, parameter signatures or runtime/visual/AT quality.

The source gate checks that excluded candidates are not directly used in canonical demo/docs markup, while all public candidates have unique GitHub issue ownership, and dedicated issue evidence paths still resolve. Exceptions TabListTabItem (created by Tab) and HierarchyTreeItem (recursive browser renderer) remain public CLR types pending policy review. Tooltip family #456 remains an inherited cross-component service capability rather than invented standalone wrapper.


## Compiled component API contract snapshot

The independent .NET 10 metadata tool at scripts/quality/v3_compiled_inventory reads the four Release NuGet assemblies. The canonical [public-component-contracts.json](public-component-contracts.json) snapshots 140 fully qualified public CLR types, namespace, base type, abstract status, 779 declared public properties (type, getter/setter, Blazor Parameter/CascadingParameter/EditorRequired/SupplyParameterFromQuery attributes), 194 declared public methods (generic arity, parameter/return types), and currently no declared public fields. An EventCallback-typed property is covered as a property.

After building the four Bluent component libraries, run:

    dotnet run --project scripts/quality/v3_compiled_inventory/V3CompiledInventory.csproj -c Release -- . --check-contracts
    python scripts/quality/test_v3_compiled_contract.py -v

ONLY when an intentional API/migration change is approved:

    dotnet run --project scripts/quality/v3_compiled_inventory/V3CompiledInventory.csproj -c Release -- . --write-contracts

The comparison is structural: JSON formatting and key order do not create false regressions. Four tests prove that Button.Appearance parameter-type mutations and removing Button from a temporary snapshot fail, while identical/reordered contracts pass. This is a DECLARED-member signature gate, not a complete ABI check: inherited members, public constructors or CLR events, attribute arguments and parameter default values, runtime behavior, visual and assistive-technology acceptance all remain separate gates.

Abstract exception: source and compiled metadata show Overflow is a public abstract Razor component base. Its [documentation](../../components/overflow.md) forbids standalone direct consumer markup. Its CLR base must remain compatible, but the class belongs among the 34 review-classified public CLR types, not the 106 constructible consumer candidates. Family #472 still owns derived Overflow behavior. Tooltip family #456 remains service-based rather than an independently instantiable component. The full 66-family ledger is unchanged.

## Remaining gates for #494
- CLR exports and declared public property/method signatures now have a deterministic snapshot. Still audit inherited members, constructors, attribute arguments/defaults, all 34 review candidates and runtime behaviors before migration.
- Create one independently traceable implementation issue per confirmed public component, or a justified explicit exception. Capture source path, Fluent/extension status, dependency, existing defects, Penpot reference, docs/demo/Skill/migration and DoD.
- Upgrade this snapshot gate to strict issue/doc/demo/Skill ownership checks after the route audit, and validate native runtime separately.
- Keep PR on a task branch targeting bluent-v3. Never merge into stable Dev / 2.x or publish NuGet.
