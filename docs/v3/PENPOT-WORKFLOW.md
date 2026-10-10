# Bluent v3 — Design-first contract: Penpot primary, Figma fallback

> **Mandatory for every issue under [Epic #416](https://github.com/vrassouli/Bluent/issues/416).** The maintainer explicitly authorized **Figma as the fallback** when Penpot is unavailable or connected to the wrong project (2026-10-10). Follow [ISSUE-WORKFLOW.md](ISSUE-WORKFLOW.md) for GitHub Project status and [BRANCHING.md](BRANCHING.md) for v2/v3 isolation.

## Design source of truth

Every v3 issue must have a **real editable design artifact or meaningful design-decision/system-flow map** in a connected design tool, before the corresponding design-dependent implementation. This covers foundations, tokens, components, charts/diagrams, application patterns, demos, docs/Skills, accessibility and migration.

**Tool priority:** use **Penpot** first **when the correct Bluent v3 file is connected**. If it is disconnected, inaccessible, or attached to a different project's file, **immediately use Figma** without blocking useful v3 design work. Figma is an approved alternative, not a second-class sketch. No work item may be treated as designed solely because code, screenshots or a third-party kit exists.

One **authoritative issue-specific design location** (Penpot or Figma) must be named in each issue and PR, with concrete file/page/node IDs, revision or date, review notes and implementation mapping. When switching tools, migrate/synchronize the relevant accepted design or explicitly link the new authoritative location and mark the old one as a prior reference; **do not silently maintain contradictory sources of truth**.

**Reference kit (read-only upstream, not our working file):** [Microsoft Fluent 2 Web — Community](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD/Microsoft-Fluent-2-Web--Community-?t=yMfCvNxMbI8Vc0yU-0) (file key `UxJ11V0c8TI8aaSVpdKeQD`). Verified accessible in Figma on 2026-10-10, with component pages including Button, Field, Dialog, DataGrid, Menu, Tooltip and others. Example Button source: page `8911:3188`, node `9026:639` (Primary / Large / Rest). Preserve the community kit; **do not write into it**, claim ownership or presume its React example code is Blazor-native.

**Bluent v3 Figma working file (editable project output):** [Bluent v3 — Fluent 2 Design System (Working)](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc) (file key `JfxkDgSbNr8W0ppUZPQPHc`). Its first verified board is [#417 Foundation research · draft](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=2-2), page `0:1`, frame `2:2`. This is **a research/architecture decision board only**, not an approved token/variant library or visual acceptance of component implementations.

## Workspace layout

Use a coherent **Bluent v3 Design System** library/file in the currently authoritative tool. Organize work into:

1. **Foundations:** primitive and semantic colors, typography, spacing, radius, elevation, motion, themes, high contrast, focus, density, and RTL/LTR.
2. **Components:** one traceable section per public component, including appearance, size, states, focus, validation, interaction and responsive variants.
3. **Patterns and application shell:** desktop/mobile business-app layouts, forms, dense data, navigation, overlays and cross-component workflows.
4. **Charts, Diagrams and Utilities:** maintain and improve distinctive non-Fluent functionality rather than deleting it or copying generic Fluent components.
5. **Quality and Migration:** parity checks, state matrices, decisions, old-to-new comparison, screenshot evidence and exceptions.

These are **planned categories**; do not claim all the corresponding pages/components have been created.

## Required issue lifecycle

| GitHub Project transition | Design acceptance gate |
| --- | --- |
| **Backlog → Ready** | Specify intended design work, dependencies, upstream reference, required variants/states, review criteria and chosen tool. For the issue that creates the design library, the artifact is the **deliverable** and need not exist beforehand. |
| **Ready → In progress** | Verify access to **the actual Bluent file** in Penpot or Figma. Link the target design page/board and create/review it **before design-dependent UI coding**. |
| **In progress → Review** | Link concrete editable Penpot/Figma file, page and node, design decision/revision, reviewed state matrix, screenshots/exports if useful, and a mapping between the approved design and tested Blazor behavior. |
| **Review → Done** | Reviewer accepts design and implementation parity, exceptions, docs/Skills/demos and migration coverage; required CI passes; PR merges into `bluent-v3` **only**. |

For nonvisual foundation/automation/docs issues, record the meaningful UX/system flow, affected component map or architecture decision in the design tool; do not invent ornamental mockups to satisfy the workflow.

## Per-component review checklist

- Exact issue, Blazor API component/family, authoritative Penpot/Figma page/node and design revision.
- Component anatomy and applicable style, size, state, icon and density variants.
- Supported hover, pressed, selected, focus-visible, disabled, loading, validation and keyboard interactions.
- Light and dark, high-contrast considerations, typography/tokens, screen-reader and focus expectations.
- LTR/RTL, mobile and desktop composition, overlay/portal behavior where applicable.
- Implementation tests plus 100%-feature demo expectation, documentation, consumer Skills and migration guidance linked to the reviewed design.
- Explicit gaps and accepted differences; do not conflate design reference with implemented behavior.

## Changes and tool availability

- When design changes after implementation, update/review the **authoritative design** first; then align code, tests, demo, docs, Skills and migration ledger.
- If a design proves infeasible, record why and amend the authoritative Figma/Penpot design **before** accepting the new implementation.
- If Penpot connects to a different project (e.g. the **PuyaStudio Runner** file, which was verified in the active session on 2026-10-10), **never modify the unrelated file**; use the v3 Figma working file instead.
- If neither Penpot nor Figma can access/create a suitable editable v3 file, document the actual technical blocker and mark the issue Blocked with prior status and next action.
- All code, docs and agent instructions remain isolated on `bluent-v3` or feature branches based on it. Do not update 2.x or its public design/assets. Do not mark Review/Done simply because a Figma document exists.
