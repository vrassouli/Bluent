# #418 D5 — Visible Dialog description, changing title and reduced-motion dismissal

**Checkpoint:** 2026-10-11. **Status:** opt-in v3 draft, not final Fluent 2 API or accessibility certification. Work remains on isolated `v3/issue-418-design-tokens` with Draft PR #500 targeting `bluent-v3`, never `Dev`.

## Actual editable design-first source

Bluent v3 Design System Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. Newly authored **D5 · Dialog describedby and live title · #418** page `535db143-a732-807e-8008-c650a310958b`, board `535db143-a732-807e-8008-c650a32a10f7`. **22 editable native shapes, zero out-of-board geometry errors**; exported live PNG and visually reviewed. Diagram separates (A) a genuinely visible, localized description with a valid per-Dialog `aria-describedby` IDREF and (B) a changing `h2` whose `aria-labelledby` pointer remains stable and computed AX name follows the current text. Extends earlier Penpot title-name decision page 38 `535db143-a732-807e-8008-c64b3e0c419d` and board `535db143-a732-807e-8008-c64b3e839d5a`. **All designs are Draft, not maintainer-approved final component states.**

## Opt-in implementation

Provisional `DialogConfigurator.SetAccessibleDescription(string)` requires nonblank visible text and is applied only to a Dialog explicitly configured with `SetAccessibleDialog`. The Dialog owns an ID based on its existing unique root ID, `{Dialog.Id}_description`, and links `aria-describedby` to exactly that ID. The standard title-bearing `DialogDefaultContent` displays its description in the regular Dialog content area; custom `RenderFragment` Dialogs display the configured visible description as a scoped child of the Dialog root. Legacy unconfigured Dialogs retain the old markup and receive no description or ARIA IDREF.

The standard opt-in title already uses `aria-labelledby` pointing to the built-in `h2` (see D5-DIALOG-HEADING-AX-AUDIT.md). This checkpoint adds a *research-only*, named cascading `Action<string>` callback (`V3DialogTitleUpdate`) from the title-bearing standard content to a child demo `V3DynamicTitleContent`. A genuine Bluent Button changes the bound Blazor heading text to Persian, while the native `h2.id` and `aria-labelledby` remain unchanged. The Chromium Accessibility Tree name updates to the new Persian text, while the description stays attached and unchanged. The demo uses a real Bluent TextField as the explicit initial-focus target. The cascade is only supplied when the standard Dialog is opted into v3 naming; there is no new default v2 behavior or global title mutator.

## Detected and fixed InteractiveServer failure

A demanding reduced-motion test uncovered a real lifecycle risk: **when animation-duration is zero, `animationend` may never fire**, leaving an opt-in Dialog in the `hide` state. An experimental `hasZeroDialogAnimation` helper now lets the already-opted-in interactive Dialog notify its close once after rendering, while retaining the original non-opt-in legacy `animationend` dispatch path. `_closeNotified` prevents duplicate callbacks if the native event and fallback both occur.

During implementation, a duplicate JavaScript export temporarily caused a **server Circuit SyntaxError**. Capturing the actual published SSR host log revealed `Identifier 'hasZeroDialogAnimation' has already been declared`; the duplicate was removed, `node --check` passed, and the full server browser suite subsequently passed. No failing syntax or Circuit termination remained in the checked output.

## Executed evidence

**Four real Chromium/Blazor browser runs passed 190/190 checks each:** Google Chrome WebAssembly, Chrome locally published InteractiveServer, Microsoft Edge WebAssembly and Edge published InteractiveServer. New browser checks inspect both DOM and `Accessibility.getPartialAXTree`: title-bearing `aria-describedby` resolves to exactly one visible English description; custom `RenderFragment` resolves to its own visible Persian description and AX description; the Blazor Button changes the displayed title to Persian and the computed AX name tracks it without breaking existing heading/description IDREFs; actual TextField initial focus; Escape under reduced motion dismisses the Dialog and returns focus to its caller. Existing theme-brand, focus, Popover, RTL, concurrent host, reduced-motion, forced-colors and legacy fallback assertions remain passing.

**58/58 NUnit tests** passed after adding real Blazor `HtmlRenderer` SSR tests: two named Dialogs' descriptions have distinct, uniquely resolvable nodes, custom Persian descriptions decode correctly from HTML entities, legacy descriptions remain absent, whitespace is rejected and the feature defaults off. Release solution build: zero warnings/errors. These are **Chromium engine** results; Chrome and Edge are not independent browser engine coverage.

MacBook3 macOS reports Safari installed, but the attempt to query `safaridriver` timed out; no Safari automation success or failure is claimed. Previous checks found no conventional NVDA installation on Dev01 and VoiceOver was not running on MacBook3. **No actual NVDA, VoiceOver, spoken feedback or OS High Contrast certification has occurred.**

## Remaining gates

Native screen-reader announcements and virtual-cursor behavior, Safari/Firefox independent engine tests, long descriptions and text overflow, dynamic title changes during assistive speech, form validation and composite controls across contexts, final API naming and Fluent/Skills/migration parity remain open. Keep #418 In progress, PR #500 Draft and #420 Backlog until accepted. Do not merge to stable `Dev`, publish NuGet or deploy without separate approval.
