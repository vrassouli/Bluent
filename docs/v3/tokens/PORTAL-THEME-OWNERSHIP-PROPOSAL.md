# #418 · D2 Theme owner and detached portal contract (proposal)

**Status: original design proposal; an additive opt-in proof-of-concept is now implemented on the #418 task branch, but NOT approved as final API or released.** Authoritative editable design source: `Bluent v3 Design System` Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `acf5f619-7d81-80da-8008-c5fec09d9837`, board `acf5f619-7d81-80da-8008-c5fec0b7ec61`. Governed by accepted [ADR-0001 D2](../architecture/ADR-0001-styling-boundaries.md). Component interfaces need coordination with #420 before final implementation.

## Original proven failure (before the opt-in prototype)

In real Debug Blazor WebAssembly, the Dark v3 lab opens both a Dialog through `IDialogService` and a Popover through a Bluent Trigger. Both surfaces are children of the global `Containers` layout node, **not** the logical initiating host. Their nearest `[data-bui-theme]` ancestor is Light. These passing tests detect two **unfixed** defects.

## Candidate contract: explicit ownership, not DOM heuristics

1. **The opt-in theme host owns a local scope**, represented by an immutable snapshot containing at least mode, resolved brand, direction, optionally density, and a unique owner ID. Scope identity is separate from global app defaults.
2. **Capture at caller:** Popover obtains the nearest cascading host at Trigger registration; service Dialog obtains an explicit context through a scoped component/launcher at Show time. The global service cannot infer the correct caller after the fact.
3. **Apply per-item in the existing global container:** Dialog and Popover items each receive owned wrapper `data-bui-theme`, `dir`, scoped brand resolution and the optional token gate. Do NOT edit the root `html` or parent `Containers`. No v3 host supplied means existing v2 behavior and an explicit SSR fallback.
4. **Reject last-click, activeElement, global variables and MutationObserver guessing.** They fail with async calls, keyboard paths, concurrent independent scopes, reentrant dialogs and programmatic triggers.
5. **Decide on post-open changes:** immutable show-time snapshots versus host-scoped subscriptions; the former is deterministic, but unlike normal CSS inheritance will not react to parent changes without reopening.
6. **Brand isolation is a separate concern.** The present 10-brand stylesheet switch is document-wide. Two simultaneous brand-specific hosts need a true scoped-brand token source, not simply copying the `data-bui-theme` attribute.

## Required design and runtime gates

- Light parent → Dark nested host → Light grandchild, with two simultaneous dialogs and popovers; each uses its own theme, RTL and density.
- Concurrent click, keyboard, async and nested triggers do not leak scope or race. Disposal, stack order, focus restoration and modal dismissal continue to work.
- SSR/prerender and no-host fallback are deterministic and do not break existing public component parameters.
- All ten brands × Light/Dark remain correct. Separate proof is required before claiming simultaneous per-host brand isolation.
- Native high contrast, screen readers, motion, mobile and zoom need their own acceptance; visual CSS tests alone do not certify WCAG.
- Review exact public C# API and Penpot source before shipping into Bluent.UI v3. Do not change the workflow of #420 while it remains Backlog.

## Executable evidence

`node scripts/quality/probe_v3_blazor_runtime.mjs` passed **74/74 checks** on Dev01 in real Chrome/Blazor: 20 brand-mode Button colors, 20 non-leaking root aliases, 20 computed primary Button text contrast values (minimum **5.552:1**), and 14 other assertions covering actual controls, density 40→32px, 390px mobile RTL, keyboard Tab focus, motion, forced-colors roles and four **unfixed** D2/D5 portal/motion defect detections.

All implementation remains on `v3/issue-418-design-tokens` / Draft PR #500 targeting `bluent-v3`, outside `Dev` or stable NuGet.

**Additional measured defect:** In Chrome simulated prefers-reduced-motion: reduce, the existing detached Popover transition and Dialog animation retain nonzero computed durations. The opt-in lab Overlay reaches 0s. An accepted implementation must ensure the per-item portal theme/motion policy is applied to the wrapper itself and cannot leak globally.

## Runtime trial after the decision board
See [the executable opt-in prototype and exact API limitations](PORTAL-THEME-SCOPE-PREVIEW.md). The first three D2 implementation steps were exercised with a minimal mode/direction/density value snapshot; the tentative brand/owner ID and independently scoped brand CSS remain **unimplemented**. Dialog captures explicit show-time context; Popover follows its nearest CascadingValue through a private surface refresh. A no-scope Dialog does not emit v3 attributes. Reduced-motion animation zero still permits Dialog closing. 82/82 Chrome checks pass, but the original no-scope behavior still receives the legacy root theme. Preserve this before/after distinction in issue comments and future reviews.
