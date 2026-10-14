# Bluent v3 development router — not released

> **Development-only Skill for the isolated `bluent-v3` branch.** No stable Bluent v3 package/API has been released. **Never recommend installing a v3 NuGet package** or using a Penpot preview as production Razor syntax.

## First decision: which Bluent version does the task actually target?

- **Application using existing released Bluent / 2.x or `Dev`:** use the existing [Bluent consumer Skill](../bluent/SKILL.md), the consumer's actual installed package version, and verified [current component references](../../../docs/components/inventory.md). Do not silently switch that application to experimental v3.
- **Implementation, design or documentation of v3 itself:** use the [canonical v3 docs](../../../docs/v3/README.md), [approved D1–D5 architecture](../../../docs/v3/architecture/ADR-0001-styling-boundaries.md), [owned Penpot design and provenance](../../../docs/v3/design/BLUENT-V3-PENPOT.md), and the family's actual implementation issue and task branch.
- **Question where version is unknown:** inspect the consuming project's NuGet/branch first. A future design is not the installed package.

## Evidence and component routing

1. Locate the **existing** component family in [the 66-family inventory](../../../docs/components/inventory.md). This establishes what exists in 2.x, **not** what has shipped in v3.
2. Find the corresponding family issue under [Epic #416](https://github.com/vrassouli/Bluent/issues/416); read its **real GitHub Project status**, PR base, and acceptance criteria. Follow [the component routing contract](COMPONENT-ROUTER.md).
3. For a v3 family marked Backlog/Ready/In progress/Review, do **not** claim a public v3 component API. Source/design prototypes are evidence only of their respective scope.
4. For an accepted family, check the actual merged `bluent-v3` source, versioned canonical reference, full demo, tests, migration row and component-specific Skill. The Skill must never replace source and docs.
5. If a verified source or consumer documentation answer cannot be found, report the gap; never invent a parameter, event, Razor `@bind-` target, enum, asset path, service or ARIA behavior.

## Design-first and release isolation

- Design source is the project-owned **Bluent v3 Design System** Penpot file recorded in #419. The imported Microsoft Fluent kit is **read-only upstream reference**.
- Follow the [design-tool workflow](../../../docs/v3/PENPOT-WORKFLOW.md) and [branch policy](../../../docs/v3/BRANCHING.md). Each v3 task branch targets `bluent-v3` only. Never merge a v3 task into stable `Dev`, main, or existing 2.x.
- Experimental #418 brand/focus/Danger candidates are **not released** and not approved public tokens. Do not make Focus2 black/white the default: maintainer preference is the brand-colored Button focus and an underline-only TextField, pending contrast-safe implementation.
- Distinguish static source analysis, .NET compilation, real WASM/InteractiveServer browser checks, Penpot geometry review, native OS contrast and assistive-technology testing. One does not certify another.

## Authoring a new component-family Skill

Only after the component's API and design have been independently verified, copy the [family Skill template](FAMILY-SKILL-TEMPLATE.md) into a dedicated component-specific Skill; complete its source/API/test/migration matrix and connect it to the [canonical component reference template](../../../docs/v3/COMPONENT-REFERENCE-TEMPLATE.md). Do not auto-generate 66 fictional completed Skills from the existing 2.x inventory.

## Finish rule

For each v3 contribution: identify the correct issue/branch, record design IDs, build/runtime outcomes and unknowns, route the component to its actual canonical docs, preserve compatibility unless an API break is explicitly approved, and never mark a task Done until its accepted PR merges into `bluent-v3` under [workflow](../../../docs/v3/ISSUE-WORKFLOW.md).
