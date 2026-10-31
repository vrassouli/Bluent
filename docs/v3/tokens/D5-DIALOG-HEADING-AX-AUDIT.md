> **2026-10-11 D5 continuation:** Real visible Dialog explanations are now tied through aria-describedby and a real Blazor Button can update the standard h2 while AX name follows Persian text; the reduced-motion zero-duration close edge is covered. See [D5 visible description + live title audit](D5-DESCRIPTION-LIVE-TITLE-AUDIT.md), four Chromium x Blazor suites 190/190 each, NUnit 58/58. Native AT remains OPEN.

# #418 D5 — Visible Dialog title as the accessible name

**Date:** 2026-10-11. **Status:** DRAFT opt-in design-to-code proof. This research is isolated to `v3/issue-418-design-tokens`, PR #500 targeting `bluent-v3` only. Not approved for stable v2 or NuGet release.

## Editable design source

The actual connected Penpot **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, contains:

- **Page 38**, `535db143-a732-807e-8008-c64b3e0c419d`, *Dialog heading and screen-reader name · #418*.
- **Editable board**, `535db143-a732-807e-8008-c64b3e839d5a`, with **22 native shapes, zero bounds errors**, exported to PNG and visually reviewed.

The board differentiates two real API pathways: the standard title-bearing `ShowAsync<T>(title,...)` and a custom `ShowAsync(RenderFragment,...)` that may render *no heading*. The design is **draft**, not final Fluent approval or actual native screen-reader verification.

## Implemented opt-in naming rules

A Dialog configured with `SetAccessibleDialog(accessibleName, localizedCloseLabel)` receives `role=dialog`. When the caller uses the **standard, nonempty title-bearing overload**, the built-in `DialogDefaultContent` renders a visible `h2.title`. In this case:

1. The native header `h2` gets a generated **Dialog-instance-specific ID** (derived from the existing component ID).
2. The enclosing Dialog root gets `aria-labelledby` pointing to **that exact descendant heading**. It does not emit a second competing `aria-label`.
3. The **computed accessibility name is the visible heading**, even if the provisional fallback `accessibleName` differs. This prevents the screen reader and the on-screen title from silently diverging.
4. Two concurrent Dialogs each have a unique IDREF target; each reference resolves to **exactly one heading inside its own Dialog**.

For the **custom content overload** (which is not guaranteed to have an `h2`), no header ID is invented. The root retains the explicit opt-in `aria-label`, with no invalid `aria-labelledby` pointer. The same is true of a title-bearing overload given a blank title. Both behaviors are intentional. The internal draft boolean `UseStandardTitleHeading` is determined by `DialogService`/configurator; no new public consumer configuration is needed.

All unconfigured legacy Dialogs remain unchanged: no `role=dialog`, `aria-label`, `aria-labelledby`, or new title IDs are applied. The original constructor and stable `Dev`/published CSS are not changed by this research branch.

## Evidence (not a native AT certification)

The real Chrome DevTools Protocol probe on both Blazor WebAssembly and locally published InteractiveServer, and the same test on Microsoft Edge, passed **183/183 assertions in each of four actual executions**. New tests specifically verify:

- `aria-labelledby` equals the actual `h2.id`, and there is no competing explicit `aria-label`.
- The Chromium **Accessibility.getPartialAXTree** computed Dialog name equals the visible heading text.
- Simultaneously open Dialogs each have a unique, correctly scoped IDREF target.
- A real custom fragment with **no header** retains a localized Persian `aria-label="پنجره سفارشی"`; the Chromium AX name is the decoded Persian string.
- Both pathways continue to dismiss and return focus to their explicitly configured launchers.

**53/53 NUnit tests** passed, including two **HTML-only Blazor HtmlRenderer** tests proving unique title IDREFs in SSR markup and the custom content fallback. The Persian assertion explicitly HTML-decodes the encoded SSR attribute first. Release solution build has zero warnings and errors.

**Tool availability:** NVDA was not installed at the checked conventional executable paths on Dev01; macOS 27.0.1 on MacBook3 had Safari but VoiceOver was not running. No attempt was made to change the user's OS accessibility settings or start audible VoiceOver. The above Chromium accessibility-tree evidence is *not* a substituted claim of an actual NVDA/VoiceOver session.

## Open gates

Real native AT speech and browsing-mode behavior, macOS/Safari and Firefox engine parity, dialog title updating during a live modal, `aria-describedby` for varying content, heading hierarchy for other document structures, final Fluent 2 design review, public API/Skills/migration approval and relevant cross-component interaction matrix remain open.

Issue **#418 stays In progress**, PR **#500 stays Draft**, separate **#420 remains Backlog**. Do not merge this branch into Dev or publish a stable NuGet package.
