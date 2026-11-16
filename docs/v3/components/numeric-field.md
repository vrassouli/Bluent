# NumericField — Bluent v3 implementation record

> **Implementation and QA complete on the task branch; Issue #433 remains In progress pending owner design sign-off and independent PR review.** This work targets `bluent-v3` only. It is not an accepted/released v3 API or a stable NuGet contract. The seven Penpot boards remain DRAFT; visual approval and spoken assistive-technology acceptance are not claimed.

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
| Design state | Seven anatomy/behavior boards exist; all remain DRAFT pending owner/design sign-off; the Theme board also depends on #418 token approval |

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

The focused component showcase is at `src/Bluent.UI.Demo.Pages/Pages/Components/NumericFields.razor`, route `/components/numeric-fields`. It covers integer and decimal binding, Min/Max/Step, `oninput`, Small/Medium/Large, readonly/disabled and RTL host composition. Two `data-bui-qa-*` attributes on the signed-value demo instance expose the effective culture/native-digit metadata to the browser test; these are ordinary unmatched HTML attributes on that demo instance, not new public NumericField parameters.

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
| Consolidated real browser / render-mode | Chrome/Edge × WebAssembly/InteractiveServer; signed/decimal edits, stepping, inclusive bounds/recovery, clipboard paste/model commit, mid-string caret after rerender, mixed-script culture matrix (en-US/de-DE/fa-IR/ar-EG), forced-colors behavior, validation overrides, Addon/Class/Style, GainFocus, focusin/focusout registration and actual component unmount/disposal | **156/156 pass** (39 assertions per browser/render-mode cell) |
| Native Windows callback behavior | Live Edge InteractiveServer; Windows UIA focus moved from NumericField A to NumericField B and parent counters were read after each transition | **OnFocus and OnBlur each invoked exactly once**; screenshot + JSON retained |
| Native Windows acceptance | High Contrast White, Persian keyboard-layout event/caret and Narrator UIA semantics | **Contrast and UIA pass; physical IME and spoken AT acceptance remain open** |
| Native Windows Contrast | Windows 11 Pro High Contrast White was actually enabled (HighContrast flags 127); Edge reported forced-colors active; focused, disabled, invalid and RTL states were inspected on the live InteractiveServer demo | **Pass; screenshot + JSON retained** |
| Native Windows Persian layout | KLID 00000429 on the Edge UI thread; A → U+0634; caret at position 6; LTR/left alignment unchanged | **Pass for OS layout event; no physical keyboard or composition IME claim** |
| Native Windows focus callbacks | Live InteractiveServer page: Windows UIA moved focus from numeric-addons to numeric-price; demo counters moved 0/0 → 1/0 → 1/1 | **Pass; screenshot + JSON retained** |
| Narrator / Windows UIA | Narrator running while native UIA exposed the labeled spinbutton, value/range, invalid state and validation message | **UIA checked; spoken output not recorded/listened to** |
| Penpot design parity | Owned file, page 51; all seven NumericField boards exported and visually inspected against implementation | **Owner sign-off outstanding; #418 theme-token gate remains open** |

The latest consolidated live-browser matrix passes 39 assertions in each of Chrome/WASM, Edge/WASM, Chrome/InteractiveServer and Edge/InteractiveServer (156/156 total). It exercises input binding, signed/decimal edits, Step and keyboard stepping, inclusive bounds and recovery, RTL direction/alignment, static assets, readonly/disabled, native clipboard paste/model commit, mid-string caret after rerender, mixed-script/grouped parsing and committed formatting for en-US/de-DE/fa-IR/ar-EG, forced-colors behavior, the custom parsing/minimum/maximum/overflow validation messages and recovery, StartAddon/EndAddon, inherited Class/Style, GainFocus, Blazor focusin/focusout registration, and actual component conditional-unmount/disposal. Native Windows UIA separately confirms OnFocus and OnBlur each invoke once on actual focus transitions. Native Windows evidence is retained in `../quality/evidence/BLUENT-NUMERICFIELD-WINDOWS-HIGH-CONTRAST.json`, `BLUENT-NUMERICFIELD-WINDOWS-HIGH-CONTRAST.png`, `BLUENT-NUMERICFIELD-WINDOWS-PERSIAN-KEYBOARD.json`, `BLUENT-NUMERICFIELD-WINDOWS-FOCUS-CALLBACKS.json/.png` and `BLUENT-NUMERICFIELD-WINDOWS-NARRATOR-UIA.json`. The Persian check uses an OS keyboard-layout key event, not a physically pressed hardware key or a composition-based IME. OnFocus and OnBlur each fired once during real Windows UIA focus transitions. Narrator was running and UIA-visible semantics were checked, but spoken output is not yet recorded or independently heard. Remaining: spoken Narrator/NVDA acceptance, owner approval of the seven Penpot boards (the Theme board waits for #418 token approval), and independent PR review. Do not generalize browser emulation or UIA inspection into spoken screen-reader acceptance. The `#418` token foundation remains open and unapproved; this component work does not mark it complete or consume its draft aliases.

## 2.x migration impact

The existing public parameter and inherited binding names are retained. The v3 task branch adds observable native markup/interaction semantics (`role="spinbutton"`, ARIA range/value state, pointer stepper and Arrow/Home/End behavior), corrects destructive input normalization, makes culture parsing/formatting coherent, and makes the existing `Step` parameter operative. DOM consumers that assumed no stepper descendants or no spinbutton role must recheck selectors/AX behavior. No stable v2 assets/packages are changed. Full migration guidance remains proposed until #433 is accepted.

## Native Windows acceptance evidence

The Windows-specific evidence JSON and PNG files under `../quality/evidence/` are captured from the published InteractiveServer demo. High Contrast White was enabled through the Windows accessibility setting (HighContrast flags 127), and Edge confirmed `matchMedia('(forced-colors: active)') === true`. The invalid quantity 150 remained visible, `aria-invalid=true` was exposed, `aria-valuenow` was omitted, and the inclusive-bound message stayed visible. Focus colors used the system Highlight color; disabled text/border used GrayText; the RTL form still hosted an LTR/left-aligned spinbutton. The Persian layout test loaded Windows KLID 00000429 on the Edge UI thread and verified A → U+0634 with a caret at the end of the input. The native UIA focus transition on numeric-addons invoked OnFocus once; moving focus to numeric-price invoked OnBlur once. This is separate from the headless probe, which checks that Blazor registers focusin/focusout handlers. Narrator was running while the UIA tree was inspected; this is not evidence of the spoken announcement. These tests do not claim physical keyboard input, IME composition or accessibility certification.

## Acceptance and remaining gates

- [ ] Accept the seven owned Penpot boards and record reviewed variant/node IDs and parity. The Theme board is expressly dependent on #418 token approval.
- [x] Run the focused Chrome and Edge × WebAssembly and published InteractiveServer interaction checks: 64/64 assertions across the four modes.
- [x] Extend real-browser coverage for clipboard paste through model commit and caret preservation after mid-string editing: 84/84 across Chrome/Edge × WebAssembly/InteractiveServer.
- [x] Verify the production static-web-assets module is served (HTTP 200) and the interactive listener initializes in WebAssembly and InteractiveServer.
- [x] Verify the JS listener disposal handle is idempotent and stops later callbacks (all four browser/render-mode cells).
- [x] Add a component-level unmount test proving actual Blazor teardown removes its keyboard listener (Chrome/Edge × WebAssembly/InteractiveServer).
- [x] Run the live browser culture matrix (en-US, de-DE, fa-IR, ar-EG; mixed digit/separator input and committed formatting) in Chrome and Edge across both render modes: 124/124 assertions.
- [x] Run full Release solution build/tests: 0 warnings / 0 errors; 93/93 tests.
- [x] Run docs/skills contracts and repository Markdown link validation: docs 0 findings, Skills 0 errors, 176 Markdown files checked.
- [x] Verify Native Windows High Contrast White on Windows 11 Pro with native forced-colors active, including focus, disabled, invalid and RTL states; screenshot and JSON evidence retained.
- [x] Verify Persian Windows keyboard-layout translation and caret placement on the live field (U+0634 at caret 6); this is not a physical keyboard/IME composition test.
- [x] Inspect NumericField native Windows UIA semantics while Narrator is running: name, role, value/range, invalid state and validation message.
- [x] Verify OnFocus and OnBlur callbacks in native Windows Edge InteractiveServer by moving UIA focus between two NumericField inputs; both counters increment exactly once.
- [x] Run the consolidated four-cell browser matrix after adding the missing public-parameter demo coverage: 156/156 assertions.
- [ ] Obtain spoken Narrator/NVDA acceptance; no spoken output has been independently recorded or heard.
- [ ] Confirm all exact-head GitHub Actions complete successfully for the final pushed commit.
- [ ] Obtain independent review and merge the PR to `bluent-v3`; only then can #433 move Review → Done.
