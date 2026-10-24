# #552 family audit — FileSelect (#444)

**Status: partial source/browser audit with confirmed gaps.** This is not Fluent parity acceptance, design approval, server-side upload security validation, or native OS/assistive-technology sign-off. Findings come from current Bluent source and actual isolated browser runs in WebAssembly and Release-published Production InteractiveServer; no product code was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest contains no dedicated `fluent-file-select` tag. Fluent React's `Input` is a native input primitive, not a matching file-picker-plus-file-list composition. The Bluent `FileSelect` should therefore be audited as a Bluent file-input composition (native `InputFile`, Button, optional file cards and per-file removal), not as an asserted one-to-one Fluent component. The intentional-extension disposition still needs explicit review; absence of a tag is not approval by itself.

## Confirmed behavior and accessibility gaps

| Finding | Actual source/browser evidence | Required owner disposition |
| --- | --- | --- |
| `MaxFiles` is not enforced on the accepted file collection | With `MaxFiles=2`, the real `OnChange` path accepts three files when three are chosen in one batch. It also reaches three after selecting two, removing one, then choosing two more. Both scenarios reproduce in WebAssembly and Release-published Production InteractiveServer. | #444 must decide whether an over-capacity batch is rejected as a whole or truncated to remaining slots, with visible/localized feedback. Enforce the chosen rule for both single-batch and cumulative selections, and keep callbacks/count consistent. Do not silently choose a product policy in this audit. |
| Remove action's accessible name is an icon-font glyph | Actual Chrome AX inspection reports role `button`, but name U+E66D (a private-use glyph); `aria-label` and `title` are absent. It is not an empty name, but it does not communicate “Remove file” or identify the filename. | #444 should supply a localized contextual name per file, preserve predictable focus on remove/reselect, and verify real AX plus native screen-reader output. Coordinate decorative-icon policy with #429/#420. |
| `Accept` is not a security boundary | Current source uses the native chooser's `accept` hint. The recorded audit did not validate a production upload endpoint or server-side type/content/size/authorization checks. | Keep server validation as a separate security acceptance gate; do not claim it is implemented or tested by the browser chooser. |
| Visual composition is not accepted parity | Existing nested-card spacing observations were corrected in the Lab fixture; current screenshots are not approved design comparisons. No matching upstream file-select composition exists in the pinned tag manifest. | Review the actual editable Bluent v3 design for card spacing, focus, remove/reselect behavior, RTL/mobile and forced colors before visual acceptance. |

The actual evidence documents report 17/17 WebAssembly and 12/12 published-Server observation checks for the cumulative run, plus a separately reproduced single-batch overflow in both hosts. These counts mean the harness observed the documented behavior, including the defects; they are not “passing parity tests.” The source audit also records that `MaxFiles` gates whether the picker Button is shown, while the change handler appends every selected file from the batch without enforcing remaining capacity.

## Disposition for the canonical nine-dimension matrix

- `behavior`: `audited_gaps` — the single-batch and cumulative `MaxFiles` violations are reproduced in both tested hosts.
- `accessibility`: `audited_gaps` — the actual browser AX name is a non-semantic private-use glyph instead of contextual action text; native OS/AT remains pending.
- `visual`, `feature`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps` — existing observations do not complete those acceptance dimensions.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Evidence sources

- [Live FileSelect upload and accessible-name audit](FLUENT-PARITY-P0-FILESELECT-LIVE-UPLOAD.md)
- [Published InteractiveServer and single-batch reproduction](FLUENT-PARITY-P0-FILESELECT-PUBLISHED-SERVER.md)
- [Canonical FileSelect source reference](../../components/file-select.md)
- [Pinned Fluent Web Components 3.1.3 family crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Machine-readable source-semantic findings](FLUENT-PARITY-P0-SEMANTICS.json)
- [FileSelect owner issue #444](https://github.com/vrassouli/Bluent/issues/444)

**Boundary:** browser evidence proves the observed overflow and weak accessible name in the tested scenarios. It does not establish upload security, full Fluent equivalence, design approval, native OS/AT acceptance, or permission to implement in #552.

