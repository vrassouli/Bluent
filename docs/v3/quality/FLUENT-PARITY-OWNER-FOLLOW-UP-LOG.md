# #552 Fluent parity audit — owner follow-up log

**Updated: 2026-10-23**  
**Audit issue:** [#552](https://github.com/vrassouli/Bluent/issues/552)  
**Audit PR:** [#553 — Draft, targets bluent-v3](https://github.com/vrassouli/Bluent/pull/553)

## Why this log exists

The 18-family retrospective audit has actionable findings spread across source/API reports, browser evidence bundles, and the owning component issues. This index makes the follow-up trail reviewable without pretending that a comment, passing instrumentation check, or source finding is acceptance.

This remains an audit-only workstream. No product component implementation or public API was changed here. Product owner issues retain their existing workflow status; none is promoted or closed by these follow-ups. Every family remains researching, design approval pending, and full evidence bundle null until its own approved design and acceptance gates are completed.

## Owner-linked findings

| Owner / area | Finding recorded | Evidence class and remaining boundary | GitHub follow-up |
|---|---|---|---|
| Component Lab #421 | The Fields showcase renders duplicate IDs: _timeOnly, _timeSpan, and _dateField each occur twice. Treat as a demo composition defect; it does not prove every isolated component duplicates IDs. | Reproduced with DOM scans in Chrome and Edge WebAssembly in Light/LTR, Dark/RTL and emulated forced-colors. Fix the fixture separately and rerun ID/label association checks. | [Issue comment](https://github.com/vrassouli/Bluent/issues/421#issuecomment-6364097165) |
| Icon #429 | Cross-family consistency review: preserve the actual IconDefinition-based public contract; the Badge documentation mismatch does not establish a new Icon runtime defect. | Existing Icon browser/source reports remain authoritative; this comment is a mapping/documentation cross-check only. | [Issue comment](https://github.com/vrassouli/Bluent/issues/429#issuecomment-6364123686) |
| Label #430 | The nested Info button is named “This is a label” in both browser accessibility trees, rather than having an action-specific name. | Reproduced in Chrome/Edge browser AX. Native screen-reader announcement and real popover activation remain untested. | [Issue comment](https://github.com/vrassouli/Bluent/issues/430#issuecomment-6364121764) |
| Link #431 | Disabled anchor loses link semantics yet remains in Tab order; callback suppression was not exercised in the existing demo. | Reproduced DOM/AX gap in Chrome/Edge. Source shows an unconditional callback path, but real callback invocation counting still needs a dedicated interactive test. | [Issue comment](https://github.com/vrassouli/Bluent/issues/431#issuecomment-6364122316) |
| NumericField #433 | Public Step is stored but never consumed; missing numeric input-mode and native spinbutton/range semantics need a contract decision. | Source/API gap confirmed. The narrow integer-entry browser path passes; decimal/culture, bound and AT cases remain open. | [Issue comment](https://github.com/vrassouli/Bluent/issues/433#issuecomment-6364094735) |
| RadioGroup #436 | Empty native name values and missing group semantics allow ArrowRight to cross into another group and change its checked state. | Reproduced with real native keyboard input and Chrome/Edge AX. Actual form submission, published InteractiveServer and native screen-reader output remain untested. | [Issue comment](https://github.com/vrassouli/Bluent/issues/436#issuecomment-6364020962) |
| SelectField #437 | The inherited BindValueEvent selector is ignored because the component hard-wires change handling. | Source/API mismatch confirmed. Native single-select ArrowDown works; array/multiple-select and form validation remain unverified. | [Issue comment](https://github.com/vrassouli/Bluent/issues/437#issuecomment-6364095285) |
| DateField #438 | DateClass is not forwarded; typed input bypasses Min/Max checks; YearSelect formatting/mask/parsing are inconsistent; calendar trigger lacks an explicit accessible name. | Source gaps confirmed. Browser evidence only covers the basic typed-date path; bounds, YearSelect and calendar activation were not tested in that run. | [Issue comment](https://github.com/vrassouli/Bluent/issues/438#issuecomment-6364095929) |
| TimeField #439 | Inherited BindValueEvent is not forwarded into the internal MaskedField. Seconds output such as 9:30:0 is an observed formatting contract, not automatically a defect. | Source selector mismatch confirmed. Basic time entry works; Culture, seconds boundaries and DateTime.Kind remain untested. | [Issue comment](https://github.com/vrassouli/Bluent/issues/439#issuecomment-6364096541) |
| MaskedField #440 | Typing digits that include the fixed digit prefix reproduces duplicated literal output: 09123456789 produces 0991-234-5678 under the audited mask. | Reproduced in Chrome/Edge WebAssembly. Paste, mid-string caret, composition/IME, undo/redo and mobile input remain untested. | [Issue comment](https://github.com/vrassouli/Bluent/issues/440#issuecomment-6364017910) |
| Badge #445 | AnimateShadow continues an infinite 1.5s animation while CDP emulation reports prefers-reduced-motion: reduce. Canonical docs also describe Icon as string although source declares IconDefinition?. | Reduced-motion gap reproduced as browser-computed style in Chrome/Edge; not native OS certification. Documentation drift confirmed by source/docs inspection. | [Issue comment](https://github.com/vrassouli/Bluent/issues/445#issuecomment-6364122931) |
| Audit #552 | Summarizes the above owner referrals and their acceptance boundaries. | A tracking comment is not closure, design approval, or proof every scenario has run. | [Issue comment](https://github.com/vrassouli/Bluent/issues/552#issuecomment-6364097761) |

## Evidence references

- [Typed-field browser audit](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) and [typed-field source/API audit](FLUENT-PARITY-TYPED-FIELDS-AUDIT.md).
- [Checkbox/Switch/RadioGroup/OtpField browser audit](FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md) and [RadioGroup family audit](FLUENT-PARITY-RADIOGROUP-AUDIT.md).
- [Label/Link/Badge browser audit](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md), [Link family audit](FLUENT-PARITY-LINK-AUDIT.md), and [Badge family audit](FLUENT-PARITY-BADGE-AUDIT.md).
- [18-family retrospective matrix](FLUENT-PARITY-RETRO-AUDIT.md).

## Verification boundary

The typed-field browser evidence was rerun on 2026-10-23 and now records **49/49 instrumentation checks in Chrome and 49/49 in Edge**, up from an earlier 42-check version of the report. This is evidence collection and fixture-verification success, not a component pass grade. CDP forced-colors is emulation; browser accessibility trees do not replace physical screen-reader testing. Published InteractiveServer, native Windows contrast, accepted family-specific editable designs, full state/event matrices and normalized Fluent visual comparisons remain open where stated in the individual reports.

The canonical 18-family matrix remains auditComplete=false, noneApproved=true; no component family is marked accepted by this log.
