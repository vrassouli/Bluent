# Component documentation

Bluent component documentation is developed from a source-derived inventory and a shared reference standard. This directory is the canonical API/behavior reference surface; the consumer skill routes here rather than duplicating the catalog.

## Start here

- [Public component inventory and coverage](inventory.md)
- [Component reference template](TEMPLATE.md)
- [Consumer skill component index](../../.agents/skills/bluent/COMPONENT-INDEX.md)
- [Getting Started](../getting-started/index.md)
- [Package selection and boundaries](../packages/index.md)
- [Hosting models and render modes](../compatibility/hosting-and-render-modes.md)
- [Theming, localization, RTL, and browser assets](../guides/theming-localization-rtl-and-assets.md)

## Main UI coverage

All 57 currently tracked `Bluent.UI` component families now have source-verified canonical references. The maintained [inventory](inventory.md) remains the authoritative coverage ledger.

Coverage includes actions/content, fields/selection/capture, list/data, pointer/range input, overlays/feedback, navigation/workflow, layout/responsive primitives, typed icons, and labels. Use the inventory or consumer-skill index for the exact family route rather than scanning every page.

## Optional-package references

Current source-verified optional-package work includes:

- [Chart composition](chart.md) — `Chart`, `Dataset`, `Legend`, `Title`, `Subtitle`, Charts `Tooltip`, and `XScale`/`YScale`.
- [Gauge](gauge.md) — JS-backed gauge visualization.
- [Diagram / DrawingCanvas](diagram.md) — diagram interaction surface.
- [Basic diagram shapes](diagram-shapes.md) — `Circle`, `Line`, and `Rect`.
- [AppBusyIndicator](app-busy-indicator.md) — Utilities busy-indicator service/component.
- [Hierarchy utilities](hierarchy-utilities.md) — hierarchy tree/item browsing and selection workflows.
- [MDI tabs](mdi-tabs.md) — dynamic document/tab service and lifecycle.
- [Command toolbar buttons](toolbar-buttons.md) — save/undo/redo helpers over `CommandManager`.

The optional-package inventory is being reconciled by consumer-facing family rather than treating every public helper/configuration class as an independent component family.

## Current status

The source-reconciled inventory currently tracks 76 families/types across `Bluent.UI`, Charts, Diagrams, and Utilities. Main UI coverage is 57/57 source verified; Dialog additionally retains separately recorded runtime verification. Optional-package source verification is now underway and must be reflected in the inventory/index before #406 acceptance.

Source verification means API/markup/implementation claims were checked against current source. It is not a blanket runtime guarantee. High-risk JS, browser-permission, pointer, keyboard, RTL, and accessibility behavior remains explicitly marked as requiring runtime evidence where applicable.

## Rules

- Verify APIs against current public source before marking a reference source verified.
- Prefer existing runnable/compiled demos and task examples as secondary evidence.
- Do not invent parameters, defaults, events, services, assets, accessibility guarantees, or render-mode support.
- Record product/API defects separately instead of silently changing behavior while documenting it. Gaps discovered during #406 are tracked in issue #411.
- Keep skill routes compact and point agents here for detailed canonical API guidance.
