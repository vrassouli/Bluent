# Bluent v3 — Penpot-first design contract

> **Mandatory for every issue under [Epic #416](https://github.com/vrassouli/Bluent/issues/416).** This is a workflow policy, not a claim that a Penpot file/design is connected, created, reviewed or approved. See [ISSUE-WORKFLOW.md](ISSUE-WORKFLOW.md) for GitHub Project status gates and [BRANCHING.md](BRANCHING.md) for v2/v3 isolation.

## Principle: Penpot is the source of truth for design

**Every v3 issue must be represented and evaluated in Penpot**, including foundation architecture, tokens, component families, legacy components, layout patterns, charts/diagrams, demo design, documentation examples, accessibility states, and migration UX. Do not substitute an ad hoc HTML/CSS mockup, Figma-only artifact, source code, or a screenshot for a Penpot design artifact.

Source code, tests and docs remain the authority for implemented behavior and APIs, but proposed visual and interaction decisions must be captured in Penpot **before the corresponding implementation** and checked against the result. Code, Penpot and documentation must stay linked.

### Proposed design workspace structure (create only after Penpot connects)

Use one coherent **Bluent v3 Design System** Penpot file/library or a deliberately linked library and application file, with these sections or pages:

1. **Foundations** — color/semantic tokens, typography, spacing, radii, elevation, motion, breakpoints, themes, contrast, focus, density and RTL/LTR.
2. **Components** — one traceable area per public component, including internal parts, variants, properties and state matrices.
3. **Patterns / App shell** — responsive desktop/mobile compositions, navigation, tasks, forms, data-heavy screens and overlay placement.
4. **Charts / Diagrams / Utilities** — preserve and improve non-Fluent Bluent capabilities; design their variants, complex flows and interaction models.
5. **Quality / Migration** — reference snapshots, issue-specific visual acceptance, old-to-new pattern comparisons and migration guidance.

These are **planned page names**, not a declaration of existing Penpot content.

## Required per-issue design cycle

| Stage | Penpot gate / evidence |
| --- | --- |
| **Backlog → Ready** | Define intended Penpot work, source/reference to inspect, desired states, review criteria and dependencies. For a design-creation foundation issue (e.g. initial library), the new Penpot artifact is the *deliverable*, not a prerequisite to begin; for implementation issues, link the relevant existing design or explicitly require design completion as the first subtask **before code changes**. |
| **Ready → In progress** | Confirm Penpot session/file access and record the target page, design owner and issue number. Produce or update Penpot design first; validate the intended state/variant matrix. Do not proceed with design-dependent UI implementation if connection, required design or approval is unavailable. |
| **In progress → Review** | Attach real Penpot file/page/shape URLs or stable IDs, design review/decision notes, screenshots or exports where useful, and an implementation-to-design mapping. Show theme, RTL, density and responsive parity (and keyboard/assistive states as applicable). |
| **Review → Done** | Reviewer confirms design/implementation parity, exceptions and migration notes are documented, PR checks pass, and the PR merges **only** into `bluent-v3`. |

Nonvisual foundation/automation/docs tasks must still record their UX/system-flow map, component impact or design-decision diagram in Penpot, at an appropriate level of detail. Do not invent irrelevant mockups merely to satisfy a checkbox; record a meaningful visual artifact, or flag an explicit maintainer decision if genuinely impossible.

## Per-component acceptance checklist

- Issue number, canonical component/public API and linked Penpot shape/page.
- Base appearance and property variants (type, size, intent, state and density as relevant).
- Hover, pressed, focus-visible, disabled, loading, validation and keyboard states *where supported*.
- Light, dark and high-contrast considerations; grounded typography, spacing, tokens and contrast.
- LTR/RTL and logical directionality; small/mobile and wide/desktop geometry.
- Overlay layering and focus/keyboard interaction when relevant.
- Blazor implementation + comprehensive interactive demo + documentation + consumer Skills + migration notes, linked back to the exact Penpot design and its reviewed revision.
- Evidence for missing variants, browser/runtime limitations and explicit accepted differences.

For complex data visualizations, diagrams or non-Fluent features, preserve specialized interaction requirements rather than forcing a superficial Fluent look.

## Change control

- Every design decision must carry its GitHub issue ID and, when possible, its Penpot page/shape reference in the issue and PR.
- If design changes after implementation, first update/review Penpot, then code, tests, demo, docs, Skills and migration ledger as applicable.
- If implementation reveals infeasible design behavior, document the discrepancy, update and review Penpot, and only then adopt the amended contract.
- Do not mark **Review** or **Done** solely because code builds. A confirmed design reference and parity assessment are required.
- Keep all implementation and documentation on isolated `bluent-v3` task branches; external Penpot designs must be clearly labeled **v3** and must not overwrite public 2.x references.
- If Penpot cannot connect, **record the exact connection error** and block Penpot-dependent work without presenting source-only experiments as Penpot-approved.

## Current dependency

At the time this policy was requested, the Penpot integration reported:

`No Penpot instance connected for user token. Please ensure that Penpot is connected and that the MCP client connection is using the correct token.`

There is **no verified active Penpot file** yet. The user must open the intended file in Penpot and connect its Penpot MCP plugin/session to the current integration. Do not invent a file URL, page ID, design artifact or approval. Once connected, inspect existing pages/assets *before* creating the v3 library or duplicating a design.
