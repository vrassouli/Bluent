# Issue #406 acceptance evidence

This file maps the acceptance criteria from GitHub issue #406 to concrete repository evidence. It is intentionally an evidence ledger, not another API reference.

Status vocabulary follows `.bluent/QUALITY.md`:

- **Satisfied** — the criterion has repository evidence at the stated level.
- **Bounded** — the required source/consumer guidance exists and runtime-sensitive claims are explicitly limited to verified evidence; broader behavior is intentionally not claimed.

| #406 acceptance criterion | Status | Evidence |
| --- | --- | --- |
| Current public component/service surface is reconciled and inventory is accurate | **Satisfied** | `docs/components/inventory.md`; `docs/components/consumer-api-surface.md`; source-derived main-UI drift check in `scripts/quality/check_consumer_skill.py` |
| Every consumer-facing family exposed through the skill has a canonical source-verified reference based on the component-reference standard | **Satisfied** | Inventory records 65/65 retrieval families source verified: 57 main UI, 2 Charts, 2 Diagrams, 4 Utilities |
| High-risk interactive/JS-dependent families have runtime evidence or explicitly marked verified limitations | **Bounded / satisfied by the issue criterion** | Component pages explicitly identify remaining browser/keyboard/a11y limits; `docs/compatibility/hosting-and-render-modes.md` provides representative Drawer/Popover/Tooltip/Chart/Diagram/overlay/render-mode evidence. No component-wide guarantee is inferred from representative probes. |
| `.agents/skills/bluent/SKILL.md` exists and is a compact consumer router | **Satisfied** | `SKILL.md` routes by task/foundation/pattern/component and contains the Bluent-first policy, authority order, version-awareness, and completion checks |
| Component index covers supported public consumer-facing families across included packages | **Satisfied** | `.agents/skills/bluent/COMPONENT-INDEX.md`; optional helper types are grouped into retrieval families instead of one route per CLR type |
| Decision guide maps common UI needs to the correct Bluent family | **Satisfied** | `.agents/skills/bluent/DECISION-GUIDE.md` |
| Foundation references cover setup/assets, theming, RTL/localization, forms/validation, accessibility, render-mode considerations | **Satisfied** | `.agents/skills/bluent/references/foundation/` plus canonical compatibility/setup docs |
| Pattern references cover forms, CRUD, overlays, navigation, data entry and DnD | **Satisfied** | `.agents/skills/bluent/references/patterns/` |
| Each exposed family has purpose/use cases, package/namespace, minimal verified usage, API/events/binding/states/composition/setup/theming/RTL/accessibility/mistakes/limitations/evidence as applicable | **Satisfied** | Canonical pages under `docs/components/`; fields are omitted only when not applicable and unverified behavior is labeled rather than invented |
| Skill guidance never invents APIs absent from source/docs | **Satisfied by design/checks** | Source-verification pass, compiled TaskExamples, Bluent-first/authority rules, and deterministic canonical-route validation |
| Skill is version-aware and does not confuse `Dev` with released package behavior | **Satisfied** | `SKILL.md` authority/version sections and foundation setup guidance |
| Raw/custom interactive HTML fallback rules are explicit and Bluent-first | **Satisfied** | `SKILL.md` and `DECISION-GUIDE.md` |
| Repeatable coverage/link/drift check prevents silent omissions | **Satisfied** | `scripts/quality/check_consumer_skill.py` in `.github/workflows/quality.yml`; existing `check_markdown_links.py`; source-derived main-UI mapping with explicit infrastructure exception for `ContainersComponent` |
| Representative consumer dogfood scenarios demonstrate Bluent-first discovery/usage | **Satisfied at compile/source level; runtime bounded** | `docs/ai/bluent-consumer-skill-dogfood.md`; canonical TaskExamples for form validation, CRUD/DataGrid, Dialog, Tree selection/DnD, theme/RTL, Charts, Diagrams, and Utilities |
| `docs/components/inventory.md`, docs indexes/`llms.txt`, and AI-readiness documentation are updated consistently | **Satisfied** | inventory, `docs/README.md`, `docs/components/README.md`, `llms.txt`, dogfood matrix, skill index |
| Full solution build/tests required by `AGENTS.md` pass; skipped runtime verification is documented precisely | **Satisfied** | Quality run #199 and Release packages run #546 passed on head `d6b8176e5e30ee96340344287baf6338e6a55dd0` after the complete implementation, dogfood, inventory/link reconciliation, project-state refresh and acceptance audit. This evidence-record-only commit does not alter product/runtime behavior; it still receives the normal final CI gate before PR readiness. |

## Runtime scope carried into #406

Existing repository browser evidence is reusable only at its recorded scope. In particular, the compatibility matrix verifies representative interactive behavior for Drawer, Popover, Tooltip, Chart, Diagram, navigation, disposal, overlays, and DOM measurement across named interactive modes. It does **not** prove every component, every parameter mutation, every keyboard model, every screen reader, every browser permission path, or every RTL interaction.

Canonical pages therefore keep component-specific unverified behavior explicit. Product defects or missing semantics discovered while establishing those boundaries are tracked in issue #411.

## Dogfood coverage

The required scenario set is mapped in `docs/ai/bluent-consumer-skill-dogfood.md`. The standalone `samples/Bluent.TaskExamples` consumer directly exercises package references/registration and compiles representative tasks for:

- form input/validation;
- DataGrid CRUD/paging composition;
- Dialog confirmation;
- Tree selection and DnD event contracts;
- theme/dark/RTL layout;
- Charts;
- Diagrams;
- Utilities busy-indicator service/component usage.

Compilation validates the public Razor/C# contracts and setup; browser behavior remains governed by the exact runtime evidence above.

## Project-state tracking

`.bluent/PROJECT.md` reflects Issue #406 as the current workstream. The prior detailed Sprint 0–4/relaunch record is preserved verbatim as `.bluent/PROJECT-HISTORY-2026-08-29.md`. `.bluent/HANDOFF.md` and `.bluent/QUALITY.md` also describe the current #406 continuation and validation contract.

## Review-readiness gate

All issue acceptance criteria now have repository evidence at the level the issue requires. The only remaining operational gate is the standard CI pass on this final evidence-record-only head. After it passes, PR #407 can be marked ready for review without merging it or closing #406. Issue #411 remains open as the separate product-gap backlog.
