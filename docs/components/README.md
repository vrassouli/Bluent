# Component documentation

Bluent component documentation is developed from a source-derived inventory and a shared reference standard. This directory is the canonical API/behavior reference surface; the consumer skill routes here rather than duplicating the catalog.

## Start here

- [Public component inventory and coverage](inventory.md)
- [Component reference template](TEMPLATE.md)
- [Consumer skill component index](../../.agents/skills/bluent/COMPONENT-INDEX.md)
- [Consumer infrastructure classification](consumer-infrastructure.md)
- [Getting Started](../getting-started/index.md)
- [Package selection and boundaries](../packages/index.md)
- [Hosting models and render modes](../compatibility/hosting-and-render-modes.md)
- [Theming, localization, RTL, and browser assets](../guides/theming-localization-rtl-and-assets.md)

## Main UI coverage

All 57 currently tracked `Bluent.UI` component families have source-verified canonical references. The maintained [inventory](inventory.md) remains the authoritative coverage ledger.

Coverage includes actions/content, fields/selection/capture, list/data, pointer/range input, overlays/feedback, navigation/workflow, layout/responsive primitives, typed icons, and labels. Use the inventory or consumer-skill index for the exact family route rather than scanning every page.

## Optional-package references

The optional packages are grouped by consumer retrieval family rather than one row per public CLR type:

- [Chart composition](chart.md) — `Chart`, `Dataset`, `Legend`, `Title`, `Subtitle`, Charts `Tooltip`, and `XScale`/`YScale`.
- [Gauge](gauge.md) — JS-backed gauge visualization.
- [Diagram / DrawingCanvas](diagram.md) — diagram interaction surface.
- [Basic diagram shapes](diagram-shapes.md) — `Circle`, `Line`, and `Rect`.
- [AppBusyIndicator](app-busy-indicator.md) — Utilities busy-indicator service/component.
- [Hierarchy utilities](hierarchy.md) — hierarchy tree/item browsing and selection workflows.
- [MDI tabs](mdi-tab.md) — dynamic document/tab service and lifecycle.
- [Command toolbar buttons](toolbar-buttons.md) — save/undo/redo helpers over `CommandManager`.

## Current status

The source-reconciled consumer inventory currently tracks **65 retrieval families** across `Bluent.UI`, Charts, Diagrams, and Utilities, and all 65 have source-verified canonical references. Dialog additionally retains separately recorded runtime verification.

The 65-family model intentionally differs from the earlier 76-type ledger: tightly coupled public helpers/configuration components in Charts and Diagrams are grouped with the consumer workflow that makes them useful instead of being treated as independent retrieval families. Consumer-facing services and infrastructure are classified separately in [consumer-infrastructure.md](consumer-infrastructure.md).

Source verification means API/markup/implementation claims were checked against current source. It is not a blanket runtime guarantee. High-risk JS, browser-permission, pointer, keyboard, RTL, accessibility, and render-mode behavior remains explicitly marked as requiring runtime evidence where applicable.

Deterministic coverage/drift validation is implemented by `scripts/quality/check_consumer_skill.py` and runs in the Quality workflow. Product/API gaps discovered during verification are tracked in issue #411.

## Rules

- Verify APIs against current public source before marking a reference source verified.
- Prefer existing runnable/compiled demos and task examples as secondary evidence.
- Do not invent parameters, defaults, events, services, assets, accessibility guarantees, or render-mode support.
- Record product/API defects separately instead of silently changing behavior while documenting it.
- Keep helper/configuration types grouped with their consumer family unless independent retrieval materially improves usage.
- Keep skill routes compact and point agents here for detailed canonical API guidance.
