# #552 — source-declared API census for 18 historical pilots

This is the **first source census**, **not the completed Fluent parity matrix**. The baseline is the current `bluent-v3` checkout at `2c37dbef516230606306549458721d6bda03a8ab`. It supplements #421's [18-family retrospective plan](https://github.com/vrassouli/Bluent/blob/v3/issue-421-component-lab/docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md) without creating a second, conflicting acceptance ledger.

- Machine source: [FLUENT-PARITY-18-SOURCE-API.json](FLUENT-PARITY-18-SOURCE-API.json). It enumerates per family **directly declared** `[Parameter]`, `[CascadingParameter]`, callback and `RenderFragment` slots from matching Razor/C# files, source line numbers, `@inherits` and direct C# class bases. Radio and RadioGroup are inventoried separately within the owning family.
- Script: `python scripts/quality/audit_v3_parity_source_api.py` verifies the frozen direct API and all explicitly unresolved review flags; `--write` only after source-change review. Tests: `python -m unittest discover -s scripts/quality -p test_v3_parity_source_api.py -v`.
- **Important inheritance boundary:** `Switch` inherits `Checkbox<bool>`, so a naïve zero-declared-parameter snapshot is **not** evidence that Switch has no public parameters. `RadioGroup` inherits `BluentInputComponentBase<TValue?>`, and forms inherit `BluentFieldComponentBase` or `BluentInputComponentBase`. The declared source API is **not the complete public API** until inherited and exposed base contracts are independently traced.
- This census also does not derive public helper methods, JS interop, rendered DOM, CSS variables, custom attributes, true slots/events in native Web Components, or ownership of nested composition; each remains a separate comparison task.
- The official Fluent design reference and WC/React component taxonomy must be **verified by version and specific component**. No directly declared Bluent feature is yet marked Supported / Missing / Intentional extension / N/A. No component design frame has yet passed review.

## Completion boundary

The 18 families remain **not reviewed** for Fluent parity. The P0 [source observations](FLUENT-PARITY-P0-TRIAGE.md) are triage findings only. Nothing here authorizes a product issue transition, makes a draft PR review-ready, or overrides the debt-first pause on new Lab families. Maintainer-approved remediation continues only through #428–#445 after documented design and real browser/OS-AT evidence.
## Locally inherited API follow-up

A second machine snapshot FLUENT-PARITY-18-INHERITED-API.json walks local class chains for all 18 families and resolves source-declared Parameter metadata. It is reproducible with scripts/quality/audit_v3_parity_inherited_api.py and has independent negative-control tests.

Switch inherits Checkbox<bool>, including Label, UncheckedLabel and sizing. Button inherits Tooltip and AdditionalAttributes from BluentUiComponentBase / BluentComponentBase. TextField inherits StartAddon and EndAddon from BluentFieldComponentBase<TValue>.

**Unresolved:** InputBase<TValue> is external to the repository, so Value, ValueChanged, ValueExpression, EditContext and binding/validation semantics are not certified by this source-only step. Neither are native Fluent events/slots, DOM, visual geometry, or OS/AT. Zero complete API audits or Fluent approvals are claimed.
