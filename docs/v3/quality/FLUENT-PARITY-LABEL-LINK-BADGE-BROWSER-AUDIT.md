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
- The nested interactive button inside a label also creates a questionable HTML/interaction composition. Native screen-reader output was not tested in the original WASM run. The later published InteractiveServer follow-up below exercises the real Popover lifecycle with a circuit-local container.

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

All 31 checks passing means the probe successfully captured these expected observations, including the three gap reproductions; it does **not** mean the components pass Fluent parity. Forced-colors and reduced-motion are emulated. Native screen readers, native OS high contrast, keyboard activation behavior, complete visual/state combinations and Fluent parity acceptance remain unverified. A later published InteractiveServer follow-up is recorded below. Keep `auditComplete=false`, `noneApproved=true`, all family `designApproval=pending` and all `evidenceBundle=null` until the full nine-dimension review and design gates are completed.

Related reports: [Label source/API audit](FLUENT-PARITY-LABEL-AUDIT.md) · [Link source/API audit](FLUENT-PARITY-LINK-AUDIT.md) · [Badge source/API audit](FLUENT-PARITY-BADGE-AUDIT.md) · [18-family retrospective matrix](FLUENT-PARITY-RETRO-AUDIT.md).

## Published Production InteractiveServer follow-up (2026-10-24)

The original WASM evidence is preserved above. An additional QA-only route was added in the published Bluent.UI.Demo.SSR host at /__quality/server-label-link-badge-probe with explicit @rendermode InteractiveServer. A real pointer click changed a Razor counter from 0 to 1 in each browser, proving this was an interactive published Server circuit rather than prerender-only HTML.

- Chrome: 29/29 checks pass. Edge: 29/29 pass (58/58 combined) after the 2026-10-25 Fluent InfoLabel keyboard-reference crosswalk. These are successful evidence-capture assertions, not an assertion that all observed behavior conforms to Fluent.
- Coverage: Light/LTR, Dark/RTL, CDP-emulated Forced Colors, and separately emulated prefers-reduced-motion: reduce; browser DOM, computed styles, Chromium accessibility-tree nodes and captured PNGs.
- Newly reproduced Link behavior: a real pointer click on the Link component with disabled set still invokes its supplied OnClick callback. The server-side callback counter changed from 0 to 1 in both browsers. On that element, the observed DOM is an A with no href, a disabled attribute (which has no native disabled semantics on anchors), no aria-disabled, no explicit tabindex attribute, and a tabIndex property whose reported value is 0. A deterministic keyboard trace starting from the preceding Label Info button then presses Tab: focus moves directly to the server-interaction sentinel and skips the disabled Link in both browsers. Enter/Space were not sent to the Link because the browser did not move focus to it; native screen-reader behavior remains untested.
- Label Info Popover lifecycle: the QA-only route includes a local Containers instance inside the same InteractiveServer component, so PopoverInterop and its container share a circuit. A real click installs a native click listener and creates a surface whose id is the trigger id plus _surface, class is bui-popover-surface default top-start show, computed display is block and opacity is 1, and text contains the expected Info content and Learn more link. Clicking inside keeps it visible; clicking the sentinel outside hides/removes it, and the same outside click increments the server sentinel from 1 to 2. The earlier route version without a circuit-local Containers instance had no trigger listener or surface; that was an invalid QA fixture, not a product defect. The trigger has no aria-expanded or aria-haspopup, and the surface has no role or aria-label; those are observations for design/native-AT review, not accepted defects by themselves. Additional keyboard/AX observations: when Tab starts at the Info trigger while the Popover is open, focus moves to the following page sentinel rather than the Popover's “Learn more” anchor, while the Popover remains open. Sending Escape also leaves the surface visible. The browser AX tree reports the trigger as a button named with the surrounding label text, the surface as a generic node with an empty name, and the “Learn more” child as a named link. These need comparison against approved interaction/design requirements and native AT; this audit records outcomes but does not independently declare every absent attribute or focus behavior a defect.
- The other gaps remained consistent with the WASM run: Label's Info action inherits the surrounding label's name; the disabled Link has generic/empty-name AX semantics; and AnimateShadow continues its infinite 1.5s pulse while reduced-motion is emulated. The static +99 Badge remains a non-focusable generic div; that observation alone is not an asserted defect.

| Evidence | Result |
| --- | --- |
| [Chrome InteractiveServer JSON](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME.json) | 29/29; includes pointer, Enter/Space, focus-order, Escape-from-content and Popover lifecycle observations |
| [Edge InteractiveServer JSON](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE.json) | 29/29; includes pointer, Enter/Space, focus-order, Escape-from-content and Popover lifecycle observations |
| Chrome screenshots | [Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME-LIGHT-LTR.png) · [Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME-DARK-RTL.png) · [Forced Colors emulation](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME-FORCED-COLORS.png) · [Reduced Motion emulation](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME-REDUCED-MOTION.png) |
| Edge screenshots | [Light/LTR](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE-LIGHT-LTR.png) · [Dark/RTL](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE-DARK-RTL.png) · [Forced Colors emulation](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE-FORCED-COLORS.png) · [Reduced Motion emulation](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE-REDUCED-MOTION.png) |

All styling modes called Forced Colors and Reduced Motion above are browser emulation, not proof from the native OS accessibility stack. No product component source, public API or product CSS changed; the route and its callback counter are QA instrumentation only. Ownership remains #430 (Label), #431 (Link), and #445 (Badge); do not repair their product implementations in #552. The family dimensions stay audited_gaps, design approval stays pending, and evidenceBundle stays null.
## Fluent InfoLabel keyboard-reference crosswalk (2026-10-25)

### Reference selection and scope

The [Fluent Web Components Storybook catalog](https://storybooks.fluentui.dev/web-components/) lists a Label component but no comparable InfoLabel/InfoButton family in its component menu. Following #552's reference hierarchy, this comparison therefore uses the official [Fluent React InfoLabel Storybook](https://storybooks.fluentui.dev/react/?path=/docs/components-infolabel--docs) and [React InfoLabel Spec](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-infolabel/library/docs/Spec.md) as a **cross-platform fallback, not a 1:1 Web Components contract** and not a version-pinned package acceptance result. The source spec is a behavioral/design reference; a pinned release comparison and native assistive-technology review remain follow-up gates.

The React InfoLabel spec describes the InfoButton-with-Popover interaction this way: Enter or Space opens the Popover; focus moves to the PopoverSurface, with child focusable controls accessible through Tab; Escape closes the Popover when focus is in the surface/content; and moving focus away from the bubble dismisses it. The spec's own DOM example and Accessibility section disagree on whether the surface role is `tooltip` or `note`; this audit deliberately does not settle that semantic choice from the document alone.

### Published InteractiveServer results

The probe was extended to activate the existing Bluent Label Info trigger through real browser keyboard events and to focus the actual `Learn more` link before sending Escape. Chrome and Edge each passed 29/29 evidence-capture checks (58/58 combined). The observations match in both engines:

| Contract area | Fluent React InfoLabel reference | Bluent observation | Audit disposition |
| --- | --- | --- | --- |
| Enter activation | Opens the Popover | Opens the Popover | Activation observed; no gap asserted here |
| Space activation | Opens the Popover | Opens the Popover | Activation observed; no gap asserted here |
| Focus after keyboard opening | Move focus to the PopoverSurface; allow Tab access to focusable content | **Focus remains on the trigger**; the first Tab goes to the following page sentinel instead of the `Learn more` link | **Candidate behavior gap reproduced** |
| Focus leaving the bubble | Dismiss the InfoButton bubble | After Tab moves focus to the sentinel, the Popover remains visible | **Candidate behavior gap reproduced** |
| Escape from Popover content | Close the Popover when focus is on the surface/content | With focus confirmed on the inner `Learn more` anchor, Escape leaves the surface visible | **Candidate behavior gap reproduced** |
| Surface role/name and trigger announcement | The spec describes an action-specific InfoButton announcement, but has an internal role inconsistency | Trigger AX name is inherited as “This is a label”; surface is generic/unnamed in Chromium AX | **Needs pinned upstream render + native AT review; do not infer a final role from the contradictory spec text** |

The test explicitly records these differences in each browser JSON under `fluentInfoLabelKeyboardReference`; a passing check means the observation was captured consistently, not that parity passed. See [Chrome evidence](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME.json) and [Edge evidence](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE.json).

**Ownership and next action:** route the three reproduced interaction differences to existing owner issue [#430 Label](https://github.com/vrassouli/Bluent/issues/430) for design-owner disposition before product remediation. Do not alter the component in #552. Native screen-reader/OS validation and design approval are still unverified. The overall audit remains `auditComplete=false`, `noneApproved=true`; all 18 families remain `audited_gaps`, design approval remains pending, and evidenceBundle remains null.
## Fluent Link disabled/navigation crosswalk (2026-10-25)

The detailed comparison is recorded in the [Link family audit](FLUENT-PARITY-LINK-AUDIT.md#fluent-link-disablednavigation-crosswalk-2026-10-25). The reference sources have distinct scope:

- The official [Fluent 2 Link design guidance](https://fluent2.microsoft.design/components/web/react/core/link/usage/) says links are for navigation, not actions.
- The current [Fluent UI Link behavior spec](https://github.com/microsoft/fluentui/blob/master/specs/Link.md) describes disabled links as non-interactive and recommends an `aria-disabled` approach for disabled elements that remain focusable. It is an unpinned `master` spec, not the frozen Web Components release contract.
- The frozen Web Components 3.1.3 catalog has `fluent-link` and `fluent-anchor-button`, but neither exposes a `disabled` attribute. The published [disabled-link QA probe](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME.json) nevertheless confirms that Bluent's disabled-marked `a` executes its OnClick callback on pointer click (0→1), while sequential Tab skips the no-href/no-aria-disabled element and Chromium AX reports a generic node with an empty accessible name. See also [Edge evidence](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE.json).

**Disposition:** the pointer callback behavior is a confirmed gap against Bluent's intended disabled contract and the Fluent React behavioral guidance; the focus/AX behavior is also a reproduced gap. This is not proof of 1:1 parity failure against the pinned Web Components 3.1.3 package because that package has no disabled Link attribute. Ordinary Enter/Space on this skipped anchor, native AT, and final component design remain unverified. Keep the action-vs-navigation convenience and disabled focus policy for owner decision under [#431](https://github.com/vrassouli/Bluent/issues/431); do not implement the fix inside #552.
