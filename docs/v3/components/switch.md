# Switch — Bluent v3 implementation record

> **Not a released v3 API. In Review via [PR #565](https://github.com/vrassouli/Bluent/pull/565) from `v3/issue-435-switch`; unreleased and not merged.** This record describes the v3 task-branch API only. The released 2.x API and its `UncheckedLabel`/Checkbox inheritance remain documented in [the 2.x Switch reference](../../components/switch.md). This task does not approve or complete the global #418 token foundation.

## Identity and maturity

| Field | Value |
| --- | --- |
| Family | `Switch` (binary `bool`) |
| Package / namespace | `Bluent.UI` / `Bluent.UI.Components` |
| Source | `src/Bluent.UI/Components/SwitchComponent/` |
| Styles | `src/Bluent.UI/Styles/Components/_switch.scss` |
| WebAssembly showcase | `/components/switches` |
| Interactive Server QA host | `/compatibility/switches-server` |
| Issue / branch | [#435](https://github.com/vrassouli/Bluent/issues/435) / `v3/issue-435-switch` |
| Integration target | `bluent-v3` only; no stable `Dev`, `main`, 2.x or NuGet change |
| Primary Fluent reference | Fluent UI Web Components Switch (`@fluentui/web-components` 3.2.1 as inspected 2026-11-18) |
| Supplemental reference | Fluent UI React v9 Switch (`@fluentui/react-switch` 9.7.7 as inspected 2026-11-18); only for differences not present in Web Components |
| Owned design | Bluent v3 Design System, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 58 `06b2261f-bfb4-808c-8008-f689e0ff1a1b` |
| Design boards | 40-case matrix `06b2261f-bfb4-808c-8008-f689e11abe56`; anatomy/contract `06b2261f-bfb4-808c-8008-f68a6da3e29d`; Medium-first size board `b5e126d7-572c-8063-8008-f691ea3d12ec` |
| Latest named sizing version | `Bluent v3 · Switch Medium-first design decision · 2026-11-18`, revision 867 |

The design direction was delegated to be selected using Fluent principles. The boards and selected geometry are a source-owned design proposal and engineering decision record; they are not represented as a completed independent visual-design sign-off or native OS/AT acceptance.

## Source and public API inventory

`Switch` is implemented directly on `BluentInputComponentBase<bool>`, not by inheriting `Checkbox<bool>`. This preserves the framework `InputBase<bool>` binding/validation pipeline without leaking Checkbox-only state and presentation parameters into the Switch contract.

### Direct parameters

| Member | Type | Default | Behavior |
| --- | --- | --- | --- |
| `Value` / `ValueChanged` / `ValueExpression` | inherited `InputBase<bool>` | standard Blazor defaults | Controlled/uncontrolled Boolean binding through `@bind-Value`; no `bool?` or indeterminate state |
| `Label` | `string?` | `null` | Stable setting name. It must not change between On and Off |
| `Required` | `string?` | `null` | Visible marker text only; it does not set native `required` or create a validation rule |
| `LabelPosition` | `SwitchLabelPosition` | `After` | `After`, `Before`, or `Above` |
| `Class` / `Style` | inherited from `BluentInputComponentBase<bool>` | `null` | Applied to the component wrapper |
| Unmatched attributes | inherited `InputBase<bool>` | none | Passed to the native input after Switch-owned semantic attributes are normalized |

`SwitchLabelPosition` is a Switch-specific enum with `After`, `Before`, and `Above`. The initial v3 API intentionally has no `Size` parameter: the primary Fluent Web Components reference has one fixed Medium geometry. The React v9 Small variant is recorded as a deferred reference only; do not add a public size enum solely to mirror another framework's separate API.

The following are intentionally **not** part of the v3 Switch API: `UncheckedLabel`, `IndeterminateLabel`, `Circular`, `CheckboxSize`/`Size`, `Toggle()` and a child-content slot. A Switch is binary and names a setting; it does not announce “Enabled” or “Disabled” by replacing its name.

### Inherited framework contract

| Member | Source | Behavior |
| --- | --- | --- |
| `Value`, `ValueChanged`, `ValueExpression` | `InputBase<bool>` | Standard Blazor binding contract |
| `EditContext`, `FieldIdentifier`, validation state | `InputBase<bool>` | Field-level validation messages are reflected as native `aria-invalid="true"` |
| `Class`, `Style`, generated `Id`, `AdditionalAttributes` | `BluentInputComponentBase<bool>` / `InputBase<bool>` | Wrapper styling, stable native input identity and normal unmatched attributes |

The component requires either a non-empty visible `Label` or a caller-supplied non-empty `aria-label` / `aria-labelledby`. A missing accessible name is rejected during parameter setting rather than silently emitting an unnamed switch.

## Semantics and interaction contract

### Native input and state

The only interactive element is `<input type="checkbox" role="switch">`. The input's native `checked` property is the authoritative On/Off state exposed through the switch role. Do not author `aria-checked` alongside the native checkbox; do not let a caller-supplied conflicting `role`, `aria-checked`, `type`, `checked`, `value`, `name`, `onchange` or `id` create duplicate or competing semantics. Unrelated consumer `aria-*`, `data-*`, `disabled`, and `required` attributes remain supported.

The native input is the only focusable/interactive target. The track, thumb and visible label are presentation/association; the track is not a second button. Native checkbox keyboard activation is retained, especially Space. No custom Enter handler is added: Enter is optional in the APG pattern, not a required behavior for this native input implementation.

### Stable accessible name and label positions

Use a concise setting-oriented noun phrase, for example `Notifications`, `Automatic updates`, or `Right-to-left layout`. The label must remain unchanged when the bound value toggles. `After`, `Before`, and `Above` move only the visible label; they do not change the accessible name, checked state, or key behavior. When no visible label is supplied, a meaningful caller `aria-label` or `aria-labelledby` is mandatory.

### Required and validation

`Required` renders a decorative marker inside the associated visible label and the marker has `aria-hidden="true"`. Actual required validation is independent: use the native unmatched `required` attribute or the consuming `EditContext` validators/DataAnnotations. Field validation messages cause the component to add `aria-invalid="true"`; the component does not infer a business rule from the decorative marker.

### Disabled

`disabled` remains a native Boolean attribute. Disabled switches are not focusable, do not toggle, and do not receive active Hover/Pressed interaction styling. Both On and Off have explicit disabled visual treatments.

## Sizing and visual contract

The first v3 public contract uses the primary Web Components Medium geometry:

- Track: **40 × 20 CSS px**.
- Thumb: **14 × 14 CSS px**.
- Label typography: existing Base300 roles.
- Interactive input target: at least **24 × 24 CSS px**, independent of the visual track.

Fluent React v9 exposes a separate Small (32 × 16 track / 14 px thumb / Base200 label) and a Medium with an 18 px thumb. These are not the same Web Components geometry. Small is deferred pending a demonstrated consumer density requirement; the initial Bluent API has no `Size` member.

## Styling, tokens and foundation boundary

The component uses only existing shipped Bluent CSS roles:

- On: `--colorCompoundBrandBackground`, `--colorCompoundBrandBackgroundHover`, `--colorCompoundBrandBackgroundPressed`.
- Off: `--colorNeutralBackground1`, `--colorNeutralBackground3`, `--colorNeutralBackground3Pressed` and the accessible neutral stroke Rest/Hover/Pressed roles.
- Disabled: `--colorNeutralBackgroundDisabled`, `--colorNeutralStrokeDisabled`, `--colorNeutralForegroundDisabled`.
- Focus: `--colorStrokeFocus2`.
- Shared dimensions/typography/motion: `--strokeWidthThin`, `--borderRadiusCircular`, existing spacing, Base300 typography, `--durationNormal`, and `--curveEasyEase`.

RTL uses logical inline direction/spacing and the thumb moves on the logical inline axis. A keyboard-visible focus treatment uses a 2px outline with 2px offset. The component stylesheet also contains forced-colors system palette overrides and a reduced-motion rule that removes thumb transition.

### Scoped #418 exception (not a foundation approval)

This implementation follows the same narrow task-local pattern used by TextField #432 / PR #562 and NumericField #433 / PR #563. It may consume the existing shipped CSS roles above, but it must not consume preview-only #418 aliases, add global tokens/theme roles, or introduce the unfinished public Focus/Portal/Dialog APIs. #418 remains independently owned and In progress; this issue does not move or complete it.

## Compiled CLR API inventory migration (#494)

The canonical compiled API snapshot `docs/v3/inventory/public-component-contracts.json` records this issue's reviewed v3 API migration. The candidate was first written to a temporary path and compared structurally with the previous snapshot. The exact allowed delta is the Switch entry only: base type `BluentInputComponentBase<bool>` and direct `Label`, `LabelPosition: SwitchLabelPosition`, and `Required` parameters. All 140 exported CLR type records remain; all 8 shared Bluent-owned base declarations, other component records, constructors/methods/events and Scope remain byte-semantically unchanged. The total declared component property count changes from 779 to 783.

This is intentional for the still-unreleased v3 branch and is migration-recorded in [M23](../design/MIGRATION-IMPACT-LEDGER.md). It does not change the stable 2.x API or authorize future unreviewed snapshot regeneration. The compiled-contract regression suite pins the new Switch shape and fails if Checkbox inheritance is restored.

## Demo and browser evidence

- WebAssembly showcase: `src/Bluent.UI.Demo.Pages/Pages/Components/Switches.razor` → `/components/switches`.
- Interactive Server QA host: `src/Bluent.UI.Demo.SSR/Components/Pages/SwitchInteractiveServerProbe.razor` → `/compatibility/switches-server` (reuses the same showcase).
- Focused render semantics: `tests/RegexSampleGeneratorTest/SwitchRenderSemanticsTests.cs`.
- Browser probe/runner: `scripts/quality/probe_v3_switch.mjs`, `scripts/quality/run_v3_switch.ps1`.

The final local Dev01 Chrome/Edge × WebAssembly/InteractiveServer matrix passed **27/27 assertions per cell (108/108 total)**. In addition to native markup and AX role/name/checked, pointer and Space binding, Focus-visible geometry, stable naming, no-visible-label ARIA naming, all label positions, disabled Off/On, EditForm validation, RTL thumb travel, real Light/Dark semantic-color switching, `Class`/`Style`/`aria-describedby` forwarding, browser-emulated forced-colors/reduced-motion, and 320 CSS-pixel reflow, the matrix now checks the Above layout's exact 40×20 track, 24×24-or-larger hit target centered on the track and below the label, plus a real pointer activation. This caught and fixed two defects: the input overlay was vertically misanchored, and the inherited 40px flex basis made the track 40px high in column layout. All four final runs reported zero browser exceptions, console errors or application HTTP failures.

JSON reports and 320/1280 viewport PNGs are retained under `docs/v3/quality/evidence/BLUENT-SWITCH-*`. The 320 CSS-pixel screenshots are captured at deviceScaleFactor 2 and are therefore 640 physical pixels wide; the matching JSON report records the 320 CSS-pixel viewport and no-overflow assertion.

**Evidence boundary:** forced-colors was browser-emulated. This is not native Windows Contrast Themes, native Safari/VoiceOver, or spoken NVDA/Narrator acceptance. Chromium AX snapshots are not spoken screen-reader output or WCAG certification. No native OS/AT acceptance is claimed.

## Build and verification

From the repository root:

```powershell
npm ci --no-audit --no-fund
npm run build:scss
# Run the Sass commands from src/Bluent.UI.

dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj -c Release --filter FullyQualifiedName~SwitchRenderSemanticsTests

dotnet build src/Bluent.UI.Demo.Pages/Bluent.UI.Demo.Pages.csproj -c Release --no-restore -warnaserror
dotnet build src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj -c Release --no-restore -warnaserror

pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode WebAssembly -Browser Chrome
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode WebAssembly -Browser Edge
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode Server -Browser Chrome
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/quality/run_v3_switch.ps1 -Mode Server -Browser Edge
```

The focused HtmlRenderer suite passed 11/11. The full `Bluent.sln` Release build passed with 0 warnings/errors and the full .NET suite passed 124/124. The Switch source/API guard and negative-mutation tests now pass **18/18**, including regressions for Above hit-target alignment and track height. The four canonical browser reports each show **27/27 (108/108 total)** and all browser runtime-signal arrays are empty. Docs, Skills and Markdown-link contracts are checked separately. Exact-head hosted CI is rerun after the final task-branch commit; the prior `1b2f12fc` checkpoint's 8/8 workflows and 36/36 jobs remain historical evidence only.

## Acceptance and change log

- [x] Fluent reference hierarchy and Medium-first/no-Size decision recorded in canonical Penpot page 58.
- [x] 40-case visual coverage and anatomy/accessibility/crosswalk boards created and exported.
- [x] Dedicated `bool` input implementation, stable naming, native switch role/state, normalized attributes and Switch-specific label-position enum.
- [x] Existing v3 consumers and header setting labels migrated to stable names.
- [x] WebAssembly showcase and InteractiveServer wrapper compile.
- [x] Focused render tests 11/11; Chrome/Edge × WASM/InteractiveServer 100/100 local browser assertions, including Light/Dark theme and forwarded attributes.
- [x] Source/API fail-closed contract and negative mutation tests 18/18, including negative mutations for both Above-layout geometry rules.
- [x] Whole-solution Release build (0 warnings/errors), .NET tests 124/124, and docs/Skills/Markdown-link contracts.
- [x] Exact-head GitHub Actions at `1b2f12fc`: 8/8 workflows, 36/36 jobs, and 20/20 compatibility browser jobs passed; all four dedicated Switch jobs passed.
- [ ] Independent maintainer visual-parity/design acceptance and PR merge into `bluent-v3` remain pending.
- [ ] Native OS contrast and named assistive-technology acceptance remain outstanding; no spoken output is claimed.

No stable 2.x, `Dev`/`main`, NuGet package, production deployment or #418 foundation status was changed by this task branch.