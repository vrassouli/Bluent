# Bluent v3 Label — implementation record (in progress)

`Label` is the native form-label component in the isolated Bluent v3 workstream. This page records the source-backed task-branch contract for [Issue #430](https://github.com/vrassouli/Bluent/issues/430). It is **not a released v3 API** and does not replace the existing [Bluent 2.x Label reference](../../components/label.md) for NuGet consumers.

## Package and route

- Package / assembly: `Bluent.UI` / `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Component: `Label`
- Task branch: `v3/issue-430-label` → `bluent-v3`
- Demo route: `/components/labels`
- Canonical source: `src/Bluent.UI/Components/LabelComponent/Label.razor` and `Label.razor.cs`
- Styles: `src/Bluent.UI/Styles/Components/_label.scss`

Use the normal Bluent UI imports:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Extensions
```

## Basic usage

```razor
<Label Text="Email address" for="contact-email" Required="LabelRequiredState.Required" />
<InputText id="contact-email" @bind-Value="Model.Email" />
```

When using a model expression, `ForExpression` supplies the member name and display name:

```razor
<Label ForExpression="() => Model.Email" />
```

The explicit `Text` takes precedence over the display name derived from `ForExpression`. A consumer-supplied unmatched `for` attribute remains available when a custom input ID is required. The component keeps the native `<label>` element as the association target.

## Parameters

| Parameter | CLR type | Default | Contract |
| --- | --- | --- | --- |
| `Text` | `string?` | `null` | Explicit visible label text; takes precedence over the expression display name. |
| `ForExpression` | `Expression<Func<object?>>?` | `null` | Supplies the member name for the native `for` association and the display name when `Text` is absent. |
| `RequiredSymbol` | `string` | `"*"` | Visible marker text when the visual Required state is active. |
| `Info` | `RenderFragment?` | `null` | Optional explanatory content rendered in a Popover outside the native `<label>`. |
| `InfoButtonAriaLabel` | `string?` | `null` | Optional explicit accessible name for the Info action; whitespace/empty input falls back to the localized default. |
| `Size` | `LabelSize` | `LabelSize.Medium` | `Small`, `Medium`, or `Large` typography/layout variant. |
| `Required` | `LabelRequiredState` | `LabelRequiredState.Auto` | Visual state: `Auto` reads validation metadata from `ForExpression`; `Required` and `NotRequired` override the marker visibility. |

The component also inherits the shared Bluent base parameters: `Id`, `Class`, `Style`, `AdditionalAttributes`, `Tooltip`, `TooltipContent`, `TooltipPlacement`, `TooltipAppearance`, and `DisplayTooltipArrow`. The inherited tooltip API is separate from the Label `Info` action.

## Required and disabled semantics

`Required` controls only the visible marker. `Auto` uses `ForExpression?.IsRequired() ?? false`; it does not set the associated input's `required` attribute, validation rules, or EditContext state. The marker is `aria-hidden="true"`, so assistive technology does not hear a second, decorative asterisk as label text. The associated input owns actual required validation and its accessible required state.

The inherited `disabled` unmatched attribute only adds the Label's visual `disabled` class. It does not disable the associated input, change its form semantics, or prevent activation of unrelated content. Apply `disabled` to the actual input/control when the field is disabled.

## Info action and keyboard behavior

When `Info` is absent, the original native `<label>` structure remains in place. When `Info` is present, Label renders a layout wrapper containing two siblings: the native `<label>` and an icon-only transparent `Button` hosted by the shared `Popover`. The action is deliberately **not nested inside the label**, avoiding an interactive descendant inside a labelable element while preserving the label's `for` association.

The Info Button's accessible name is:

1. `InfoButtonAriaLabel`, when non-empty; otherwise
2. the localized visible label/display name followed by “more information”; or
3. the localized “More information” string when the Label has no visible name.

The surface uses the shared Popover lifecycle. On activation, `aria-expanded` and `aria-controls` are managed for the trigger, focus moves to the `role="note"` content surface, and focusable descendants (for example links) remain available through normal Tab navigation. Escape closes the surface and restores focus to the Info Button. Moving focus outside the open Info surface closes it without pulling focus away from its new destination. There is no focus trap. Pointer dismissal and shared Popover cleanup remain owned by Popover; Label does not install a second independent document keyboard listener.

The Info content is a `RenderFragment`; its links and other interactive descendants must provide their own meaningful accessible names and valid destinations.

## Token and styling contract

The maintainer-approved Label semantic roles are:

| Label role | Logical role | CSS alias | Current source fallback |
| --- | --- | --- | --- |
| Default text | `bluent.semantic.text.primary` | `--bui-v3-text-primary` | `--colorNeutralForeground1` |
| Disabled visual text | `bluent.semantic.text.disabled` | `--bui-v3-text-disabled` | `--colorNeutralForegroundDisabled` |
| Required marker | `bluent.semantic.text.dangerAccessible` | `--bui-v3-text-danger-accessible` | `--colorPaletteRedForeground1` |

These aliases are consumed with source-token fallbacks so the component remains usable while the wider #418 foundation preview is still being integrated. This Label approval does not close #418 or approve every candidate token/value for production. Label reuses shared global typography and logical spacing scales; it does **not** introduce a `component.label.*` token namespace.

The Info wrapper uses logical inline spacing, and the Info surface has a bounded inline size with overflow wrapping. Light/Dark and RTL behavior continue to derive from the resolved theme tokens, direction, and CSS logical properties.

## Localization

The default Info accessible name is provided through `IStringLocalizer<LabelResources>`. English and Persian (`fa-IR`) resources are included under `LabelComponent/Resources`. An explicit `InfoButtonAriaLabel` always wins over the localized default.

## Design provenance

The editable source-owned design references are in the **Bluent v3 Design System** Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`:

| Artifact | Page | Page ID | Board ID |
| --- | --- | --- | --- |
| Label anatomy, visual states and Info interaction | 48 | `2461804a-8cd8-80f5-8008-e8c9d07f2a1d` | `2461804a-8cd8-80f5-8008-e8c9d0a2e586` |
| Theme, responsive and accessibility coverage matrix | 49 | `2461804a-8cd8-80f5-8008-e8cc0243d980` | `2461804a-8cd8-80f5-8008-e8cc025deccd` |

The boards are existing editable design references. Their status stamps were not updated during this code pass because the live Penpot tab repeatedly suspended. Treat the issue's previously recorded design decisions and the maintainer-approved token-role comment as the decision record; do not interpret the stale board badge as a new export or as evidence of runtime QA.

## Verification

| Check | Current result | Evidence boundary |
| --- | --- | --- |
| Full Solution Release build | Passed, 0 warnings / 0 errors | Compilation only; not browser behavior. |
| Full Solution Release tests | 38/38 passed | Existing .NET test suite; the focused Label regression gates are separate. |
| Label contract gate | 10/10 passed | Static source/resource/demo/CSS invariants; not a browser accessibility tree. |
| Popover JS bundle contract | 25/25 passed | Source/bundle invariants, including Label-owned focus-leave cleanup; not native OS/AT. |
| Sass / emitted CSS | Passed | Compiled and published stylesheet contains all three aliases with fallbacks. |
| TypeScript ESM/global build | Passed | Rebuilt from source and synchronized to the Bluent.UI assets. |
| Chrome / en-US | **18/18 passed** | Headless Chrome, Debug WebAssembly; pointer/keyboard, desktop and 390px viewport. [Evidence](../quality/evidence/BLUENT-LABEL-CHROME.json). |
| Edge / en-US | **18/18 passed** | Headless Edge, same assertions. [Evidence](../quality/evidence/BLUENT-LABEL-EDGE.json). |
| Chrome / fa-IR | **18/18 passed** | `navigator.language=fa-IR`; Persian localized Info accessible name. [Evidence](../quality/evidence/BLUENT-LABEL-CHROME-FA-IR.json). |
| Edge / fa-IR | **18/18 passed** | `navigator.language=fa-IR`; Persian localized Info accessible name. [Evidence](../quality/evidence/BLUENT-LABEL-EDGE-FA-IR.json). |
| Browser accessibility tree | Named Info Button and expanded/collapsed disclosure state verified in Chrome and Edge | Chromium accessibility tree only; not native screen-reader speech certification. |
| Native OS Contrast Themes / native assistive technology | Not performed | Not claimed or certified. |

Reproduction commands from the task worktree:

```powershell
python scripts/quality/check_v3_label_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_label_contract.py' -v
python -m unittest discover -s scripts/quality -p 'test_v3_popover_js_bundle.py' -v
npx --yes sass@1.93.2 --silence-deprecation=import,global-builtin,color-functions,legacy-js-api --no-source-map src/Bluent.UI/Styles/Components/components.scss src/Bluent.UI/Styles/Components/components.css
dotnet build Bluent.sln --configuration Release --no-restore -warnaserror
dotnet test Bluent.sln --configuration Release --no-build
```

## Current maturity boundary

Issue #430 is **In progress** on its isolated task branch. Implementation, demo, source documentation, migration notes and source-level regression contracts are present on the task branch. Local live Chrome and Edge Label probes each pass 18/18 assertions in both `en-US` and `fa-IR`; the 2×2 browser/culture matrix is wired into the PR browser workflow. This branch is not merged into `bluent-v3`, is not a released v3 package, and does not alter stable `Dev`, 2.x package assets, tags, or deployments. Native OS Contrast Themes and spoken screen-reader acceptance remain unperformed; exact-head GitHub CI is still an independent review gate.
