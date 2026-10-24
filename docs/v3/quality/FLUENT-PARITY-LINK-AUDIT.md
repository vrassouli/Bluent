# #552 family audit — Link (#431)

**Status: partial source/API audit with source-confirmed behavior and accessibility gaps.** This is not Fluent parity acceptance, a design approval, or a claim that every browser scenario has been run. No product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest includes `fluent-link` and `fluent-anchor-button`; the React semantic triage has a Link comparator. These remain distinct upstream choices. Bluent's single `Link` component renders a native `button` when `Href` is empty and a native `a` when `Href` is non-empty. That dual-purpose contract needs explicit disposition: navigation links and actions are not interchangeable merely because they share a text/appearance API.

## Source-confirmed gaps

| Finding | Source evidence | Disposition |
| --- | --- | --- |
| Disabled anchor is focusable but loses link semantics | Chrome/Edge show an `a` with no `href`, an ineffective `disabled` attribute, `tabIndex=0`, no `aria-disabled`, and AX role `generic` with an empty name. | Runtime semantic/focus gap reproduced. Callback suppression remains source-confirmed but was not tested with a real click callback in this demo. |
| Click callback is not guarded by disabled state | `ClickHandler()` unconditionally calls `InvokeAsync(OnClick.InvokeAsync)` and does not check `IsDisabled`. For a disabled anchor, removing `href` and passing an ineffective `disabled` attribute does not itself establish event suppression. | Source-confirmed handler gap; actual pointer/keyboard callback behavior should be reproduced in the browser before remediation acceptance. |
| `Href` determines navigation vs action semantics | Empty/whitespace `Href` yields `<button type="button">`; non-empty `Href` yields `<a href="...">`. The same `OnClick` callback is wired in both cases. | Current source supports two native element types. The full API/behavior mapping must decide whether that is an intentional Bluent extension or whether action and navigation semantics need separate owner-approved contracts. Do not call every Link a native anchor. |
| Unmatched attributes are filtered selectively | `GetAdditionalAttributes()` removes a supplied `href` when `IsDisabled`, then forwards remaining attributes. It does not create an explicit `aria-disabled` contract or suppress the `OnClick` callback. | Test caller-supplied `disabled`, `aria-disabled`, `tabindex`, `href` casing/precedence, native focus order and event behavior. Keep caller attributes and component-owned attributes from accidentally disagreeing. |

## Supplemental browser evidence (2026-10-22)

The `/components/links` demo was captured in Chrome and Edge in Light/LTR, Dark/RTL and CDP-emulated forced-colors (31/31 instrumentation checks per engine across the Label/Link/Badge probe). Enabled Default and Subtle links are named native anchors. The Disabled example is still an anchor, has no `href`, retains `tabIndex=0`, carries a `disabled` attribute that has no native disabled meaning on an anchor, lacks `aria-disabled`, and is exposed as a generic AX node with an empty name. See [Label/Link/Badge browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md). The demo has no `OnClick` callback, so actual callback invocation/suppression remains untested; source still invokes the callback without checking disabled state.
## Canonical matrix disposition

- `behavior`: `audited_gaps` — source does not guard the click callback when disabled; browser confirms the disabled anchor remains focusable but loses link semantics. Real callback invocation/suppression remains untested.
- `accessibility`: `audited_gaps` — disabled navigation is exposed as a focusable generic node without `href` or `aria-disabled`; native screen-reader output remains untested.
- `feature`: `audited_gaps` — 12 API parameters are mapped in [Wave A API review](FLUENT-PARITY-WAVE-A-API-REVIEW.md); href/appearance map, but anchor/button fallback and disabled semantics differ from `fluent-link`.
- `visual`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps`.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#431:** choose and document the disabled navigation contract and callback policy. Test enabled/disabled anchor and action forms independently, including Enter/Space behavior, focus order, pointer activation, navigation, `OnClick` count, `aria-disabled`, and unmatched-attribute precedence.
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

**Boundary:** these source findings justify a partial gap audit, not a claim of reproduced runtime failure, Fluent equivalence, design approval or native OS/AT acceptance.
