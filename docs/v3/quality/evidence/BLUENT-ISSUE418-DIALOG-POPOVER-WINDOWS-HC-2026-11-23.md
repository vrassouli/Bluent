# Issue 418 — Native Windows High Contrast: Dialog and Popover prototype

**Date:** 2026-11-23
**Status:** Limited engineering evidence only; not design, API, assistive-technology or product acceptance.

## Scope and environment

This probe exercised the existing Bluent InteractiveServer fixture at /v3/interactive-portal-lab on Windows 11 Pro (build 28000, x64) using Microsoft Edge 158.0.4370.33. The only native Windows scheme used was **High Contrast White**.

The test read the original HIGHCONTRAST state via SystemParametersInfoW (SPI_GETHIGHCONTRAST). The original state was flags 126 with High Contrast disabled and the High Contrast White scheme selected. It temporarily enabled the native High Contrast flag (127), verified Edge reported both forced-colors: active and prefers-contrast: more, then restored the original flags and scheme in finally. A separate post-run read confirmed flags 126 and High Contrast White.

The browser interactions were issued through Chromium DevTools Protocol to the real Edge page (Input.dispatchMouseEvent and Input.dispatchKeyEvent). These were browser-level events, not physical keyboard presses. No Dialog/Popover UI Automation traversal or screen-reader speech capture was performed during this probe.

## Observed Dialog behavior

| Observation | Result |
|---|---|
| Root semantics | DIV, role="dialog", aria-modal="true" |
| Accessible label reference | aria-labelledby="f17659346_title" |
| aria-describedby | absent on this variant |
| Focus on open | Dialog root f17659346 |
| One Tab | Focus moved to f73d00374 |
| One Shift+Tab | Focus moved to v3-modal-last-0 |
| Escape | Dialog closed |
| Focus after Escape | Returned to v3-show-keyboard-modal |

Computed styles on the Dialog root while the native mode was active:

| Property | Computed value |
|---|---|
| background-color | rgb(255, 250, 239) |
| color | rgb(61, 61, 61) |
| border-color | rgb(61, 61, 61) |
| outline-color | rgb(61, 61, 61) |
| box-shadow | none |
| forced-color-adjust | auto |

This verifies the observed open/close and a subset of focus transitions for this one prototype and environment. It does not prove exhaustive forward/backward focus wrapping or native assistive-technology speech.

## Observed Popover behavior

After activating the existing trigger:

- Trigger #v3-popover-trigger exposed aria-expanded="true".
- Its aria-controls value was v3-popover-trigger_surface.
- The observed surface was a SECTION with no explicit ARIA role.
- The measured surface element's computed background was rgba(255, 250, 239, 0) (transparent), with text/border/outline values of rgb(61, 61, 61) and no box shadow.

The transparent background observation belongs to this specific surface node. This probe did not compute the full ancestor/portal composite surface, calculate a final contrast ratio, or establish whether the surface should have a public role. The public Popover contract remains open for design/maintainer review.

## Evidence files

- Structured observations: BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.json
- Raw browser capture (Popover open): BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23.png

The PNG is a raw CDP capture and has **not** been independently pixel-reviewed. Its SHA-256 and byte length are pinned in the JSON manifest and regression test.

## Explicit limitations and non-claims

- Only one Windows 11 build, one Edge version and High Contrast White were exercised.
- High Contrast Black and user-defined contrast themes remain untested.
- Browser-level CDP events are not physical keyboard input; this probe did not walk the Dialog/Popover UI Automation tree.
- Narrator, NVDA and VoiceOver spoken output were not captured or evaluated.
- Only one Tab, one Shift+Tab and Escape/focus return were checked; exhaustive focus-cycle behavior remains open.
- The full Popover ancestor/portal composite surface was not measured; no contrast ratio is claimed.
- The screenshot was not independently pixel-reviewed.
- This evidence does not approve Penpot, public token names/aliases, production CSS, Focus host contracts, Dialog/Popover API contracts, or general platform/accessibility support.

Issue #418 remains In progress. This evidence is a prototype-specific engineering checkpoint only.
