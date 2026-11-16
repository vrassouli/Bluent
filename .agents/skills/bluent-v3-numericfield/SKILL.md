# Bluent v3 NumericField — accepted implementation reference

> **Issue #433 and PR #563 were accepted and merged into bluent-v3 on 2026-11-16.** Historical handoff status: PR #563 was Ready for independent review before that acceptance. This is not a released v3 API or a stable NuGet contract. The existing 2.x consumer reference remains authoritative for released packages.

## Retrieval order

1. [Canonical NumericField v3 implementation record](../../../docs/v3/components/numeric-field.md) for the source-backed API, behavior, acceptance and migration status.
2. [Task PR #563](https://github.com/vrassouli/Bluent/pull/563) and [Issue #433](https://github.com/vrassouli/Bluent/issues/433) for the merge record and completion state.
3. Owned Penpot file Bluent v3 Design System, file b64f6665-c9ab-80b5-8008-c4ac99d9d000, page 51 e9b4dbe1-9dd3-8094-8008-f2a6fdb3c800. Six boards carry the ENGINEERING BASELINE marker and were accepted for #433 on 2026-11-16; the Theme board remains DRAFT under #418.
4. Source: src/Bluent.UI/Components/NumericFieldComponent/; stepper styles src/Bluent.UI/Styles/Components/_numeric-field.scss; scoped keyboard module src/Bluent.UI/wwwroot/bluent.ui.numeric-field.js.
5. Live showcase: /components/numeric-fields (WebAssembly); /components/numeric-fields-server (published InteractiveServer).
6. [Generic v3 component router](../bluent-v3/COMPONENT-ROUTER.md) for project status/version routing; [migration impact ledger](../../../docs/v3/design/MIGRATION-IMPACT-LEDGER.md) for consumer impact.
7. QA guard and probe: scripts/quality/check_v3_numericfield_contract.py, scripts/quality/test_v3_numericfield_contract.py, scripts/quality/probe_v3_numericfield.mjs, scripts/quality/run_v3_numericfield.ps1.

## Source-backed API

- NumericField<TValue> inherits Blazor InputBase<TValue>; supported numeric types are nullable/non-nullable sbyte, byte, short, ushort, int, uint, long, ulong, float, double and decimal.
- Preserve Value / ValueChanged / ValueExpression and EditContext validation semantics.
- Direct component inputs include Min, Max, Step, Format, GainFocus, OnFocus, OnBlur, ParsingErrorMessage, MinimumErrorMessage, MaximumErrorMessage and OverflowErrorMessage.
- Shared Field/base inputs include StartAddon, EndAddon, Size, BindValueEvent, Class, Style and normal unmatched HTML attributes. Label association remains the consumer's responsibility.
- Do not invent HideStep, TextAlignment, glyph slots, imperative step methods or other public API.

## Behavior rules

- Keep the editable native input type=text; do not replace it with type=number.
- Preserve raw intermediate editing text, sign, decimal/group separators, caret and selection during input. Parse/format using the active CultureInfo.CurrentCulture policy.
- Normalize Latin, Persian and Arabic decimal digits, culture signs, grouping and decimal separators deliberately. The browser culture matrix covers en-US, de-DE, fa-IR and ar-EG. Empty text maps to null only for nullable TValue; invalid intermediate text, overflow and non-finite floating values are distinct failures.
- Min and Max are inclusive. Step must be positive and finite. Typed out-of-range values remain visible and invalid; never silently clamp user text.
- ArrowUp / ArrowDown step by Step. Home / End act only when the corresponding explicit bound exists. Pointer stepper buttons have localized names and are not Tab stops; pointer activation preserves editing focus.
- Keep the input itself dir=ltr and physically left aligned even inside an RTL field shell. Labels, messages, shell and logical addons follow host direction.
- Expose truthful role=spinbutton range/value state. Omit aria-valuenow for empty, invalid or out-of-range values rather than announcing a stale bound model value.
- The JavaScript key bridge is internal; preserve its disposal path and component-level unmount test. Do not promote the JS bridge to public API.

## Verified example

```razor
@using Bluent.UI.Components

<EditForm Model="@_model">
    <DataAnnotationsValidator />
    <NumericField TValue="decimal"
                  @bind-Value="_model.Amount"
                  Min="0m"
                  Max="100m"
                  Step="0.25m"
                  Format="N2"
                  BindValueEvent="oninput" />
</EditForm>
```

Use Format=N2 only when two decimal places are desired. BindValueEvent=oninput opts into per-keystroke parsing/validation; the default remains onchange. This snippet describes the current task-branch implementation, not a released package.

## Verification

From the repository root:

```powershell
python scripts/quality/check_v3_numericfield_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_numericfield_contract.py' -v
python scripts/quality/check_v3_docs_contract.py
python scripts/quality/check_v3_skill_contract.py
python scripts/quality/check_v3_textfield_contract.py
python scripts/quality/check_markdown_links.py
dotnet build Bluent.sln -c Release --no-restore -warnaserror
dotnet test Bluent.sln -c Release --no-build  # final evidence: 97/97
```

The real-browser runner accepts -Mode WebAssembly|Server and -Browser Chrome|Edge. The final post-fix local matrix passed 40 assertions per cell (Chrome/Edge × WebAssembly/InteractiveServer): 160/160 total, zero runtime signals; four JSON reports are retained under docs/v3/quality/evidence/BLUENT-NUMERICFIELD-POSTFIX-*.json.

Native Windows evidence is recorded in docs/v3/quality/evidence/BLUENT-NUMERICFIELD-WINDOWS-*. High Contrast was enabled natively and then restored; Persian KLID keyboard-layout translation was tested, not physical key hardware or composition-based IME. OnFocus and OnBlur each fired exactly once during native Windows Edge InteractiveServer UIA focus transitions. Narrator UIA semantics were inspected while it ran, but spoken output was not independently recorded or heard. Do not convert those boundaries into stronger claims or WCAG certification.

## Design, review and release gates

- Six owned Penpot NumericField boards carry the ENGINEERING BASELINE marker and were accepted for #433 by the maintainer's direction on 2026-11-16; the Theme board remains DRAFT under #418. Do not consume draft #418 aliases.
- OnFocus and OnBlur are behaviorally verified by a native Windows UIA focus transition; the headless CDP probe separately checks that Blazor registers focusin/focusout handlers.
- Spoken Narrator/NVDA acceptance remains open. Native UIA inspection is not spoken-output acceptance.
- Exact-head GitHub Actions for the final PR head passed all 8 workflows and every job, including the four NumericField and four Component Lab Chrome/Edge × WebAssembly/Server cells.
- PR #563 was accepted and squash-merged into bluent-v3 on 2026-11-16; Issue #433 is Done. No stable Dev/main/v2 branch, NuGet package or deployment was changed.
- Never merge this task to Dev, main, stable/release branches or 2.x. Do not publish NuGet packages or deploy from this branch. The current 2.x Skill/reference remains the only released consumer authority.
