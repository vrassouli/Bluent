# #552 / #465 — Live TabList panel, URL and disabled scenarios

**Observed 2026-10-22 on Dev01, original Bluent WebAssembly Demo** with native CDP keyboard events in Chrome and Edge. **Not** Fluent 2 acceptance, native screen-reader signoff, or design approval.

Reproducer: `node scripts/quality/probe_v3_tablist_scenarios.mjs chrome` and `node scripts/quality/probe_v3_tablist_scenarios.mjs edge`. Captured raw data:
- [Chrome](evidence/BLUENT-TABLIST-SCENARIOS-CHROME.json)
- [Edge](evidence/BLUENT-TABLIST-SCENARIOS-EDGE.json)

## Findings reproduced in both browsers

1. **Real panel tab header:** Under the "With Panels" demo section, both horizontal and vertical tab groups expose three native buttons each. Selected state is conveyed via CSS class, but sampled items have no emitted `role=tab`, `aria-selected`, or `aria-controls`. The six associated panel nodes have no `role=tabpanel` or `aria-labelledby`. This is an accessible relationship gap, not merely a cosmetic difference.
2. **Keyboard:** Programmatically focusing the second panel tab succeeds. A native ArrowRight key does **not** move that focus to a neighboring tab in either browser. Following native Enter, both observed groups retain the original "Arrivals" selected CSS state in this test. That result requires a separately scoped activation retest before asserting a universal Enter bug.
3. **Disabled:** The demo initializes its second disabled tab as selected (`SelectedIndex=1`). The element renders `disabled` and cannot receive focus, but remains CSS-selected; the visual selected state is therefore not keyboard-operable. This is a source/demo state consistency gap that needs a defined disabled-selection policy.
4. **URL navigation:** Four items under "Urls" are real `A` elements with `href=/components/tablists?tabN`, not panel buttons. Their navigation behavior and semantics must be evaluated independently. Do **not** blanket-convert navigation links to `role=tab`.

## Important limitations

The "With Panels" section contains two distinct tab groups; the snapshot intentionally captures both (6 items/panels total), not one six-tab group. Browser inputs were native via CDP but the focus setup was programmatic to isolate keyboard behavior. Chrome/Edge accessibility-tree or manual OS/AT certification was not performed in this dedicated scenario run. No dynamic removal/reorder was executed. No product files changed, no acceptance case promoted, #420/#465 design gates remain open.

Source/quality ownership: #552 audit, #465 TabList implementation, #420 shared focus architecture. PR #553 stays Draft, `Dev` stays untouched.
