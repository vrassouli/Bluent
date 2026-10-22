# #552 browser audit — Label, Link and Badge

**Partial runtime evidence only; no Fluent parity acceptance.** The Bluent UI Demo WebAssembly app was built from source baseline `73155f02` and exercised in headless Chrome and Edge using Chromium DevTools Protocol (CDP). Each engine completed **31/31 instrumentation checks** and produced nine screenshots. No product component source or design file was changed.

## Scope and evidence

- Routes: `/components/labels`, `/components/links`, `/components/badges`; viewport 1280 × 960.
- Modes: Light/LTR and Dark/RTL via the demo's header switches; forced-colors is CDP-emulated. `prefers-reduced-motion: reduce` is emulated separately for the animated Badge.
- The run captures DOM attributes, browser accessibility-tree roles/names, focusability, the disabled Link representation, Badge computed animation and screenshots. It does **not** test native screen readers, native OS contrast, a real user-gesture click callback on disabled Link, or a published InteractiveServer app.

| Evidence | Result |
| --- | --- |
| [Chrome structured evidence](evidence/BLUENT-LABEL-LINK-BADGE-CHROME.json) | 31/31 checks; 0 failed |
| [Edge structured evidence](evidence/BLUENT-LABEL-LINK-BADGE-EDGE.json) | 31/31 checks; 0 failed |
| Chrome screenshots | [Label · Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-LABEL-LIGHT-LTR.png) · [Link · Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-LINK-LIGHT-LTR.png) · [Badge · Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-BADGE-LIGHT-LTR.png) · [Label · Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-LABEL-DARK-RTL.png) · [Link · Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-LINK-DARK-RTL.png) · [Badge · Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-BADGE-DARK-RTL.png) · [Label · forced colors](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-LABEL-FORCED-COLORS.png) · [Link · forced colors](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-LINK-FORCED-COLORS.png) · [Badge · forced colors](evidence/BLUENT-LABEL-LINK-BADGE-CHROME-BADGE-FORCED-COLORS.png) |
| Edge screenshots | [Label · Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-LABEL-LIGHT-LTR.png) · [Link · Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-LINK-LIGHT-LTR.png) · [Badge · Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-BADGE-LIGHT-LTR.png) · [Label · Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-LABEL-DARK-RTL.png) · [Link · Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-LINK-DARK-RTL.png) · [Badge · Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-BADGE-DARK-RTL.png) · [Label · forced colors](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-LABEL-FORCED-COLORS.png) · [Link · forced colors](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-LINK-FORCED-COLORS.png) · [Badge · forced colors](evidence/BLUENT-LABEL-LINK-BADGE-EDGE-BADGE-FORCED-COLORS.png) |

## Confirmed browser observations

### Label #430

- The default label is exposed as text `This is a label`; size variants render `Small`, `Medium` and `Large`. The required example renders `Required field*` and emits `for="RequiredProperty"`, but this isolated demo section has no matching target element. That fixture alone does not prove a component-wide association defect.
- The Info action is a real focusable `button` nested inside the `label`, with no explicit `aria-label` or `title`. Chrome and Edge expose the button's computed accessible name as **`This is a label`**, inherited from the containing label—not an action-specific name such as “More information”. This is a reproduced accessible-name mismatch, not an unnamed button.
- The nested interactive button inside a label also creates a questionable HTML/interaction composition. Native screen-reader output and actual Popover activation were not tested.

**Disposition:** the Info action's name is wrong for its purpose in both browser AX trees. Keep the owner decision and localized action-name fix under #430; the #552 audit does not change product markup.

### Link #431

- Enabled Default and Subtle variants render native anchors with `href="#"`, visible text and normal Tab focus (`tabIndex=0`). The inspected default link is exposed as a named link in browser AX.
- The Disabled example still renders an `a` element, but removes `href`, sets `type="button"` and emits a `disabled` attribute. Because `disabled` is not native disabled semantics for an anchor, the element remains `tabIndex=0`. Chrome and Edge expose it as a **generic node with an empty accessible name**, not as a disabled link; `aria-disabled` is absent.
- The demo has no `OnClick` callback, so this run does not prove pointer/keyboard callback suppression. The source-level unconditional callback path remains open.

**Disposition:** the disabled-anchor semantic/focus gap is reproduced in both browsers. #431 must define the action-vs-navigation and disabled behavior before product remediation; do not repair it in #552.

### Badge #445

- The count-like `+99` badge is a static non-focusable `div` without a component-imposed role or live-region semantics. This is not automatically a defect: static badges, decorative dots and live counts require different semantics.
- `AnimateShadow` yields computed `animation-name: badge-pulse-shadow`, `animation-duration: 1.5s`, and `animation-iteration-count: infinite` in both engines.
- Under CDP emulation of `prefers-reduced-motion: reduce`, `matchMedia` reports `true` but the same animation remains active at `1.5s` and `infinite`. This reproduces the stylesheet's reduced-motion gap; it is not native OS or assistive-technology verification.

**Disposition:** reduced-motion behavior is a confirmed browser-computed gap under #445. The independent Icon API documentation mismatch remains open; this run does not address it.

## Acceptance boundary

All 31 checks passing means the probe successfully captured these expected observations, including the three gap reproductions; it does **not** mean the components pass Fluent parity. Forced-colors and reduced-motion are emulated. Native screen readers, OS high contrast, real callback activation, full visual/state combinations and published InteractiveServer remain unverified. Keep `auditComplete=false`, `noneApproved=true`, all family `designApproval=pending` and all `evidenceBundle=null` until the full nine-dimension review and design gates are completed.

Related reports: [Label source/API audit](FLUENT-PARITY-LABEL-AUDIT.md) · [Link source/API audit](FLUENT-PARITY-LINK-AUDIT.md) · [Badge source/API audit](FLUENT-PARITY-BADGE-AUDIT.md) · [18-family retrospective matrix](FLUENT-PARITY-RETRO-AUDIT.md).
