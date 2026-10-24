# #552 / #465 — Live TabList panel, URL and disabled scenarios

**Observed 2026-10-22 on Dev01, original Bluent WebAssembly Demo** with native CDP keyboard events in Chrome and Edge. **Not** Fluent 2 acceptance, native screen-reader signoff, or design approval.

Reproducer: `node scripts/quality/probe_v3_tablist_scenarios.mjs chrome` and `node scripts/quality/probe_v3_tablist_scenarios.mjs edge`. Captured raw data:
- [Chrome](evidence/BLUENT-TABLIST-SCENARIOS-CHROME.json)
- [Edge](evidence/BLUENT-TABLIST-SCENARIOS-EDGE.json)

## Findings reproduced in both browsers

1. **Real panel tab header:** Under the "With Panels" demo section, both horizontal and vertical tab groups expose three native buttons each. Selected state is conveyed via CSS class, but sampled items have no emitted `role=tab`, `aria-selected`, or `aria-controls`. The six associated panel nodes have no `role=tabpanel` or `aria-labelledby`. This is an accessible relationship gap, not merely a cosmetic difference.
2. **Keyboard:** Programmatically focusing the second panel tab succeeds. A native ArrowRight key does **not** move that focus to a neighboring tab in either browser. With the CDP keyDown Enter text/unmodifiedText set to a native carriage return, Enter on the focused second tab selects "Departures" in both observed groups. An earlier probe omitted that keyboard text payload and produced a **false negative** for Enter activation; that evidence was corrected, not carried as a product defect.
3. **Tab stop count:** Programmatically focus the first panel tab and send one **native Tab** key. In both browsers, focus moves to the **second tab** in the same tablist, rather than leaving the composite; all sampled non-disabled tab buttons report native tabIndex 0. This is different from the W3C APG single-tab-stop/roving model.
4. **Link activation:** Focus the second actual URL link and dispatch native Enter with its text payload. In both browsers the demo navigates to `?tab2`; the original links are operational and should retain their navigation nature.5. **Disabled:** The demo initializes its second disabled tab as selected (`SelectedIndex=1`). The element renders `disabled` and cannot receive focus, but remains CSS-selected; the visual selected state is therefore not keyboard-operable. This is a source/demo state consistency gap that needs a defined disabled-selection policy.
6. **URL navigation:** Four items under "Urls" are real `A` elements with `href=/components/tablists?tabN`, not panel buttons. Their navigation behavior and semantics must be evaluated independently. Do **not** blanket-convert navigation links to `role=tab`.

## Important limitations

The "With Panels" section contains two distinct tab groups; the snapshot intentionally captures both (6 items/panels total), not one six-tab group. Browser inputs were native via CDP but the focus setup was programmatic to isolate keyboard behavior. Chrome/Edge accessibility-tree or manual OS/AT certification was not performed in this dedicated scenario run. No dynamic removal/reorder was executed. No product files changed, no acceptance case promoted, #420/#465 design gates remain open.

Source/quality ownership: #552 audit, #465 TabList implementation, #420 shared focus architecture. PR #553 stays Draft, `Dev` stays untouched.

## Explicit standards comparison

The W3C [ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) specifies a tablist/tab/tabpanel relationship, a single native Tab entry to the active tab, arrow navigation within the composite, and manual Enter/Space activation (or reviewed automatic activation). The [manual activation example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/) documents roving tabindex and matching aria-controls/aria-labelledby IDs. These are **design/acceptance references**, not proof that Bluent currently implements them; a reviewed #420/#465 design must decide how independent URL links fit without misusing tab roles.
