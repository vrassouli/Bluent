# NumericField — Bluent v3 implementation record

> **In progress — Issue #433.** This is source-backed work on `v3/issue-433-numeric-field`, targeting `bluent-v3`. It is not an accepted/released v3 API or a stable NuGet contract. The seven owned Penpot boards on page 51 remain DRAFT; design parity and native assistive-technology acceptance are not claimed.

## Identity and maturity

| Field | Value |
| --- | --- |
| Family | NumericField (`NumericField<TValue>`) |
| Package / namespace | `Bluent.UI` / `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/NumericFieldComponent/` |
| Demo | `/components/numeric-fields` (`Bluent.UI.Demo.Pages`) |
| Issue / branch | [#433](https://github.com/vrassouli/Bluent/issues/433) / `v3/issue-433-numeric-field` |
| Integration target | `bluent-v3` only; no `Dev`, `main`, 2.x or NuGet change |
| Upstream design baseline | Fluent UI Web Components Number Field; WAI-ARIA APG Spinbutton |
| Owned design | Bluent v3 Design System, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 51 `e9b4dbe1-9dd3-8094-8008-f2a6fdb3c800` |
| Design state | Seven anatomy/behavior boards exist; all remain DRAFT pending design review |

## Source/API inventory

The implementation remains a Blazor `InputBase<TValue>` field and keeps the existing direct parameter surface. It does not add a `HideStep`, `TextAlignment`, custom icon slot, or imperative step API.

| Member | Type | Default | Behavior |
| --- | --- | --- | --- |
| `TValue` | Generic numeric value | Required generic type | Supports nullable/non-nullable `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `float`, `double`, and `decimal`; other types fail fast. |
| `Value` / `ValueChanged` / `ValueExpression` | Inherited `InputBase<TValue>` | Standard Blazor binding | Form binding and EditContext validation. |
| `Min` / `Max` | `TValue?` | CLR type range when omitted | Explicit limits are inclusive; invalid ranges (`Min > Max`) and non-finite floating bounds are rejected. |
| `Step` | `TValue?` | Numeric one | Must be positive and finite. Controls ArrowUp/ArrowDown and the pointer stepper. |
| `Format` | `string?` | General (`G`) format | Uses `CultureInfo.CurrentCulture` for display. |
| `GainFocus` | `bool` | `false` | Focuses the native input after first interactive render. |
| `OnFocus` / `OnBlur` | `EventCallback` | Empty callback | Raised on focus entry / blur. |
| `ParsingErrorMessage` | `string?` | Localized default | Overrides invalid numeric text message (`{0}` = display name). |
| `MinimumErrorMessage` / `MaximumErrorMessage` | `string?` | Localized inclusive-bound messages | `{0}` = display name, `{1}` = formatted bound. Wording is “at least” / “at most”. |
| `OverflowErrorMessage` | `string?` | Localized default | Overrides target CLR range overflow / non-finite message. |
| `StartAddon` / `EndAddon` | Inherited `RenderFragment?` | `null` | Logical start/end addon slots in the shared Field shell. |
| `Size` | Inherited `FieldSize` | `Medium` | Reuses shared Field heights: Small 24px, Medium 32px, Large 40px. |
| `BindValueEvent` | Inherited `string` | `onchange` | Set to `oninput` for per-keystroke parsing/validation. |
| `Class` / `Style` / unmatched attributes | Inherited base/Blazor attributes | Standard defaults | Forwarded to the native input where applicable. `readonly`, `disabled`, `id`, autocomplete and caller ARIA/name attributes retain native HTML behavior. |

No `ChildContent` is exposed. Use `StartAddon` and `EndAddon` for composition. Labeling remains the consumer's responsibility: associate a native Bluent `Label` using the input `id` or supply an equivalent accessible name.

## Numeric editing and culture contract

- Keep an editable `input type="text"`; do not switch to `type="number"` to obtain a browser spinner.
- Preserve the live editing buffer—including sign, decimal/group separators, incomplete intermediate text, caret and selection—while the user edits. Parsing must not rewrite that buffer.
- Normalize Unicode decimal digits from Latin, Persian and Arabic scripts to numeric values. Normalize culture-specific signs and bidi formatting marks deliberately. U+066B/U+066C and pasted non-breaking grouping spaces are interpreted using the active number culture.
- The ASCII `.` is treated as a decimal point when it is not the current culture's group separator. If `.` is the locale group separator (for example, common German grouping), it retains grouping meaning.
- Parsing and formatting use the same `CultureInfo.CurrentCulture` policy. After a valid commit the displayed value is formatted with `Format` and the culture's native digit mapping; while typing, the raw buffer is retained.
- Empty text maps to `null` only for nullable `TValue`; it is a validation error for non-nullable numeric types. Invalid intermediate text, overflow and non-finite `float`/`double` values are reported distinctly.
- Inclusive Min/Max violations stay visible and invalid; typed values are never silently clamped. The raw text remains visible after blur until corrected or cleared.

## Step and keyboard contract

| Input | Behavior |
| --- | --- |
| `ArrowUp` | Increase by `Step`. |
| `ArrowDown` | Decrease by `Step`. |
| `Home` | Move to explicitly configured `Min`; no action without explicit Min. |
| `End` | Move to explicitly configured `Max`; no action without explicit Max. |
| Normal text-editing keys | Retain browser behavior; the NumericField listener only intercepts the four documented commands. |
| Pointer step-up / step-down | Native named buttons, omitted from the Tab sequence, prevent pointer focus theft and leave editing focus on the input. |

An empty input starts from zero unless an explicit bound defines the corresponding start edge. Step candidates are clamped to effective numeric bounds; an out-of-range value can be stepped toward its allowed range but not further away. Incomplete/invalid text is not replaced by a step action. Decimal stepping uses decimal arithmetic to avoid accumulated binary-fraction drift.

## DOM, accessibility and direction

- The numeric input remains `dir="ltr"` and physically left aligned even inside an RTL form. The surrounding Field, label, messages and logical addons follow the host direction.
- `inputmode="text"` is deliberate: restrictive numeric virtual keyboards may omit the minus key needed for signed values.
- The input uses `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-invalid` kept in sync with the parsed current value, effective type bounds and EditContext state. `aria-valuenow` is omitted for empty, invalid or out-of-range text rather than announcing a stale model value.
- Pointer controls have localized accessible names in English, Persian (`fa-IR`) and Arabic (`ar-EG`); they are not sequential keyboard stops. The associated Label remains the accessible name for the input.
- The component consumes shared Field sizing and underline focus styling. Its own CSS only handles the stepper, invalid presentation, forced-colors fallback and reduced-motion behavior; it introduces no `component.numericField.*` token family and does not consume draft aliases from #418.

## Verified example

The focused component showcase is at `src/Bluent.UI.Demo.Pages/Pages/Components/NumericFields.razor`, route `/components/numeric-fields`. It covers integer and decimal binding, Min/Max/Step, `oninput`, Small/Medium/Large, readonly/disabled and RTL host composition.

```razor
@using Bluent.UI.Components
@using Microsoft.AspNetCore.Components.Forms

<EditForm Model="Model">
    <Label Text="Amount" for="amount" />
    <NumericField TValue="decimal"
                  @bind-Value="Model.Amount"
                  id="amount"
                  Min="0m" Max="100m" Step="0.25m"
                  Format="N2" BindValueEvent="oninput" />
    <ValidationMessage For="() => Model.Amount" />
</EditForm>
```

The `NumericFields` showcase compiles in Release. This sample is a task-branch source/build example only, not an install instruction for released packages.

## Implementation and assets

- `NumericField.razor` / `.razor.cs`: Blazor markup, `InputBase<TValue>` conversion, range validation, keyboard bridge and lifecycle disposal.
- `NumericFieldValuePipeline.cs`: numeric parsing, formatting, Unicode digit handling, overflow classification and stepping.
- `wwwroot/bluent.ui.numeric-field.js`: input-scoped keyboard listener; removed and disposed with the component.
- `Styles/Components/_numeric-field.scss`: shared Field composition, stepper, forced-colors and reduced-motion styles; imported by the component stylesheet entry.
- `Resources/NumericFieldResources*.resx`: English, Persian and Arabic strings.

No manual global script tag is required; the ES module is dynamically imported from the package static-web-assets path. Standard Bluent theme/component styles are still required by the host.

## Validation ledger (2026-11-16)

| Scope | Evidence | Result |
| --- | --- | --- |
| Numeric value pipeline | 23 focused tests: culture parsing, Unicode digits/signs, empty/invalid/overflow, formatting and Step boundaries | **23/23 pass** |
| NumericField pipeline unit tests | `NumericFieldValuePipelineTests` in the existing test project | **23/23 pass** |
| Full Solution Release build | `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror` | **0 warnings / 0 errors** |
| Full Solution tests | `dotnet test Bluent.sln --configuration Release --no-build` | **93/93 pass** |
| Real browser / render-mode | Chrome/Edge × WebAssembly/InteractiveServer; base behavior probe, 16 checks per run | **64/64 pass** (four browser/render-mode runs) |
| Extended real-browser interaction probe | Clipboard paste + model commit, mid-string caret restoration, composition-key guard, forced-colors media emulation and idempotent JS listener disposal; 21 checks per run | **84/84 pass** (four browser/render-mode runs) |
| Native OS contrast / screen reader | Browser forced-colors media emulation is verified; Windows Contrast Themes and spoken Narrator/NVDA acceptance | Not yet run for NumericField |
| Penpot design parity | Owned file revision 819, page 51; one bidi board and page marked IMPLEMENTATION BASELINE, six design boards remain DRAFT | API/RTL decisions reconciled; visual sign-off outstanding |

The original 64/64 browser checks cover input binding, negative/decimal entry, Step, ArrowUp/ArrowDown, Home/End, inclusive bounds and recovery, RTL direction/alignment, static-web-assets delivery, readonly/disabled and focus retention. The additional 84/84 checks exercise actual clipboard paste through model commit, mid-string caret retention after a Blazor rerender, the synthetic composition-key guard, forced-colors CSS under browser media emulation, and idempotent disposal of the input-scoped JS listener. The .NET pipeline tests cover en-US, de-DE, fa-IR, ar-EG, mixed Latin/Persian/Arabic digits and formatting. Still outstanding: a live browser culture-switch matrix, physical OS IME/keyboard composition, native Windows Contrast Themes, spoken assistive-technology acceptance, and a component-level unmount/re-render listener lifecycle test. Do not generalize synthetic/browser emulation into native OS or screen-reader acceptance. The `#418` token foundation remains separately in Review and is not marked complete by this component work.

## 2.x migration impact

The existing public parameter and inherited binding names are retained. The v3 task branch adds observable native markup/interaction semantics (`role="spinbutton"`, ARIA range/value state, pointer stepper and Arrow/Home/End behavior), corrects destructive input normalization, makes culture parsing/formatting coherent, and makes the existing `Step` parameter operative. DOM consumers that assumed no stepper descendants or no spinbutton role must recheck selectors/AX behavior. No stable v2 assets/packages are changed. Full migration guidance remains proposed until #433 is accepted.

## Acceptance and remaining gates

- [ ] Accept the seven owned Penpot boards and record reviewed variant/node IDs and parity.
- [x] Run the focused Chrome and Edge × WebAssembly and published InteractiveServer interaction checks: 64/64 assertions across the four modes.
- [x] Extend real-browser coverage for clipboard paste through model commit and caret preservation after mid-string editing; pass: 84/84 across Chrome/Edge × WebAssembly/InteractiveServer.
- [x] Verify the production static-web-assets module is served (HTTP 200) and the interactive listener initializes in WebAssembly and InteractiveServer.
- [x] Verify the JS listener disposal handle is idempotent and stops later callbacks (all four browser/render-mode cells).
- [ ] Add a component-level re-render/unmount test proving the component actually calls disposal during teardown.
- [ ] Run the full live browser locale matrix (en-US, de-DE, fa-IR, ar-EG and mixed digit/separator inputs) in Chrome and Edge.
- [ ] Verify physical Windows Persian keyboard/OS IME composition and caret behavior.
- [ ] Perform native Windows Contrast Themes and spoken named assistive-technology review; record the exact AT actually used. Browser forced-colors emulation is not this native test.
- [x] Run full Release solution build/tests: 0 warnings / 0 errors; 93/93 tests.
- [x] Run docs/skills contracts and repository Markdown link validation: docs 0 findings, Skills 0 errors, 176 Markdown files checked.
- [ ] Confirm all exact-head GitHub Actions complete successfully for the final pushed commit.
- [ ] Obtain independent review and merge the PR to `bluent-v3`; only then can #433 move Review → Done.
