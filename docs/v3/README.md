# Bluent v3 — canonical documentation entry

> **Work in progress.** This documentation describes the isolated `bluent-v3` program, not a released product. The supported 2.x packages and usage instructions remain under [current documentation](../README.md). Do **not** treat a draft design token, Penpot variant, or research demo as a supported v3 consumer API.

## What is established, and what is not

| Area | Evidence | Boundary |
| --- | --- | --- |
| CSS architecture | [Accepted ADR D1–D5](architecture/ADR-0001-styling-boundaries.md) · [audit](architecture/css-architecture-audit.md) · issue #417 | Architecture accepted; no blanket Bootstrap removal or 2.x CSS change |
| Editable design source | [Owned Penpot reference](design/BLUENT-V3-PENPOT.md) · [design-to-code handoff](design/DESIGN-TO-RAZOR-HANDOFF.md) · issue #419 | The Microsoft Fluent library is an upstream reference, not the Bluent working file or proof of component parity |
| Tokens, branding and accessibility | Issue [#418](https://github.com/vrassouli/Bluent/issues/418) · [existing theme contract](architecture/theme-contract-crosswalk.md) | Token proposals on a task branch are **not** finalized production defaults or accessibility certification |
| Component implementation | [Current 2.x inventory](../components/inventory.md) · [v3 family reference template](COMPONENT-REFERENCE-TEMPLATE.md) · epic [#416](https://github.com/vrassouli/Bluent/issues/416) | Inventory lists **66 existing retrieval families**, not 66 migrated v3 components |
| Interactive demos and quality gates | [Workflow](ISSUE-WORKFLOW.md) · [design workflow](PENPOT-WORKFLOW.md) · issues #421, #425 | Tests must identify source, build, real browser and assistive-technology evidence separately |
| Migration and release | [Branch protection](BRANCHING.md) · [migration impact research](design/MIGRATION-IMPACT-LEDGER.md) · issues #424, #427 | No stable v3 NuGet release, Dev merge, or approved breaking API contract |

## Documentation map

- **Architecture:** [D1–D5 styling boundaries](architecture/ADR-0001-styling-boundaries.md), [CSS audit](architecture/css-architecture-audit.md), [current theme/API crosswalk](architecture/theme-contract-crosswalk.md) and [runtime probe record](architecture/css-runtime-probes.md).
- **Design:** [Owned Penpot file and IDs](design/BLUENT-V3-PENPOT.md), [reference/import fidelity](design/PENPOT-IMPORT-FIDELITY.md), [component anatomy matrices](design/COMPONENT-REFERENCE-MATRICES.md) and [design-to-Razor handoff](design/DESIGN-TO-RAZOR-HANDOFF.md).
- **Components:** [Source-verified 2.x family inventory](../components/inventory.md), [family reference authoring contract](COMPONENT-REFERENCE-TEMPLATE.md), the [Button v3 implementation record](components/button.md), and its [Fluent 2 compatibility crosswalk](quality/FLUENT2-BUTTON-COMPATIBILITY.md) (branch-only, not accepted or released).
- **Skills:** [Version-aware development router and authoring rules](skills/README.md), with no assumption that every existing 2.x family is migrated.
- **Quality:** [#425 baseline evidence and CI contract](quality/EVIDENCE-AND-GATES.md), [Issue status and acceptance rules](ISSUE-WORKFLOW.md), [Penpot/Figma work rules](PENPOT-WORKFLOW.md) and the actual CI evidence linked from each component/foundation PR. [Retrospective Fluent 2 parity plan for the 18 existing Lab pilots](quality/FLUENT-PARITY-RETRO-AUDIT.md) is a planned audit, **not** a completed parity or design approval.
- **Migration:** [2.x consumer impact ledger](design/MIGRATION-IMPACT-LEDGER.md) and [branch/release isolation rules](BRANCHING.md). API changes must remain proposals until accepted.

## Public packages and source of truth

Bluent currently uses these package IDs: `Bluent.UI.Core`, `Bluent.UI`, `Bluent.UI.Charts`, `Bluent.UI.Diagrams`, and `Bluent.UI.Utilities`. The current [repository onboarding](../README.md) and individual package projects are the authority for **existing** installation/namespace/version statements. There is no approved v3 installation syntax or migration API yet.

For each v3 family, check **the current source, package, accepted Penpot page and runtime evidence** before publishing an example. A component's design appearing in Penpot is not evidence that its Blazor implementation, keyboard support, SSR, responsive behavior, or examples exist.

## Contributing to v3 docs

1. Use the [family authoring template](COMPONENT-REFERENCE-TEMPLATE.md) and a dedicated issue branch from `bluent-v3`.
2. Separate supported existing 2.x behavior, accepted v3 behavior, proposals and known defects. Reference exact source paths or test cases for claims.
3. Add a checked link here when a canonical v3 page is ready; never infer that all original inventory entries are already migrated.
4. Link the real owned Penpot file/page/board or approved Figma fallback, component demo, source verification, browser results and 2.x→v3 migration row.
5. Run `python scripts/quality/check_v3_docs_contract.py` and the relevant build/browser checks before requesting review.

**Scope:** issue [#422](https://github.com/vrassouli/Bluent/issues/422). This index is information architecture, not a shipped component documentation library.