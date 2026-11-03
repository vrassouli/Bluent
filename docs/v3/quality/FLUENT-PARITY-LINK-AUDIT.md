# #552 family audit — Link (#431)

**Status: partial source/API and Fluent behavior crosswalk (2026-10-25), with source-confirmed interaction/accessibility gaps.** This is not Fluent parity acceptance, a design approval, or a claim that every browser scenario has been run. No product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest includes `fluent-link` and `fluent-anchor-button`; the React semantic triage has a Link comparator. These remain distinct upstream choices. Bluent's single `Link` component renders a native `button` when `Href` is empty and a native `a` when `Href` is non-empty. That dual-purpose contract needs explicit disposition: navigation links and actions are not interchangeable merely because they share a text/appearance API.

## Source-confirmed gaps

| Finding | Source evidence | Disposition |
| --- | --- | --- |
| Disabled anchor has inconsistent pointer, sequential-focus and AX semantics | Chrome/Edge show an `a` with no `href`, an ineffective `disabled` attribute, `tabIndex=0`, no `aria-disabled`, and AX role `generic` with an empty name. | Runtime semantic/focus gap reproduced. A real pointer click invokes the callback despite disabled; sequential Tab skips the anchor in Chrome and Edge. Enter/Space on the anchor and native AT remain untested. |
| Click callback is not guarded by disabled state | ClickHandler invokes OnClick without checking IsDisabled. A real pointer click invokes the callback in published Production InteractiveServer Chrome/Edge; a deterministic Tab from the preceding Label Info button skips the disabled anchor, which has no explicit tabindex attribute even though its tabIndex property reads 0. | Pointer/runtime gap and sequential-focus gap reproduced; Enter/Space on the link itself remain untested because it did not receive focus. |
| `Href` determines navigation vs action semantics | Empty/whitespace `Href` yields `<button type="button">`; non-empty `Href` yields `<a href="...">`. The same `OnClick` callback is wired in both cases. | Current source supports two native element types. The full API/behavior mapping must decide whether that is an intentional Bluent extension or whether action and navigation semantics need separate owner-approved contracts. Do not call every Link a native anchor. |
| Unmatched attributes are filtered selectively | `GetAdditionalAttributes()` removes a supplied `href` when `IsDisabled`, then forwards remaining attributes. It does not create an explicit `aria-disabled` contract or suppress the `OnClick` callback. | Test caller-supplied `disabled`, `aria-disabled`, `tabindex`, `href` casing/precedence, native focus order and event behavior. Keep caller attributes and component-owned attributes from accidentally disagreeing. |

## Supplemental browser evidence (2026-10-22)

The `/components/links` demo was captured in Chrome and Edge in Light/LTR, Dark/RTL and CDP-emulated forced-colors (31/31 instrumentation checks per engine across the Label/Link/Badge probe). Enabled Default and Subtle links are named native anchors. The Disabled example is still an anchor, has no `href`, retains `tabIndex=0`, carries a `disabled` attribute that has no native disabled meaning on an anchor, lacks `aria-disabled`, and is exposed as a generic AX node with an empty name. See [Label/Link/Badge browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md). The original demo has no OnClick callback. The separate QA-only, published Production InteractiveServer route now supplies one and captures a real pointer click: the callback fires despite disabled in both Chrome and Edge. The same probe starts from the Label Info button, presses Tab, and observes focus move directly to the server sentinel, skipping this disabled anchor. See the full Label/Link/Badge runtime report and the Chrome / Edge structured records. Enter/Space activation, native OS/screen-reader output, and component design/implementation remain open.
## Fluent Link disabled/navigation crosswalk (2026-10-25)

### Reference hierarchy and limits

- **Primary Fluent 2 design guidance:** [React Link usage](https://fluent2.microsoft.design/components/web/react/core/link/usage/) defines a link as navigation and explicitly says not to use links for actions; use a button for actions.
- **Cross-platform behavioral specification:** [Microsoft Fluent UI Link spec](https://github.com/microsoft/fluentui/blob/master/specs/Link.md) documents a disabled state as non-interactive and recommends an `aria-disabled` state when keeping a disabled item focusable, with input events explicitly ignored. This source is the current `master` spec, not a release-pinned 3.1.3 contract; use it as behavioral guidance, not a direct guarantee about a specific release.
- **Pinned Web Components API:** the frozen [`@fluentui/web-components@3.1.3` crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md) lists `fluent-link` attributes `appearance, download, href, hreflang, inline, ping, referrerpolicy, rel, target, type` and no `disabled` attribute. `fluent-anchor-button` is a separate tag and also has no `disabled` attribute in that manifest. A matching Link tag does not imply disabled behavior parity.
- **HTML baseline:** [MDN's disabled-attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled) lists the native elements that support `disabled`; anchors are not among them. An `a` element becomes a hyperlink through `href`, and native Enter activation applies when that `href` exists ([MDN anchor reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a)).

### Observed Bluent behavior vs reference

| Contract area | Fluent / HTML reference | Bluent source + published runtime | Disposition |
| --- | --- | --- | --- |
| Link vs action | Fluent 2 says a link navigates; use a Button for actions | One Bluent `Link` component renders `a` for non-empty `Href` and `button type="button"` for empty/whitespace `Href`; `OnClick` is wired for both | **Intentional-extension decision needed under #431**; API shape mixes two interaction roles |
| Disabled state declaration | Fluent React spec describes non-interactive disabled state and recommends `aria-disabled` for a focusable disabled link; pinned WC 3.1.3 does not declare `disabled` on `fluent-link` | Bluent detects an unmatched `disabled` attribute, suppresses the anchor `href`, and still forwards the ineffective `disabled` attribute; no component-generated `aria-disabled` contract exists | **Semantic gap reproduced**; current output is not a native disabled anchor |
| Pointer activation | Fluent Link spec says disabled Link is non-interactive | Real pointer click on the published InteractiveServer QA route increments the callback count from 0 to 1 although `disabled` was supplied; source `ClickHandler` invokes `OnClick` without checking `IsDisabled` | **Confirmed behavior gap** for the existing disabled contract |
| Sequential focus | Fluent React spec recommends disabled links remain discoverable by keyboard where configured, through `aria-disabled` rather than native `disabled` | Chrome and Edge sequential Tab from the preceding Info action skip this anchor; it has no `href`, no explicit `tabindex`, no `aria-disabled`, and Chromium AX exposes a generic node with an empty name | **Confirmed focus/AX gap**; the skipped item is also unavailable for ordinary Enter activation |
| Keyboard activation of the disabled anchor | Fluent Link spec documents Enter activation for Link, but only if a valid focus/navigation model exists | Direct Enter/Space activation on this unfocusable-by-Tab disabled anchor has **not** been independently tested; do not infer it from the pointer result | **Explicitly unverified**, not a failed keyboard test |
| Surface API parity | Pinned `fluent-link` exposes href/navigation attributes but not a `disabled` attribute | Bluent's disabled behavior comes through unmatched HTML attributes and its own callback | **Do not claim 1:1 parity**; finalize the intended Bluent-only contract with the owner |

### Owner decision to resolve before implementation

Issue [#431 Link](https://github.com/vrassouli/Bluent/issues/431) should explicitly decide both dimensions below rather than trying to fix only the DOM symptom:

1. **Navigation vs action:** retain the convenience that empty `Href` renders a button as a deliberate Bluent extension, or separate the action API and navigation-link API more strongly. This is an API/design decision, not a change authorized by #552.
2. **Disabled navigation contract:** if an unavailable destination remains in the focus order so users can discover its disabled state, define the `aria-disabled`/accessible-name/focus policy and suppress pointer and keyboard activation (including preventing native navigation). If it should be removed from the focus order instead, define how users can discover the disabled status without leaving a nameless, non-link element in the accessibility tree. Do not rely on `disabled` on `a`.

The existing test proves a real pointer callback and the Tab-skip outcome in Chrome and Edge, published Production InteractiveServer. It does **not** prove Fluent version-pinned implementation parity, Enter/Space behavior on the un-focusable element, native screen-reader output, or the final approved design. Product remediation belongs to #431 after its normal design/issue gates; keep #552 evidence-only.

## Canonical matrix disposition

- `behavior`: `audited_gaps` — a pointer click invokes OnClick despite disabled in published Production InteractiveServer Chrome/Edge; sequential Tab skips the anchor. Enter/Space on the anchor remain untested.
- `accessibility`: `audited_gaps` — disabled navigation is exposed as a focusable generic node without `href` or `aria-disabled`; native screen-reader output remains untested.
- `feature`: `audited_gaps` — 12 API parameters are mapped in [Wave A API review](FLUENT-PARITY-WAVE-A-API-REVIEW.md); href/appearance map, but anchor/button fallback and disabled semantics differ from `fluent-link`.
- `visual`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps`.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#431:** choose and document the disabled navigation contract and callback policy. Two pointer/keyboard differences are now reproduced in the #552 published InteractiveServer probe: OnClick fires on a pointer click despite disabled, while sequential Tab skips the anchor. Still test Enter/Space activation expectations, focus order, navigation, callback contract for anchor vs button forms, aria-disabled, and unmatched-attribute precedence.

2. Review the [Wave A API ledger](FLUENT-PARITY-WAVE-A-API-REVIEW.md); keep Link, Button and navigation-anchor behavior semantically distinct, and finish the disabled/callback/ARIA behavior checks.
3. Add real browser evidence in Chrome/Edge, WebAssembly and published InteractiveServer, then same-state Fluent screenshots, RTL, focus-visible, forced colors and native screen-reader verification. The existing TabList URL-link evidence proves those *different tab demo anchors* navigate; it is not evidence that this Link component's disabled behavior works.
4. Complete the editable Bluent v3 design and lifecycle prerequisites before changing the owning product issue. Keep implementation out of #552.

## Evidence sources

- [Canonical Link documentation](../../components/link.md)
- `src/Bluent.UI/Components/LinkComponent/Link.cs` and `LinkAppearance.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Existing TabList URL navigation evidence (not Link-component evidence)](FOCUS-TABLIST-PANELS-LINKS-DISABLED.md)
- [Link owner issue #431](https://github.com/vrassouli/Bluent/issues/431)

**Boundary:** these source and browser findings justify a partial gap audit, not Fluent equivalence, design approval or native OS/AT acceptance. Pointer activation and sequential Tab behavior are reproduced in published InteractiveServer; Enter/Space on the unfocusable-by-Tab anchor and native screen-reader behavior remain untested.