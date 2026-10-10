# Bluent Project Status

This file is the current project-state entry point. Historical sprint/relaunch detail that previously accumulated here is preserved in [`PROJECT-HISTORY-2026-08-29.md`](PROJECT-HISTORY-2026-08-29.md) and in the versioned sprint plans under `.bluent/sprints/`.

## Parallel v3 foundation (isolated development)

**Design mandate (2026-10-10):** All Bluent v3 tasks require traceable design decisions in **Penpot first, or Figma when the correct Bluent Penpot file is unavailable**; see [`docs/v3/PENPOT-WORKFLOW.md`](../docs/v3/PENPOT-WORKFLOW.md). Penpot is currently connected to an **unrelated PuyaStudio Runner file**, so it must not be modified. The verified [Microsoft Fluent 2 Web Community kit](https://www.figma.com/design/UxJ11V0c8TI8aaSVpdKeQD) is a **read-only reference**. The independent editable [Bluent v3 Figma working file](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc) now contains a [#417 architecture research board](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=2-2) and a [CSS/token decision matrix](https://www.figma.com/design/JfxkDgSbNr8W0ppUZPQPHc?node-id=14-3) with measured light/dark values and four draft decisions. Both are DRAFT, not approved token/component parity. With this authorized fallback, #417's external design connection blocker is resolved and the issue can return to **In progress**, pending acceptance testing and design review.

**Epic:** [#416](https://github.com/vrassouli/Bluent/issues/416) — Fluent by Design
**Integration branch:** `bluent-v3` (protected; all v3 PRs target this branch)
**Active foundation task:** [#417](https://github.com/vrassouli/Bluent/issues/417) — CSS audit and styling ADR
**Work branch:** `v3/issue-417-css-architecture`; [draft PR #498](https://github.com/vrassouli/Bluent/pull/498)
**GitHub Project Status:** In progress (after resolving the earlier design-tool connection blocker; not Review/Done).
**Evidence:** [CSS architecture audit](../docs/v3/architecture/css-architecture-audit.md), [real browser CSS runtime probes](../docs/v3/architecture/css-runtime-probes.md), [contrast/utility/SSR publish evidence](../docs/v3/architecture/accessibility-and-utility-baseline.md) and [theme contract crosswalk](../docs/v3/architecture/theme-contract-crosswalk.md) with Figma frame `14:3`, source scanner and static theme checker (10 branded themes, 9 representative tokens), local NuGet package smoke check, Blazor lab, Release and Debug builds, 20 tests, and limited Chrome interactions.
**Outstanding gate:** decide the verified local-theme/DialogContainer separation, reduced-motion Overlay animation gap and consumer override migration after design-tool review; broader high-contrast/keyboard/SSR and ADR approvals remain before #418 and component migrations. **Design-tool limitation:** Figma Starter MCP quota exhausted in latest session; Penpot is connected to unrelated PuyaStudio Runner, so no new design mutations were attempted.
**Isolation:** legacy `Dev` / stable 2.x releases and public deployments remain unchanged; final v3 integration needs separate explicit approval.

## Current Phase

**Phase:** AI readiness and consumer usability
**Current Work:** Issue #406 — canonical Bluent consumer skill
**Status:** Implementation and acceptance evidence complete; PR review-readiness confirmation in progress
**Working Branch:** `docs/issue-406-consumer-skill`
**Pull Request:** [#407](https://github.com/vrassouli/Bluent/pull/407) — Draft pending final evidence-only CI
**Tracking Issue:** [#406](https://github.com/vrassouli/Bluent/issues/406)
**Product/API Gap Backlog:** [#411](https://github.com/vrassouli/Bluent/issues/411)

## Current Outcome

- `.agents/skills/bluent/` provides a portable, retrieval-oriented Bluent-first consumer skill.
- Canonical documentation remains the API/behavior source of truth; the skill is a router rather than a duplicated encyclopedia.
- The source-reconciled consumer inventory contains 65 retrieval families and all 65 are source verified:
  - 57 `Bluent.UI` families;
  - 2 Charts families;
  - 2 Diagrams families;
  - 4 Utilities families.
- `docs/components/consumer-api-surface.md` classifies service/container/helper/configuration APIs separately from ordinary component families.
- `scripts/quality/check_consumer_skill.py` deterministically checks main-UI source/inventory drift, required skill structure, and canonical index routes in Quality CI.
- `samples/Bluent.TaskExamples` contains representative dogfood scenarios, including Tree selection/DnD contracts and Utilities busy-indicator registration/usage.
- `docs/ai/bluent-consumer-skill-dogfood.md` records scenario coverage and runtime boundaries.
- `docs/ai/issue-406-acceptance.md` maps #406 acceptance criteria to repository evidence.
- Product/API/runtime/accessibility defects discovered during verification are tracked in #411 instead of being silently changed in #406.

## Validation State

Quality run #199 and Release packages run #546 both passed on PR head `d6b8176e5e30ee96340344287baf6338e6a55dd0` after the complete implementation, inventory/link reconciliation, dogfood work, project-state refresh, and acceptance audit.

Quality #199 verified:

- tool/solution restore;
- zero-warning Release solution build;
- canonical TaskExamples compilation and the DrawerContent collision negative control;
- consumer-skill coverage/drift validation;
- solution tests;
- release-tool tests;
- packing/validation of all five public packages;
- local Markdown-link validation;
- workflow YAML parsing;
- focused rendered accessibility checks;
- changed-line whitespace validation.

Release packages #546 verified the exact-ref Release build/tests, all five packages, package metadata/dependencies, deterministic release notes, and artifact upload. NuGet publication and GitHub Release jobs remained skipped; no package, tag, or release was published.

This commit only records the resulting evidence/state. One final CI pass on the evidence-only head is required before changing PR #407 from Draft to review-ready.

Existing runtime evidence in `docs/compatibility/hosting-and-render-modes.md` verifies representative Drawer, Popover, Tooltip, Chart, Diagram, navigation, disposal, overlay, and DOM-measurement behavior in the named interactive modes. That evidence must not be generalized into component-wide/browser-wide accessibility guarantees.

## Current Operational Files

- `.bluent/HANDOFF.md` — immediate #406 continuation instructions.
- `.bluent/QUALITY.md` — validation vocabulary, baseline policy, and #406-specific gate.
- `docs/components/inventory.md` — current 65-family consumer retrieval ledger.
- `.agents/skills/bluent/SKILL.md` — portable skill entry point.
- `.agents/skills/bluent/COMPONENT-INDEX.md` — targeted family routing.
- `docs/components/consumer-api-surface.md` — non-component consumer API classification.
- `docs/ai/bluent-consumer-skill-dogfood.md` — dogfood scenario matrix.
- `docs/ai/issue-406-acceptance.md` — acceptance evidence audit.
- `docs/compatibility/hosting-and-render-modes.md` — runtime/render-mode evidence.

## Remaining #406 Work

1. Confirm Quality and Release-package workflows on this evidence-only head.
2. Refresh PR #407 with exact final-head workflow evidence and mark it review-ready if those checks pass.
3. Keep runtime-sensitive limitations explicitly bounded where browser evidence is absent.
4. Keep #411 open for product/API gaps found during or after the skill work.
5. Do not merge PR #407 or close #406 as part of the implementation task.

## Working Agreement

- Do not invent public APIs, support claims, render modes, assets, or accessibility behavior.
- Keep canonical docs authoritative and the consumer skill retrieval-oriented.
- Prefer Bluent components for user-facing interactive UI where Bluent has a suitable equivalent.
- Preserve public API consistency; product/API fixes discovered while documenting #406 require separate approval/work.
- Record validation at the evidence level actually exercised: source, build, test, pack, runtime, visual, or deployment.
- Update this file, `.bluent/HANDOFF.md`, the tracking issue, and PR when active project status materially changes.
- Do not merge, publish packages, tag/release, or close #406 unless separately instructed.

## Historical Project Record

The prior detailed relaunch/Sprint 0–4 project record is preserved verbatim in [`PROJECT-HISTORY-2026-08-29.md`](PROJECT-HISTORY-2026-08-29.md). Use it for historical decisions and completed sprint evidence; use this file for current project state.