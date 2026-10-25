# #552 — Focus navigation policy experiment

**PROTOTYPE ONLY; NOT Bluent product code.** This is the isolated research fixture `scripts/quality/fixtures/focus-navigation-core-prototype.mjs`. The fixture contains pure functions (`findFocusTarget`, `rovingTabStops`, `canActivate`), **no DOM, Blazor or actual browser keyboard handlers**. Focus selection does not itself move native focus or update ARIA.

Run `node --test scripts/quality/test_v3_focus_navigation_prototype.mjs`. The **35 Node.js** tests cover LTR/RTL horizontal movement, vertical movement, wrap and non-wrap, Home/End, native key pass-through, disabled tab skip, disabled menu focus-without-activation, hidden/removed entry skip, deterministic restoration after deletion, single eligible roving tab stop and duplicate ID rejection.

The horizontal RTL visual-order rule is a *draft policy*. Do not promote it to approved production behavior without #420/#465 design and comparison to accepted Fluent reference. Disabled focus eligibility and command activation are separate decisions.

The [33-case component acceptance matrix](FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json) remains **planned/not-executed**, regardless of these pure prototype test results. See [real keyboard evidence](FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md). No product source changes or native OS/AT validation in this experiment.

## Wave H follow-up

The optional focusWithin research flag and [manual TabList re-entry proposal](FOCUS-KEYBOARD-REENTRY-DECISION.md) add **eight pure tests** (43 cumulative Node tests). No new public API, Blazor runtime behavior, Fluent parity acceptance or native browser evidence is claimed.
