# #418 — TextField underline and Button ring design review

**Date:** 2026-10-13. Actual maintainer preference after testing the real Styling Lab. Scope: isolated v3 opt-in research, not shipped Bluent v2 CSS.

## Decision

- **Button:** maintain the brand-colored :focus-visible ring as the default. The neutral Focus2 and Focus2 double-ring choices remain comparison-only and unapproved.
- **TextField:** no separate rectangular outline around the focused wrapper. The existing Bluent TextField already shows a 2px animated bottom brand-colored stroke at :focus-within::after; that stroke is the normal focus indicator.
- **Forced Colors:** retain the native TextField underline but map its bottom stroke to system Highlight; do not add an additional frame.
- The tested brand ring on ten Dark modes had 1.94–2.15:1 contrast vs nearby surfaces: **aesthetic preference does not waive the 3:1 review gate.** A brand-faithful accessible treatment for those modes still needs design, real OS validation and approval.

## Implementation evidence

The accidental shared focus rule in src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css included Button:focus-visible AND .bui-field:focus-within. It now applies a 2px brand outline **only** to Button:focus-visible. In forced colors, the existing field pseudo-element underline gets Highlight, not a new ring. The demonstration labels the optional double ring as آزمایشی, not پیشنهادی. The actual library source src/Bluent.UI/Styles/Components/_field.scss and all stable v2 assets are unchanged.

The actual Blazor Chromium WebAssembly probe reads the focused TextField wrapper and its ::after computed styles in Light, Dark and emulated OS forced colors: in each mode outline-style was none, pseudo bottom border was solid and 2px, color visible and transform fully extended (matrix(1, 0, 0, 1, 0, 0)). Forced-colors mapped the underline to a visible system color. The complete browser suite then passed **592/592 checks, zero failures**. Exploratory earlier runs verified the field but timed out later on an unrelated Dialog-close wait when this new focus/media manipulation was at the start of the suite. Moving it to the end restored the full-suite pass and separated component focus from modal lifetime test timing.

## Design refs and limits

Source-owned Penpot file: Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000); pages 07 Accessibility & RTL (07c521b9-e441-80bd-8008-c4b24ce6f58c), 32 High contrast and reduced motion (#418), 38 Button Focus Visible states (#501). The connected Penpot tab suspended during this review update, so **a fresh Penpot edit or visual approval is not claimed**; the decision is recorded here and in issue #418 pending next connection. Real Windows OS high contrast, AT/screen readers, browser-native zoom/reflow and full brand-specific focus contrast certification still need review.
