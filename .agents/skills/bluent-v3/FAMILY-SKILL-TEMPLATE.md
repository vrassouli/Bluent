# [Bluent v3 family] — component-specific Skill authoring template

> **Not a released API and not an implemented component Skill.** Do not copy placeholders into consumer instructions. This template is used only after corresponding real source, design, demo and tests exist.

## Provenance (mandatory)

Record exact public family name, issue/PR/merge commit, package/namespace, source files, version/branch, owned Penpot/Figma file + page/variant IDs, and matching [canonical v3 component reference](../../../docs/v3/COMPONENT-REFERENCE-TEMPLATE.md). Do not imply the Fluent upstream reference is Bluent source design.

## Retrieval rules

Write short task-specific routes: verified setup/dependencies, public parameter/event/binding syntax, supported states/appearances/sizes, icon & slot rules, generic constraints, keyboard/focus/ARIA/accessibility, overlays/disposal if applicable, Persian RTL, mobile/reflow, render-mode limitations, and 2.x migration changes. Link to canonical docs for detailed tables instead of duplicating the full API.

## Verified examples only

For every Razor snippet include an actual compilable project/fixture and exact documented API version. If no runnable example exists, say **Unimplemented — no verified v3 sample**. Never invent an enum, parameter, asset name, @bind expression, public CSS token or release version.

## Confidence ledger

Separate: source readback, build, actual browser keyboard/interaction, visual Penpot parity, high contrast browser emulation, native OS contrast and screen-reader/AT. Attach reproducible test command, run result and limitations. No WCAG conformance claims based only on color calculations.

## Version routing and regression

Link the existing [2.x consumer Skill](../bluent/SKILL.md) for released consumers and the [v3 Skill router](SKILL.md) for v3 development. Classify every API or CSS change as unchanged/additive/deprecated/breaking, with accepted source-compiled before/after and migration/rollback steps. Preserve existing v2 docs/assets.

## Ready-to-publish gate

A family-specific Skill becomes an accepted part of `bluent-v3` only after its component issue reaches Review with genuine source, design, browser, documentation and migration evidence, and then Done upon approved merge. It does **not** imply stable NuGet availability.
