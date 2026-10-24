# #552 Wave I — Focus lifecycle, unmount and popup restoration

> **Research only; NOT approved design or product implementation.** 21 October 2026. Handoff for #420, #465, #466, #469/#507 and #517. Stable `Dev`, product API/CSS and demo are unchanged; #552 remains In progress, PR #553 Draft.

## What actually ran

The pure state model `scripts/quality/fixtures/focus-lifecycle-prototype.mjs` passed **42 Node.js tests**. It models internal versus external focus transitions, null `relatedTarget`, stale focus requests, removed nodes, popup close, focus restoration and disposal.

A separate **independent HTML fixture** in `scripts/quality/fixtures/focus-lifecycle-browser.html` was exercised on Dev01 Windows via real native Chromium CDP `Input.dispatchKeyEvent` events in **Chrome 155** and **Edge 155**. Three conditions were checked per engine: Light/LTR, Dark/RTL and CSS Forced Colors **emulation**.

| Browser source | Light/LTR | Dark/RTL | Forced Colors | Total |
| --- | ---: | ---: | ---: | ---: |
| Chrome 155 | 23/23 | 23/23 | 23/23 | **69/69** |
| Edge 155 | 23/23 | 23/23 | 23/23 | **69/69** |

In total **138/138 measured browser assertions**, 12 saved real screenshots and two native focus trace JSON files. Browser launch uses dedicated disposable profiles and process cleanup identifies **only that exact profile path**. Node core WebSocket/CDP is used; no Playwright installation or generated JavaScript KeyboardEvent shortcuts. Evidence lives under [evidence](evidence/).

These are **not tests of current Bluent** TabList, MenuList, native OS AT, actual Windows High Contrast mode, published Blazor InteractiveServer or Fluent design parity. The independent fixture intentionally implements the **proposed** roving-focus behavior missing from Bluent TabList; its green results do not mean component defects are fixed.

## Actual focus/keyboard outcomes in independent browser fixture

1. Native Tab from the preceding control reaches selected Tab A.
2. ArrowRight (LTR) / ArrowLeft (RTL) focuses B **without changing Selection A**. Real `focusout` of A records `relatedTarget=B`, proving this is an internal move.
3. Tab exits to After. The next tab stop resets to still-selected A and native Shift+Tab reenters A.
4. Removing focused B does **not** forcibly focus A. Surviving A remains a valid entry.
5. Enter opens a popup with focus inside; Escape restores connected trigger **only if** focus is still owned by popup.
6. If focus moved outside before close, closing the popup does not hijack it.
7. If trigger was removed, Escape closes without focus restoration onto a disconnected node.

The DOM removal and popup fixture handlers are scripted test setup; the keyboard/focus inputs and events are browser-native.

## #420 proposed lifecycle policy

The separate `FocusLifecycleResearch` model tracks a monotonically increasing **epoch/ticket** to invalidate pending asynchronous focus operations after focus ownership change, rerender, removal, popup closing, or disposal. A `focusout` with null related target requests delayed `activeElement` verification rather than assuming the scope has been exited.

Authorization to focus is a **decision only**: Blazor must still check the real DOM node's connection and actual focus ownership immediately before post-render `ElementReference.FocusAsync()` / narrowly-scoped JS focus. A removed node may define a future Tab entry but must not receive an unconditional focus jump. Popup restoration must be conditional on trigger connection and absence of unrelated user focus.

No product FocusNavigationCore exists from this audit and no public `focusWithin` parameter is proposed.

## Owner handoffs and gates

For #420: scope `focusin`/`focusout`, null relatedTarget, epoch invalidation, disposal, safe post-render focus. For #465: manual activation, reentry selected-vs-focused, RTL and disabled/overflow. For #466, #469/#507: disclosure semantics and nested-link/action focus isolation. For #517: trigger restore after Escape versus outside focus, disabled menu policies. For #429: prevent decorative icon glyphs contaminating accessible names.

**All 33 owner-bound scenarios** in [planned acceptance matrix](FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json) retain `status=planned` and `evidence=null`. Component implementation, approved editable Bluent v3 Penpot/Figma design and product-specific browser/AX and AT checks are required before any signoff.

## Exact rerun

- `node --test scripts/quality/test_v3_focus_lifecycle_prototype.mjs`
- `node scripts/quality/probe_v3_focus_lifecycle_browser.mjs chrome`
- `node scripts/quality/probe_v3_focus_lifecycle_browser.mjs edge`
- `python -m unittest discover -s scripts/quality -p test_v3_focus_lifecycle_evidence.py -v`

**CI validates stored browser evidence and pure tests only; it does not run a live browser.**

## Real Blazor InteractiveServer follow-up (Wave J, 2026-10-21)

The [isolated .NET 10 InteractiveServer FocusAsync experiment](BLUENT-BLAZOR-FOCUS-REAL-LIFECYCLE.md) now adds 174 real Chrome/Edge checks of framework ElementReference.FocusAsync, post-render popup focus, a delayed Task.Delay handler canceled after unrelated focus and a target removed during an await. It is **still NOT original Bluent component acceptance**, and the 33 owner scenarios remain planned.
