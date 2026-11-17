# Checkbox — Bluent v3 implementation record

> **In progress on `v3/issue-434-checkbox`; unreleased and not merged.** The maintainer delegated the #434-specific design decisions on 2026-11-17. The owned Penpot pages are marked DESIGN DECIDED for this task. This does not approve the global #418 token vocabulary, native operating-system accessibility, a stable API, or a NuGet release.

## Identity and maturity

| Field | Value |
| --- | --- |
| Family | `Checkbox<TValue>` |
| Package / namespace | `Bluent.UI` / `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/CheckBoxComponent/` |
| Styles | `src/Bluent.UI/Styles/Components/_checkbox.scss` |
| JavaScript module | `wwwroot/bluent.ui.checkbox.js` |
| WebAssembly demo | `/components/checkboxes` (`Bluent.UI.Demo.Pages`) |
| Interactive Server host | `/compatibility/checkboxes-server` (`Bluent.UI.Demo.SSR`, task probe host) |
| Issue / branch | [#434](https://github.com/vrassouli/Bluent/issues/434) / `v3/issue-434-checkbox` |
| Integration target | `bluent-v3` only; no `Dev`, `main`, 2.x or NuGet change |
| Fluent baseline | Fluent 2 Checkbox: 30 combinations (five interaction states × three values × two shapes); six Bluent Error extensions |
| Owned design | Bluent v3 Design System, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`; page 56 board `f3112be3-b384-8075-8008-f4b5a4197ea2`, page 57 board `f3112be3-b384-8075-8008-f4b6865303c5` |
| Design disposition | Issue-specific design direction delegated and recorded on 2026-11-17; global #418 approval remains separate |

## Source and public API inventory

The component remains `InputBase<TValue>` based and accepts only `bool` or `bool?`. Construction with any other generic type throws `InvalidOperationException`. No new public parameter, enum, child-content slot, or custom state-cycle contract is introduced.

### Direct parameters

| Member | Type | Default | Behavior |
| --- | --- | --- | --- |
| `Label` | `string?` | `null` | Visible label for checked state and fallback for other values |
| `UncheckedLabel` | `string?` | `null` | Replaces `Label` when the value is `false` |
| `IndeterminateLabel` | `string?` | `null` | Replaces `Label` when a nullable value is `null` |
| `Required` | `string?` | `null` | Decorative marker text only. It does not itself set native `required` or a validation rule |
| `Circular` | `bool` | `false` | Uses the circular indicator shape |
| `Size` | `CheckboxSize` | `Medium` | `Medium` or `Large` |
| `LabelPosition` | `LabelPosition` | `After` | `After` or `Before`; layout uses logical inline direction |

### Inherited and framework contract

| Member | Source | Behavior |
| --- | --- | --- |
| `Value`, `ValueChanged`, `ValueExpression` | `InputBase<TValue>` | Supports `@bind-Value` and Blazor forms |
| `EditContext`, `FieldIdentifier`, validation state | `InputBase<TValue>` | Validation messages add native `aria-invalid="true"` and the Bluent Error extension state |
| `Class`, `Style` | `BluentInputComponentBase<TValue>` | Applied to the component wrapper |
| Unmatched attributes | `InputBase<TValue>` | Applied to the native `input`; includes `id`, `name`, `disabled`, native `required`, `aria-label`, `aria-labelledby`, `aria-describedby`, `accesskey`, and data attributes |
| `Toggle()` | Public component method | Sets the value through `CurrentValue`; a nullable `null` value becomes `true`, and disabled inputs do not toggle |

`CheckboxSize` and the shared `LabelPosition` enum are unchanged. The component has no child-content slot and no dedicated public event beyond the inherited `ValueChanged` binding contract.

## State and interaction contract

### Fluent 2 core matrix

The 30 Fluent combinations are:

- Rest, Hover, Pressed, Focus-visible and Disabled;
- Unchecked, Checked and Mixed;
- Standard and Circular shape.

Bluent adds six Error combinations (Error × three values × two shapes). Error is a validation extension, not a sixth Fluent interaction state.

The native `input[type=checkbox]` is the only semantic and interactive element. The visual indicator and SVG paths are decorative and `aria-hidden`. The indicator is not a second button or checkbox.

### Nullable Mixed behavior

For `Checkbox<bool?>`, `null` sets the browser-native `HTMLInputElement.indeterminate` property after render. The component does not author `aria-checked` or a custom checkbox role. Native browser checkbox activation owns the transition:

`null (Mixed) → true (Checked) → false (Unchecked)`

There is no user gesture that cycles back to `null`; application code sets the bound value to `null` when the selection becomes mixed again. A browser accessibility tree and named screen reader must still be checked separately; a DOM property read alone is not spoken-output certification.

### Required marker and accessible name

`Required` remains decoration, not validation. When a visible label and marker are supplied, the native input uses `aria-labelledby` to reference a text-only span inside the associated `<label>`. The marker remains inside the clickable label and has `aria-hidden="true"`, so it does not enter the input's accessible name. A caller-provided non-empty `aria-label` or `aria-labelledby` takes precedence. Actual required validation uses native `required` or Blazor validation independently.

### Focus, pointer and disabled behavior

- A visible 2px focus-visible ring is required.
- Rest, Hover and Pressed are distinct CSS states for Unchecked, Checked and Mixed.
- Disabled is represented by the native `disabled` attribute; it is not focusable and does not toggle.
- The native input overlays the indicator as the hit target. The implementation targets at least 24×24 CSS pixels where practical.
- Forced-colors and reduced-motion media rules are present in the component stylesheet. Browser media emulation is not native Windows Contrast Themes certification.

## Styling and tokens

The component uses only existing theme roles already emitted by the current ten-brand Light/Dark theme bundles: neutral foreground/background/stroke, compound-brand background/stroke, disabled roles, focus stroke and StatusDanger border. This task introduces no global token, alias, theme default, typography contract, or public CSS variable. Draft #418 aliases are not consumed.

The source is `_checkbox.scss`; the normal `components.scss` pipeline generates `components.css` and the packaged minified stylesheet. Do not edit the generated outputs independently of the Sass source.

## Responsive and RTL behavior

`LabelPosition` is implemented through `flex-direction` and logical inset/spacing properties rather than physical left/right rules. The demo includes a Persian label in a real `dir="rtl"` container. Long labels wrap without overlaying the input. A local Chrome/InteractiveServer check at a 320 CSS-pixel viewport found no horizontal overflow. Higher zoom, more locales, mobile touch hardware and additional browser engines remain separate evidence.

## Verified demo scenarios

The shared `/components/checkboxes` page covers Boolean binding, state-specific label fallback, unnamed-visible-label usage with caller `aria-label`, programmatic Mixed reset, Standard/Circular and Medium/Large, Disabled Unchecked/Checked/Mixed, LabelPosition.Before, long wrapping text, decorative Required marker, EditForm/DataAnnotations validation, and Persian RTL.

The task-only `/compatibility/checkboxes-server` host reuses that same shared page in an actual InteractiveServer circuit and exposes small DOM probes for `input.indeterminate`, computed native name, marker attributes, `aria-invalid`, and disabled/required state. It is QA instrumentation, not a second consumer API or a stable product route.

## Evidence ledger

| Claim | Command or observation | Environment | Result |
| --- | --- | --- | --- |
| Library compiles | `dotnet build src/Bluent.UI/Bluent.UI.csproj -c Release --no-restore -warnaserror -m:1` | macOS ARM64, .NET 10 | Pass, 0 warnings / 0 errors |
| Component render tests | `dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj -c Release --no-restore -p:NuGetAudit=false -m:1` | macOS ARM64, .NET 10 | Pass, 112/112 |
| Demo + SSR host compile | `dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj -c Release --no-restore -warnaserror -m:1` | macOS ARM64, .NET 10 | Pass, 0 warnings / 0 errors |
| Sass bundle | `npm ci --no-audit --ignore-scripts --prefer-offline` and `npm run build:scss` in `src/Bluent.UI` | Node 24 / Dart Sass | Pass; existing repository-wide Sass deprecation notices remain |
| Native Mixed property | Live `Inspect native Mixed state` probe reads `checked=false; indeterminate=true`; after activation `checked=true; indeterminate=false` | Chrome / InteractiveServer | Pass |
| Activation and model cycle | Real checkbox activation and Space key: Mixed → Checked → Unchecked | Chrome / InteractiveServer | Pass |
| Required accessible name | Browser accessibility snapshot reports `I accept the terms and conditions`; DOM probe confirms `aria-labelledby=checkbox-terms-label`, marker `aria-hidden=true` | Chrome / InteractiveServer | Pass |
| Validation | Submit invalid EditForm; message appears and native input probe reads `aria-invalid=true` | Chrome / InteractiveServer | Pass |
| Narrow reflow | No visible DOM element extends beyond the 320 CSS-pixel viewport | Chrome / InteractiveServer, 320px | Pass |

## 2026-11-17 Dev01 revalidation

The local four-cell Chrome/Edge × WebAssembly/InteractiveServer matrix now passes **22/22 assertions per cell (88/88 total)**. Every cell verifies native Mixed and computed AX state, native click/Space model transitions, Required accessible-name isolation, native Disabled states, EditForm validation/`aria-invalid`, focus-visible, hover and pressed styling, forced-colors/reduced-motion behavior, RTL inheritance and 320px no-overflow. Four JSON reports and eight PNG screenshots are retained under `docs/v3/quality/evidence/BLUENT-CHECKBOX-*`.

The optional Blazor browser-tools hot-reload settings request (`/_framework/dotnet-browser-tools/hot-reload-settings.json`) returns 404 in the two WebAssembly sessions and is recorded as informational tooling traffic only. All other application HTTP failures, console errors and browser exceptions remain fatal; none occurred. Both WebAssembly and InteractiveServer cells pass. Browser media emulation does not certify native Windows Contrast Themes, and Chromium AX snapshots do not certify spoken screen-reader output. Exact-head hosted GitHub Actions, native OS contrast and named AT acceptance remain open. Native Safari.app/VoiceOver, Windows Contrast Themes/Narrator, spoken assistive-technology output, and physical touch hardware are not claimed. Do not infer WCAG certification from source inspection or browser snapshots.

## 2.x → v3 compatibility

| Surface | Classification | Consumer impact |
| --- | --- | --- |
| Direct parameters, enums, `bool`/`bool?` binding and `InputBase<TValue>` contract | Unchanged | Existing source usage remains valid |
| Native input ID | Additive DOM | A generated ID is now always applied when the consumer does not supply one, allowing a stable label association |
| `Required` marker markup | Additive DOM/accessibility correction | Marker stays in the clickable label but is `aria-hidden`; with a visible label the native input references the text-only span through `aria-labelledby`, so `*` is not part of the accessible name |
| Nullable Mixed | Additive native behavior | A component JS module synchronizes `input.indeterminate`; browser accessibility state can now differ from the previous purely visual state |
| Hover/Pressed/Focus-visible/Disabled/Error styling | Visual correction | Additional state selectors in the component stylesheet; no new public styling API |
| Validation | Additive native semantics | Blazor field errors set `aria-invalid="true"` on the native checkbox |
| Assets | Additive static asset | Adds the packaged `bluent.ui.checkbox.js` ES module; no manual script tag is required |

No released 2.x package, `Dev`, or stable branch is modified by this v3 task. Rollback is the normal v3 branch revert; no database or server migration is involved.

## Acceptance and change log

- [x] Maintainer-delegated Checkbox design decision recorded in issue #434 on 2026-11-17.
- [x] Owned Penpot pages 56 and 57 renamed DESIGN DECIDED for this component-specific direction; global #418 approval remains separate.
- [x] Native `input.indeterminate`, Required-name isolation, focus/pressed/hover/disabled/error and RTL decisions implemented in the isolated branch.
- [x] .NET render contract tests and task demo/InteractiveServer host added.
- [x] Local Dev01 four-cell Chrome/Edge × WebAssembly/InteractiveServer browser matrix: 22/22 per cell (88/88 total); four JSON reports and eight PNG screenshots retained.
- [ ] Hosted exact-head GitHub Actions on the review PR.
- [ ] Final maintainer review, project status transition, merge to `bluent-v3`, and component-family acceptance.
- [ ] Native operating-system contrast and named assistive-technology acceptance remain follow-up gates; spoken output is not claimed.

## Source and related records

- Existing released 2.x API: [Checkbox consumer reference](../../components/checkbox.md).
- Fluent/Blunt v3 design decision: Bluent v3 Design System Penpot pages 56–57; exact board IDs listed above.
- Parent epic: [#416](https://github.com/vrassouli/Bluent/issues/416).
- Component issue: [#434](https://github.com/vrassouli/Bluent/issues/434).
- Foundation dependency: [#418](https://github.com/vrassouli/Bluent/issues/418).
- Coverage and Component Lab platform: [#421](https://github.com/vrassouli/Bluent/issues/421).

This page documents the in-progress v3 task branch only. It is not installation guidance for released NuGet packages.
