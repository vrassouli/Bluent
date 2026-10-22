# #552 family audit — OtpField (#441)

**Status: partial source/API audit with accessibility/localization gaps identified.** This is not Fluent parity acceptance, design approval, or JavaScript/browser/native assistive-technology sign-off. No product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest has no dedicated OTP/one-time-code component. A Bluent `OtpField` is a composition of multiple text/password inputs, a hidden bound input, and packaged JavaScript that manages the visible cells. Fluent `Input`/TextField primitives are relevant to the individual cells but are not a one-to-one OTP component. Treat OtpField as a possible Bluent extension and document its own behavior; do not assert upstream equivalence.

## Source-backed findings

| Finding | Current source | Disposition |
| --- | --- | --- |
| Group accessible name is hard-coded English | `OtpField.razor` emits `role="group" aria-label="Verification code"` as a literal string. | Confirmed localization/accessibility gap for Persian and other localized applications. A consumer cannot configure the group label through a dedicated parameter; forwarding unmatched attributes applies to the outer wrapper, not this inner group. |
| Per-cell accessible labels are hard-coded English | Each visible input emits `aria-label="Digit N of Length"` as a literal. | Confirmed localization/accessibility gap. Add a localizable label template or resource-backed formatter while preserving position and length information. |
| Non-positive `Length` creates contradictory labels | Rendering uses `Math.Max(1, Length)` for the number of visible inputs, but the label uses raw `Length`. For `Length=0`, the source still renders one input named “Digit 1 of 0”; negative lengths can produce the same inconsistency. | Source-confirmed boundary bug. Validate `Length` or consistently use a normalized effective length for both rendered cells and accessible labels. |
| Input behavior depends on JS interop | Source initializes `OptFieldInterop` after first render. Focus movement, paste distribution, backspace navigation and auto-submit are not proven by the Razor markup. | Explicitly unverified. Do not mark keyboard/paste/auto-submit behavior as passed from source inspection or the compiled showcase alone. |
| Visible and submitted values differ structurally | Each visible cell has `maxlength="1"`, numeric input mode, `autocomplete="one-time-code"`, pattern `\d*`, and a per-cell label; the bound value is stored in a hidden input. `Digits` filters `char.IsDigit` characters and slices to `Length`. | Verify ASCII/Persian/Arabic digit normalization, paste, incomplete values, length changes and form submission in the actual runtime. No claim is made here about how all digit systems behave in the browser. |

## Canonical matrix disposition

- `accessibility`: `audited_gaps` — group and per-digit names are fixed English strings, and non-positive `Length` can produce contradictory accessible labels.
- `visual`, `feature`, `behavior`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `not_reviewed` — source inspection does not complete OTP runtime, design or upstream feature acceptance.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#441:** add localized group/cell accessible labels with explicit parameters or resource-backed defaults; test Persian and English names in the browser AX tree and native screen readers.
2. Normalize/validate `Length` and use the same effective value for visible cells, `Digits`, group metadata and per-cell names.
3. Run actual JavaScript-backed tests for initial focus, sequential typing, paste of one/many digits, backspace/delete navigation, arrow-key behavior, autofill, password mode, auto-submit, value updates and form serialization.
4. Test Persian/Arabic digits, RTL/LTR, mobile input, Light/Dark, forced colors, 320px/reflow and WebAssembly/published InteractiveServer. Link the editable Bluent v3 design before visual approval.
5. Keep implementation on #441 after Ready/design gates; this #552 branch remains audit-only.

## Evidence sources

- [Canonical OtpField documentation](../../components/otp-field.md)
- `src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor` and `.razor.cs`
- Packaged interop `src/Bluent.UI/Interops/OptFieldInterop` and the current Fields showcase (source only; not a new runtime pass)
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [OtpField owner issue #441](https://github.com/vrassouli/Bluent/issues/441)

**Boundary:** this is a source/API audit. It does not prove JavaScript behavior, native screen-reader output, full Fluent parity, or design approval.
