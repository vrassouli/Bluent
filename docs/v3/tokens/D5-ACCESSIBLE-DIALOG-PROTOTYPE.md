# #418 — Opt-in Dialog accessibility contract (draft implementation)

**Status: browser-tested draft on v3/issue-418-design-tokens, NOT approved or shipped.** PR #500 targets bluent-v3 only. Stable Dev and released NuGet are unchanged.

## Source design

Editable Penpot Bluent v3 Design System file b64f6665-c9ab-80b5-8008-c4ac99d9d000, D2/D5 page acf5f619-7d81-80da-8008-c5fec09d9837, board acf5f619-7d81-80da-8008-c5fec0b7ec61. The existing design acceptance calls for Dialog role, readable Close label, focus entry and restoration. Penpot browser plugin was suspended on this checkpoint: no newly approved design/revision is claimed.

## Draft C# contract

DialogConfigurator.SetAccessibleDialog(name, closeButtonLabel) accepts two explicit nonblank strings. A caller can combine it with SetThemeScope(scope) and SetModal(false/true). These are provisional names, additive to the isolated v3 branch.

For this opted-in route:
- Actual Dialog root has role="dialog", aria-label set to the supplied name, tabindex="-1" and aria-modal="true" only when configured Modal.
- The existing icon-only Close Button receives the supplied localized aria-label.
- Dialog focuses its own root via ElementReference.FocusAsync on first interactive render.
- A no-configuration legacy Dialog still emits no role, aria-label, tabindex or accessible Close label, preserving the existing markup.
- Independent service-hosted Dialogs have their own accessible name and label. The lab exercises a Persian Close label «بستن پنجره» without hardcoding it globally.

## Evidence and limits

Real Chrome and Edge (Chromium) on both Blazor WASM and locally published InteractiveServer: **149/149 positive browser checks in each of four executions**. Checks cover DOM role, close accessible-name via Chrome AX, real initial active focus, Persian label, legacy fallback, plus existing Theme/brand/motion/reflow coverage. **43/43 NUnit** tests pass; Release build has zero warnings and errors.

**Still open:** caller-focus restoration after close (especially nested Dialogs), complete modal focus trap/keyboard escape, native AT/OS High Contrast, the live Popover button trigger's missing aria-expanded/aria-controls, final accessible-name/locale API design and final Penpot approval. The browser test deliberately still reports the Popover gap. Do not interpret a positive test count as full WCAG compliance.

See D5-PORTAL-ACCESSIBILITY-AUDIT.md for the earlier baseline, and PORTAL-THEME-SCOPE-PREVIEW.md for the opt-in theme owner contract.