# #418 — Explicit Dialog focus return + Popover ARIA ownership

**2026-10-11 implementation checkpoint. Status: DRAFT opt-in runtime, not accepted final v3 component API.** This code exists only on v3/issue-418-design-tokens, PR #500 targeting bluent-v3. Stable Dev and published NuGet are unchanged.

## Authoritative design reference

Bluent v3 Design System Penpot file b64f6665-c9ab-80b5-8008-c4ac99d9d000; D2/D5 theme ownership/focus acceptance page acf5f619-7d81-80da-8008-c5fec09d9837 and board acf5f619-7d81-80da-8008-c5fec0b7ec61. The existing editable board calls for role, accessible Close label, focus entry/return and correctly owned portals. A proposed additional D5 diagram page was attempted, but the browser Penpot tab suspended before completion. **No new Penpot page or visual approval is claimed in this checkpoint.**

## Dialog: explicit focus destination, no DOM heuristics

Draft opt-in configurator method **SetReturnFocusTargetId(elementId)** accepts a nonblank caller-supplied HTML element ID. The Blazor lab now uses a real Bluent Button with ID v3-show-service-dialog and passes that same ID when opening a scoped, named nonmodal Dialog.

After the final Dialog in the local service container dismisses, DialogContainer renders the removal and imports the minimal experimental module from Bluent.UI static assets (v3/issue-418-dialog-focus.preview.js) **only if a caller explicitly set a focus destination**. The module checks that the target still exists, is connected, is not disabled, and no visible Dialog remains before focusing it with preventScroll. Opening any new Dialog cancels a previously pending return. A separate Dialog with no opt-in does not import JavaScript and retains its earlier static-SSR markup/behavior. The HTML-only legacy NUnit renderer works without registering IJSRuntime; the runtime resolves it lazily only when needed.

**Out of scope:** nested Dialog focus-stack ownership, modal Tab/Shift+Tab trapping and Escape/backdrop policies, automatic discovery of a launcher from document.activeElement, navigation/unmount races and native screen-reader acceptance. The current prototype deliberately restores focus only when the local Dialog stack becomes empty.

## Popover: JS is the single ARIA visibility owner

Draft opt-in **Popover.AccessibleTriggerState=true** is propagated through PopoverSettings. The existing JavaScript Popover.ts implementation, which already owns the actual show/hide CSS classes, now owns the trigger's ARIA state:

- Register button trigger: aria-controls points to triggerId + _surface; aria-expanded is false.
- Show surface: after visibility becomes real, set aria-expanded true.
- Dismiss outside or via hide: set aria-expanded false alongside the actual hidden surface.
- Reopen: return to true, including after an earlier close.
- When transitionend is missing (0ms motion or a rerender): an opted-in, bounded transition-duration fallback completes hiding and updates ARIA.
- If the surface reopened before the fallback completes, its show class protects it against a stale delayed hide.
- For non-opted-in existing Popovers, no trigger attributes or new fallback behavior are introduced.

**This intentionally does not invent a universal Popover surface role**: the correct role depends on whether a concrete component uses the surface as a tooltip, menu, listbox or interactive nonmodal dialog. Likewise, aria-haspopup is intentionally not forced on all popovers.

The JS builds from src/Bluent.UI.Scripts/src/Popover/Popover.ts with npm run build; both ESM and global generated bundles, maps and matching Bluent.UI static copies are tracked on the isolated v3 branch. Existing released JS remains unchanged.

## Executed browser and unit evidence

**Four independent actual browser/Blazor runs passed 157/157 assertions each:** Google Chrome / WebAssembly, Google Chrome / locally published InteractiveServer, Microsoft Edge / WebAssembly, and Edge / InteractiveServer. Edge and Chrome are both Chromium and are not independent rendering-engine coverage.

The script scripts/quality/probe_v3_blazor_runtime.mjs checks the actual native Bluent launcher and post-dismiss focused element; hidden/open/reopened Popover class and ARIA relation; initial collapsed state; and a legacy Popover opened without opt-in, whose ARIA attributes remain absent. Earlier source-brand, RTL/Persian font/icon/text, forced-colors, reduced-motion and Dialog tests all continue passing.

**47/47 NUnit tests** passed, including no-JavaScript legacy HtmlRenderer Dialog tests, explicit opt-in return-focus configuration, invalid target rejection and default-off Popover setting. Release build produced 0 errors and 0 warnings.

## Outstanding acceptance

Full modal interaction contract: initial focus policy for different dialog contents, Tab/Shift+Tab containment, Escape semantics, explicit nested stack restore and focus loss on route changes. Popover keyboard activation, surface role per actual content type, automatic focus return when required, and native OS High Contrast/actual AT also need independent review. Final API names, Penpot parity, Skill/docs/migration and review gates remain pending.

Keep #418 In progress and PR #500 Draft. Never merge to Dev or publish the stable NuGet as part of this proof.