# #418 — Public Portal ownership and Dialog accessibility API proposal

**Status: DRAFT — maintainer/API decision required.** The branch contains an opt-in research implementation and a current browser evidence set; that does not approve the preview names as released public API. This proposal separates the D2 theme-owner contract from the D5 Dialog accessibility contract.

## 1. Two distinct lifecycles

The actual detached-portal evidence supports two different rules:

- **Popover follows its owner.** The Popover obtains the nearest cascading owner when its trigger is registered. While that owner is alive, updates to its mode/brand/direction/density should flow to the detached Popover surface. This is a live owner relationship.
- **Service Dialog captures a snapshot.** IDialogService is global and cannot infer a caller's logical host after an asynchronous service call. The caller must pass its owner context explicitly. ShowAsync captures an immutable snapshot once; two concurrent Dialogs opened from different hosts keep independent snapshots. Later parent changes do not silently rewrite an already-open Dialog.

Do not use last-click state, activeElement, document-wide theme variables, or MutationObserver heuristics to infer ownership. Those approaches are nondeterministic for async calls, keyboard/programmatic launches, concurrent scopes and nested dialogs.

## 2. Snapshot data and unresolved identity/brand gaps

The proposed owner context contains:

| Field | Purpose | Current prototype |
|---|---|---|
| Mode | light / dark | Present and validated |
| Direction | ltr / rtl | Present and validated |
| Density | comfortable / compact | Present and validated |
| Token opt-in | Whether the opt-in v3 token scope applies | Present as UseV3Tokens |
| Brand | One of the ten existing source brands | Nullable Brand is present |
| Owner identity | Distinguishes independent nested/concurrent owners and supports deterministic disposal/diagnostics | Not present on the current PortalThemeScope record; design proposal still calls for a unique owner ID |

The existence of a Brand field does not prove simultaneous per-host CSS brand isolation. The ordinary ten-brand Fluent source theme switching is document-wide. The prototype's separate scoped-brand CSS experiment has its own bounded evidence; the final crosswalk, stylesheet ownership, SSR rendering and fallback behavior still require acceptance.

A final public contract must decide whether OwnerId is an implementation-only identity, a public snapshot member, or a private registry handle. It must also define whether brand resolution is a stable source-theme key, a token-provider identity or a resolved immutable palette. Do not expose an accidental mutable DOM/registry identifier as consumer API.

## 3. Consumer API options

| Option | Shape | Benefit | Cost / risk |
|---|---|---|---|
| A — reuse the Dialog configuration builder (lowest change; current prototype) | DialogConfigurator.SetThemeScope(scope) copies the immutable scope to DialogConfiguration; caller passes the builder to the existing ShowAsync overload. Popover keeps implicit owner cascading. | Preserves existing IDialogService signatures and matches the tested opt-in path. | Public configurator accumulates concerns; ownership and modal validation must be clearly documented. |
| B — typed context separate from Dialog behavior | Add a strongly typed PortalThemeScope argument/overload to ShowAsync or a typed request object; keep accessibility/modal policy in a distinct DialogAccessibilityOptions. | Clean separation of owner presentation context from Dialog behavior and validation; fewer string/bool builder combinations. | Adds public overloads/types and migration/overload-resolution complexity. |
| C — scoped launcher/host | A PortalScope provides a launcher/factory that binds caller owner before the global service is invoked; child Popovers inherit the owner. A Dialog launcher can also carry accessibility options. | Consumer markup avoids manually threading the same context through multiple launch paths. | Adds component lifecycle, nesting, cascading and disposal semantics. A wrapper is not necessarily the actual painted host; a global service still must receive explicit captured context. |

**Review direction, not approval:** Option A is the least disruptive continuation of the working proof because it leaves IDialogService method signatures unchanged. Option B is the cleaner long-term API if maintainers prefer strict separation of presentation context from Dialog behavior. Option C has the highest lifecycle and API cost. Do not implement or release any option until a maintainer decision is recorded.

## 4. No-scope and portal application rules

- A caller without an explicit v3 owner keeps the existing legacy/root behavior. No document html or global Containers root mutation is permitted.
- In the existing global container, each detached item gets its own owner-specific wrapper attributes and resolved scope. Two concurrent items must never share mutable current-owner state.
- Popover surface updates follow the current owner while its trigger/owner is alive; unregister/disposal removes the owner subscription and trigger handlers.
- Dialog snapshot is frozen at ShowAsync. An open Dialog does not subscribe to parent changes; reopening is the transition boundary.
- Container/route disposal completes pending opted-in ShowAsync tasks safely as dismissed and must not attempt focus restoration to a launcher removed by navigation.
- SSR/prerender and noninteractive rendering need a deterministic no-JS fallback. Browser-only focus/inert logic runs only once the interactive host exists.

## 5. D5 accessible Dialog contract — separate from D2 theme ownership

The opt-in prototype currently tests these invariants:

- aria-modal="true" is exposed only for a Modal Dialog with an explicit accessible name.
- Modal keyboard navigation is explicit opt-in and is rejected unless Modal=true and an accessible name exists. Initial focus likewise requires a named Dialog.
- The active modal Dialog wrapper remains interactive; unrelated background DOM becomes inert and aria-hidden while the modal stack is active.
- A Popover owned by the active Dialog remains interactive even though it is portalled outside the Dialog DOM subtree. Ownership comes from the actual trigger's nearest Dialog, not from a global active element heuristic.
- Nested Dialogs follow a topmost stack. Escape dismisses the topmost owned Popover first, then the topmost Dialog; closing a child restores the parent modal/focus. Closing the final Dialog restores the explicitly named launcher when it still exists.
- Route/container teardown resolves pending Dialog results as dismissed and avoids focusing removed DOM.
- Unconfigured and non-modal legacy Dialogs keep existing behavior; no implicit modal, focus, inert or ARIA rewrite is applied to every consumer.

The public API must decide whether to keep the current explicit DialogConfigurator methods (SetAccessibleDialog, SetModalKeyboardNavigation, SetInitialFocusTargetId, SetReturnFocusTargetId, etc.) or group them into a validated immutable DialogAccessibilityOptions value. Do not conflate the D2 owner snapshot with D5 modal semantics simply because both are passed at launch time.

## 6. Current prototype names and evidence boundary

Existing source names include:

- PortalThemeScope
- DialogConfigurator.SetThemeScope
- DialogConfiguration.ThemeScope
- DialogConfigurator.SetAccessibleDialog
- DialogConfigurator.SetModalKeyboardNavigation
- DialogConfigurator.SetInitialFocusTargetId
- DialogConfigurator.SetReturnFocusTargetId

These exist in the isolated #418 branch as experimental opt-in proof. They are not approved final public API names.

Recorded D2 proof: Chrome WebAssembly 126/126, Chrome Published InteractiveServer 126/126, focused NUnit 40/40. Recorded D5 proof at the latest previously detailed prototype checkpoint: Chrome Debug WebAssembly 1179/1179, Published InteractiveServer 1178/1178, focused NUnit 45/45, full .NET Solution tests 113/113. The new Firefox / Published InteractiveServer CI lane separately exercises current D2/D5 critical paths with 32/32 assertions. Exact-head GitHub Actions must still pass on the current commit; historical counts must not be presented as current-head evidence without that run.

Remaining evidence gates include native Narrator/VoiceOver speech, native OS Contrast Themes, current Safari/WebKit, third-party popup arbitration, iframe transfer, route/unmount and repeated disposal stress, SSR/prerender fallback, and simultaneous brand isolation through the final scoped CSS contract.

## 7. Acceptance required before publication

1. Decide Option A/B/C or a revised contract.
2. Decide OwnerId treatment, brand-source identity/resolution, snapshot immutability and owner update/disposal semantics.
3. Confirm Popover live-owner updates and Dialog show-time snapshots as separate documented lifecycle contracts.
4. Decide whether D5 accessibility settings remain explicit builder methods or become a typed options object. Preserve the constraints and legacy fallback above.
5. Review exact public interface/API diff, names, XML docs and migration. Verify no existing IDialogService overload ambiguity/breaking change.
6. Review Penpot page 54 in the source-owned design file and cross-link it to accepted ADR-0001 D2/D5, page 33 and D5 boards. No board state is promoted automatically.
7. Pass exact-head Chrome/Edge × WASM/InteractiveServer tests, native keyboard/OS contrast and real assistive technology. Keep skipped/unsupported scopes visible.
8. Only after acceptance, implement a public API in a separate reviewable change. No preview name should silently become public because it already exists in prototype source.

## 8. Design traceability

Editable source: Penpot file Bluent v3 Design System, ID b64f6665-c9ab-80b5-8008-c4ac99d9d000.

- D2 owner board: page 33 acf5f619-7d81-80da-8008-c5fec09d9837, board acf5f619-7d81-80da-8008-c5fec0b7ec61 (DRAFT).
- D5 lifecycle/keyboard/accessible-name companion pages: existing pages 535db143-a732-8071-8008-c661af0787e1, 535db143-a732-807e-8008-c66a41867ed4, 535db143-a732-807e-8008-c650a310958b, and 6519bd63-6e0d-802b-8008-c6ddeb6733bd (review state remains draft).
- New API comparison: page 54 388782f1-b766-8073-8008-f32c913ab071, board 388782f1-b766-8073-8008-f32c9154ed0d, explicitly DRAFT / PUBLIC API / ACCESSIBILITY CONTRACT REQUIRED. Export was visually inspected.

The page-54 board is a proposal and proof map, not maintainer approval or runtime/API acceptance.

## 2026-11-16 decision — Option A selected

The maintainer delegated this choice to the engineering/design review. **Option A is selected as the future API direction**: retain the existing Dialog configuration-builder route and require explicit caller owner context. Popover follows the nearest live owner; a Dialog captures an immutable owner snapshot at `ShowAsync`; unscoped calls keep the legacy fallback. Keep OwnerId as private implementation identity, not consumer API.

Keep D5 accessibility configuration separate from D2 owner context and retain the existing explicit, validated builder methods for accessible name, modal keyboard behavior and focus targets. Do not add a new public launcher, `PortalThemeScope` API name or grouped accessibility-options type in this iteration.

This selects an API direction only. Public type/member names and shipping API remain unapproved until exact API review, Penpot page-33/page-54 review, native Contrast Themes and spoken AT, independent engine, lifecycle and third-party popup arbitration gates pass.
