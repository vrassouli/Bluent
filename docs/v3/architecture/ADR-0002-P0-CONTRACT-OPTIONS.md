# ADR-0002 / P0 component interaction decisions — executable proposal

**Status: PROPOSED, pending maintainer/design approval (2026-10-19).** Scope: #420 shared interaction conventions, #418 token policy, downstream product owners #428 Button, #442 Slider, #443 RangeSlider, #444 FileSelect. This is not a new public v3 contract and does not change product code.

## Why this supplement is needed

The real [#552 audit](https://github.com/vrassouli/Bluent/pull/553) has measured behavior on actual Chrome with both WebAssembly and Production-published InteractiveServer:

- **Button #428:** native Enter/Space toggle and exactly one callback per action work in both modes; intrinsic pressed semantics are missing. Do not rewrite native keyboard activation.
- **FileSelect #444:** `MaxFiles=2` accepts three files in a single picker batch **and** after 2 → remove 1 → add 2; delete Button's accessible name is only an icon font PUA glyph. Both failures reproduced through real browser file events and Blazor callbacks in both modes.
- **Slider #442 / RangeSlider #443:** eight real pointerdowns show `ScreenX - ClientX = 18px`; actual value matches the erroneous screen-coordinate model rather than viewport-relative `getBoundingClientRect().Left`. Both hosts did receive pointer callbacks in this smoke. Sliders also lack keyboard-focusable/named AX slider thumbs and lose their gradient-only rails in emulated Forced Colors.

Existing #420 Popover uses a **caller-attribute preserving** convention for owned disclosure ARIA. Here the same contract principle needs an explicit reviewed application to native toggle Buttons and file remove actions, not independent component-specific silent precedence rules.

## Decisions to approve (all currently open)

| Decision | Minimal recommendation for v3 | Alternative / risk / owner |
| --- | --- | --- |
| **#428 toggle semantics** | When `Toggled.HasValue`, generated native `<button>` gets an `aria-pressed` string reflecting true/false; when null, **omit**. Do not substitute `aria-selected` or a Checkbox role. Preserve other caller `AdditionalAttributes`. | If the caller explicitly supplies `aria-pressed`, **proposed** precedence is caller wins (same principle as Popover). Caller could then contradict bound `Toggled`; alternatively disallow conflicting override and document it. Decide under #420 before product edits, and test the **actual** rendered Blazor attribute precedence, not only a dictionary model. No forced pressed property on link/navigation mode without a deliberate semantic decision. |
| **#444 over-capacity file batch** | On `MaxFiles > 1`, maintain an **aggregate cap** across selection events. Recommend **reject the full new batch** when it would exceed remaining capacity, preserve current accepted files, show a localized validation message. Do not fire `OnFileSelected` or `OnChange` if no accepted collection change occurred. | Alternative: **accept only the remaining slots**, visibly announce rejected count and emit selection/callback only for accepted files. Both are modeled and safe on counts; user-facing policy needs explicit maintainer/design approval. Never silently accept beyond cap, or silently truncate with no explanation. What `MaxFiles <= 0` means also needs an explicit public validation policy; prototype treats it as invalid. |
| **#444 single-file case** | Preserve existing `MaxFiles=1` semantics: valid one-file selection **replaces** prior selection; selected and collection-change callbacks must be coherent. | Do not conflate single-file replacement with multi-file cumulative append. `Accept` remains a browser hint, **not** upload security validation. |
| **#444 icon action accessibility** | Every selected-file remove Button gets a **localized, filename-specific accessible name**, e.g. `Remove beta.md`; icon itself is decorative. Restore logical focus after removing item, including when no selected files remain. | Handle duplicates with identical filenames and extremely long names, localization, RTL name embedding and focus after asynchronous updates. Native OS/AT remains a separate required verification. |
| **#442 pointer math** | Derive values from matching coordinates: `PointerEventArgs.ClientX` with `getBoundingClientRect().Left`; subtract half Thumb width and clamp fractional value to [0,1]. Guard degenerate bounds; consider pixel/device zoom and lifecycle. | ScreenX can only be used with an explicitly matching **screen-space** rectangle (not current DOMRect). For RTL, value direction/inversion must be approved in the design, not inferred solely from `dir=rtl`; the prototype's inversion is a proposal. Preserve existing generic numeric value conversion until explicitly reviewed. |
| **#443 two-thumb model** | Same client/viewport math per active thumb; two *independently accessible* thumbs with stable keyboard order, labels, aria-valuenow, aria-valuemin/max dependent on the other thumb, and bounded non-crossing policy. | Official WC 3.1.3 does **not** expose an identical two-thumb component; this is an intentional Bluent-only extension using WAI-ARIA multi-thumb guidance as the semantics reference, not a fake Fluent one-to-one match. Thumb-crossing and touch/pointer capture need design + owner review. |
| **#418 Forced Colors tokens** | Author semantic track / selection roles with system colors and solid fallback paint surviving `forced-colors: active`; preserve focus/disabled contrast and selected segment. | Do not ship the Chrome-only `CanvasText` / `Highlight` prototype from #552 directly without accepted token mapping, Light/Dark/RTL design and real Windows Contrast Themes/native AT. |

## Executable .NET contract options — NOT product fixes

`scripts/quality/v3_p0_policy_prototype` is a **standalone .NET 10 QA model (no external NuGet dependencies; uses the built-in ASP.NET Core shared framework to exercise HtmlRenderer)**, deliberately outside `src/` and outside the public package.

Run:

```powershell
dotnet run --project scripts/quality/v3_p0_policy_prototype/V3P0PolicyPrototype.csproj -c Release
```

The prototype executes **50 real .NET assertions**, covering both safe file-overflow policies for a three-file batch with MaxFiles=2, cumulative append after deletion, rejected versus accepted callback implications, single-file replacement, disabled/empty/invalid capacity, a viewport-relative numeric slider model and incorrect `ScreenX` offset, RTL inversion *as a candidate*, degenerate rail guarding, and three native Button pressed-state cases including explicit caller override. None of these assertions proves that the shipped Bluent implementation has been fixed, nor that a real Blazor render tree obeys the proposed precedence.

Any owner issue implementation must (a) link an **accepted** version of these specific decisions, (b) change source only in its own Ready/In progress branch, (c) replace #552's known-gap tests with **positive** WASM/Production Server/browser/AT regressions, and (d) obtain the component's actual Penpot/Figma design acceptance before Review/Done.


### Measured Blazor render-attribute precedence (not conjecture)

The prototype also now renders a **real Blazor ComponentBase via ASP.NET Core 10 HtmlRenderer**, comparing exactly the two orders of `RenderTreeBuilder.AddMultipleAttributes` and `AddAttribute`. The emitted HTML in the actual .NET run was:

- **Caller attributes first; library aria-pressed last:** `<button data-qa="kept" aria-pressed="true">Toggle</button>` — the library's `true` wins, discarding explicit caller `mixed`.
- **Library aria-pressed first; caller attributes last:** `<button aria-pressed="mixed" data-qa="kept">Toggle</button>` — explicit caller `mixed` wins. Both variants have **one**, not duplicate, `aria-pressed` attributes.

Thus, if #420 accepts **caller override precedence**, #428 must add computed pressed state **before** `AdditionalAttributes` in the native RenderTreeBuilder call order, then verify the complete real Button/split/anchor rendering and contradictory caller overrides. This is a factual renderer result and a *proposed* rule; it does not mean #428's product code has been changed or that contradictory caller values are a recommended usage pattern.
## Design/tool and release boundaries

Canonical **Bluent v3** editable Penpot board for #420: file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `ed5216bd-3d5b-8015-8008-cb247e27efb4`, interaction board `ed5216bd-3d5b-8015-8008-cb247e906204`. The board is **DRAFT**; these precise P0 decisions still need a reviewer-visible, accepted edit on the correct design board. The #552 draft Figma rail comparison is supplementary and **not** design approval.

Foundation PRs [#500 tokens](https://github.com/vrassouli/Bluent/pull/500) and [#550 interactions](https://github.com/vrassouli/Bluent/pull/550) remain independent. #418 handles approved token mapping; #420 handles interaction conventions; owners #428/#442/#443/#444 implement components, with browser quality gates #425 and Component Lab #421. Do not merge any of this into the stable `Dev` or publish NuGet 2.x. Passing 42 policy assertions is **not 42 defects fixed** or Fluent parity.
