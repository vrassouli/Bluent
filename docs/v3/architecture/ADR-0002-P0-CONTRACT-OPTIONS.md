# ADR-0002 / P0 component interaction decisions — approved defaults and open details

**Status: Limited behavioral defaults approved by the maintainer (2026-10-25); design and implementation gates remain open.** Scope: #420 shared interaction conventions, #418 token policy, downstream product owners #428 Button, #442 Slider, #443 RangeSlider, #444 FileSelect. This decision record does not itself authorize product implementation, establish final public API, accept a Penpot/Figma design, or certify native OS/assistive-technology behavior.

## Maintainer decision 2026-10-25 (behavioral defaults only)

The maintainer explicitly approved the following limited defaults on 2026-10-25:

- **Button #428:** on the native button rendering path, emit generated `aria-pressed="true"` / `aria-pressed="false"` only when `Toggled.HasValue`; omit the generated attribute when `Toggled` is null. Preserve unrelated caller `AdditionalAttributes`. The precedence of an explicitly supplied caller `aria-pressed` remains unresolved.
- **FileSelect #444:** when `MaxFiles > 1`, enforce an aggregate cap across selection events. If the complete newly selected batch exceeds the remaining capacity, reject that entire new batch, preserve the previously accepted selection, and show localized, accessible validation feedback. The policy for `MaxFiles <= 0`, callback details, and remove-button focus/name edge cases remain open.
- **Slider #442:** compute pointer position from viewport-space `PointerEventArgs.ClientX` and the matching `getBoundingClientRect().Left`; account for half the thumb width, clamp the normalized position to `[0,1]`, and guard degenerate geometry. RTL value direction/inversion remains open for design review.
- **RangeSlider #443:** retain a two-thumb range with independently accessible thumbs and a bounded, non-crossing endpoint policy. Detailed accessible names/keyboard bounds, RTL, and pointer/touch-capture behavior remain design-gated.
- **Forced Colors direction (#418):** pursue semantic track/selection roles and a solid system-color fallback that remains visible in forced-colors mode. Exact token mappings and values are **not** approved by this behavioral decision and still require accepted design and native Windows contrast/AT verification.

This approval covers the bullets above only. The remaining options below are deliberately still open. It does not move any issue in GitHub Project #5, satisfy the Ready/design prerequisites, or authorize edits to product source, public APIs, or shipped CSS. Implementation must occur in each owner's isolated task branch after that issue is Ready and its relevant design/dependency gates are satisfied.

## Why this supplement is needed

The real [#552 audit](https://github.com/vrassouli/Bluent/pull/553) has measured behavior on actual Chrome with both WebAssembly and Production-published InteractiveServer:

- **Button #428:** native Enter/Space toggle and exactly one callback per action work in both modes; intrinsic pressed semantics are missing. Do not rewrite native keyboard activation.
- **FileSelect #444:** `MaxFiles=2` accepts three files in a single picker batch **and** after 2 → remove 1 → add 2; delete Button's accessible name is only an icon font PUA glyph. Both failures reproduced through real browser file events and Blazor callbacks in both modes.
- **Slider #442 / RangeSlider #443:** eight real pointerdowns show `ScreenX - ClientX = 18px`; actual value matches the erroneous screen-coordinate model rather than viewport-relative `getBoundingClientRect().Left`. Both hosts did receive pointer callbacks in this smoke. Sliders also lack keyboard-focusable/named AX slider thumbs and lose their gradient-only rails in emulated Forced Colors.

Existing #420 Popover uses a **caller-attribute preserving** convention for owned disclosure ARIA. Here the same contract principle needs an explicit reviewed application to native toggle Buttons and file remove actions, not independent component-specific silent precedence rules.

## Full option matrix — approved defaults and open details

| Decision | Minimal recommendation for v3 | Alternative / risk / owner |
| --- | --- | --- |
| **#428 toggle semantics** | When `Toggled.HasValue`, generated native `<button>` gets an `aria-pressed` string reflecting true/false; when null, **omit**. Do not substitute `aria-selected` or a Checkbox role. Preserve other caller `AdditionalAttributes`. | The precedence for an explicitly supplied caller `aria-pressed` remains **OPEN**: caller-wins and library-wins are both still options. The approved default does not resolve conflicts; decide under #420 before #428 product edits and verify the actual rendered Blazor attribute precedence. No forced pressed property on link/navigation mode without a deliberate semantic decision. |
| **#444 over-capacity file batch** | On `MaxFiles > 1`, maintain an **aggregate cap** across selection events. Recommend **reject the full new batch** when it would exceed remaining capacity, preserve current accepted files, show a localized validation message. | The reject-entire-batch policy is approved as stated above; **accept-only-remaining is no longer the chosen default**. What `MaxFiles <= 0` means still needs an explicit public validation policy. Callback coherence for rejected/no-change batches remains an owner-level implementation/test detail. |
| **#444 single-file case** | Compatibility expectation to verify (not a separately approved new policy): preserve existing `MaxFiles=1` semantics — a valid one-file selection replaces the prior selection. | Callback/event ordering and exact behavior remain for #444 owner tests; do not conflate replacement with multi-file cumulative append. `Accept` remains a browser hint, **not** upload security validation. |
| **#444 icon action accessibility** | Every selected-file remove Button gets a **localized, filename-specific accessible name**, e.g. `Remove beta.md`; icon itself is decorative. Restore logical focus after removing item, including when no selected files remain. | This filename-specific accessible-name and post-removal focus proposal was not part of the limited approval above; confirm its detailed contract in #444 design/review. Handle duplicate/long filenames, localization, RTL name embedding and asynchronous focus. Native OS/AT remains required. |
| **#442 pointer math** | Derive values from matching coordinates: `PointerEventArgs.ClientX` with `getBoundingClientRect().Left`; subtract half Thumb width and clamp fractional value to [0,1]. Guard degenerate bounds; consider pixel/device zoom and lifecycle. | ScreenX can only be used with an explicitly matching **screen-space** rectangle (not current DOMRect). RTL value direction/inversion remains open and must be approved in design, not inferred solely from `dir=rtl`; the prototype's inversion is not an approved behavior. Preserve existing generic numeric value conversion until explicitly reviewed. |
| **#443 two-thumb model** | Same client/viewport math per active thumb; two *independently accessible* thumbs with stable keyboard order, labels, aria-valuenow, aria-valuemin/max dependent on the other thumb, and bounded non-crossing policy. | Official WC 3.1.3 does **not** expose an identical two-thumb component; this is an intentional Bluent-only extension using WAI-ARIA multi-thumb guidance as the semantics reference, not a fake Fluent one-to-one match. The approved default is non-crossing endpoints; keyboard/ARIA details, RTL and touch/pointer capture still need detailed design and owner review. |
| **#418 Forced Colors tokens** | Author semantic track / selection roles with system colors and solid fallback paint surviving `forced-colors: active`; preserve focus/disabled contrast and selected segment. | The high-level fallback direction is approved, but do not ship the Chrome-only `CanvasText` / `Highlight` prototype from #552 directly. Exact tokens/system-color mappings still require accepted Light/Dark/RTL design and real Windows Contrast Themes/native AT. |

## Executable .NET contract options — NOT product fixes

`scripts/quality/v3_p0_policy_prototype` is a **standalone .NET 10 QA model (no external NuGet dependencies; uses the built-in ASP.NET Core shared framework to exercise HtmlRenderer)**, deliberately outside `src/` and outside the public package.

Run:

```powershell
dotnet run --project scripts/quality/v3_p0_policy_prototype/V3P0PolicyPrototype.csproj -c Release
```

The prototype executes **70 real .NET assertions**, covering both safe file-overflow policies for a three-file batch with MaxFiles=2, cumulative append after deletion, rejected versus accepted callback implications, single-file replacement, disabled/empty/invalid capacity, a viewport-relative numeric slider model and incorrect `ScreenX` offset, RTL inversion *as a candidate*, degenerate rail guarding, and three native Button pressed-state cases including explicit caller override. None of these assertions proves that the shipped Bluent implementation has been fixed, or that native OS/AT users can understand the proposed controls. Real Blazor renderer output and input-event argument behavior are verified in the supplementary section below.

Any owner issue implementation must (a) link an **accepted** version of these specific decisions, (b) change source only in its own Ready/In progress branch, (c) replace #552's known-gap tests with **positive** WASM/Production Server/browser/AT regressions, and (d) obtain the component's actual Penpot/Figma design acceptance before Review/Done.


### Measured Blazor render-attribute precedence (not conjecture)

The prototype also now renders a **real Blazor ComponentBase via ASP.NET Core 10 HtmlRenderer**, comparing exactly the two orders of `RenderTreeBuilder.AddMultipleAttributes` and `AddAttribute`. The emitted HTML in the actual .NET run was:

- **Caller attributes first; library aria-pressed last:** `<button data-qa="kept" aria-pressed="true">Toggle</button>` — the library's `true` wins, discarding explicit caller `mixed`.
- **Library aria-pressed first; caller attributes last:** `<button aria-pressed="mixed" data-qa="kept">Toggle</button>` — explicit caller `mixed` wins. Both variants have **one**, not duplicate, `aria-pressed` attributes.

Thus, if #420 accepts **caller override precedence**, #428 must add computed pressed state **before** `AdditionalAttributes` in the native RenderTreeBuilder call order, then verify the complete real Button/split/anchor rendering and contradictory caller overrides. This is a factual renderer result and a *proposed* rule; it does not mean #428's product code has been changed or that contradictory caller values are a recommended usage pattern.
### Real Blazor InputFileChangeEventArgs + HtmlRenderer (70 assertions; 2026-10-19)

The same in-box .NET 10 prototype now constructs the **real Blazor `InputFileChangeEventArgs` type**, backed by disposable `IBrowserFile` test doubles rather than a browser picker or user data. The tests deliberately distinguish between its native API and our proposed collection policy:

- `args.GetMultipleFiles(args.FileCount)` returns **all 3** selected files and **does not** know or enforce FileSelect's aggregate `MaxFiles=2`.
- `args.GetMultipleFiles(2)` on a **3-file** event throws `InvalidOperationException` instead of truncating to 2. Likewise, for the **remove/reselect** path with one remaining slot, `args.GetMultipleFiles(1)` throws on a new 2-file event. Therefore, **never implement an accept-remaining policy merely by passing remaining slots to GetMultipleFiles**; inspect `FileCount`, apply policy, and retrieve the event batch with a sufficiently large request only when appropriate.
- `args.File` also throws for an actual multi-file event; the existing single-file replacement route using `args.File` is a distinct intentional case.
- **Reject-entire-batch candidate** preserves the original accepted `IBrowserFile` objects and emits no accepted-file change, while the separate **accept-remaining candidate** must explicitly partition the complete batch. Neither is approved yet.
- The model's separate stream-size check is **not** a file-count limit or upload security evaluation; no real server files were written.

A second **real ASP.NET Core HtmlRenderer** QA-only `FileSelectionFeedbackProbe` renders the proposed rejection as visible text with `role="alert"` and keeps the old file card, whose remove Button gets a filename-specific `aria-label`. It checks that exactly-at-capacity renders no stale alert, and that Persian `حذف` and an untrusted filename `x<evil>&.txt` are correctly HTML-encoded (including numeric character entities for Persian glyphs), not inserted as markup. This is a **renderer-level HTML/encoding check**, not native screen-reader speech, a finished visual FileSelect design, automatic localization, or a Blazor component implementation.

**All 70 .NET assertions pass locally**; the final verification is incorporated in the existing #420 Linux CI contract job. The QA model remains under `scripts/quality/`, not `src/Bluent.UI/`. The proper Penpot #420 tool connection was unavailable when rechecked during this step, so no new board edit or designer approval is claimed.

## Design/tool and release boundaries

Canonical **Bluent v3** editable Penpot board for #420: file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `ed5216bd-3d5b-8015-8008-cb247e27efb4`, interaction board `ed5216bd-3d5b-8015-8008-cb247e906204`. The board is **DRAFT**; these precise P0 decisions still need a reviewer-visible, accepted edit on the correct design board. The #552 draft Figma rail comparison is supplementary and **not** design approval.

Foundation PRs [#500 tokens](https://github.com/vrassouli/Bluent/pull/500) and [#550 interactions](https://github.com/vrassouli/Bluent/pull/550) remain independent. #418 handles approved token mapping; #420 handles interaction conventions; owners #428/#442/#443/#444 implement components, with browser quality gates #425 and Component Lab #421. Do not merge any of this into the stable `Dev` or publish NuGet 2.x. Passing 70 QA assertions is **not 70 defects fixed** or Fluent parity.
