# Switch #435 — Fluent design, API and token crosswalk

## Decision summary

The first Bluent v3 Switch API is a binary immediate-setting control with one primary Medium geometry and no `Size` parameter. It is not a wrapper around `Checkbox<bool>` because Checkbox-specific parameters would imply unsupported Mixed/Circular/size behavior and state-dependent labels.

The Switch label is the stable name of the setting. It must never change from `Notifications` to `Enabled` or `Disabled` when toggled. The native checkbox input carries `role="switch"`; its native `checked` state communicates On/Off. `aria-checked` is not authored because it would compete with the native state mapping.

## Reference hierarchy and evidence date

The reference hierarchy defined by #552 applies:

1. Fluent 2 design guidance for use cases, content, accessibility and layout.
2. Matching Fluent UI Web Components Switch implementation for the primary Blazor/web reference.
3. Fluent UI React v9 only for supplementary comparisons where Web Components has no corresponding API.
4. Existing Bluent 2.x source and public API for consumer migration context.
5. Editable Bluent v3 Penpot design as the project-owned proposal/approval artifact.

Versions observed on 2026-11-18:

| Reference | Version | Relevant contract |
| --- | --- | --- |
| `@fluentui/web-components` | 3.2.1 | One fixed 40×20 Switch host/track, 14×14 indicator; no `size` attribute; `ElementInternals.role = "switch"`; native form validity for `required` |
| `@fluentui/react-switch` | 9.7.7 | Small and Medium; Above/Before/After; Small 32×16/14px thumb/Base200; Medium 40×20/18px thumb/Base300 |

Sources:

- [Fluent 2 Switch usage](https://fluent2.microsoft.design/components/web/react/core/switch/usage/)
- [Web Components Switch styles](https://github.com/microsoft/fluentui/blob/master/packages/web-components/src/switch/switch.styles.ts)
- [Web Components Switch semantics](https://github.com/microsoft/fluentui/blob/master/packages/web-components/src/switch/switch.ts)
- [React v9 Switch styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-switch/library/src/components/Switch/useSwitchStyles.styles.ts)
- [WAI-ARIA APG Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)

## Geometry decision: Medium-only public contract

**Selected first public geometry:** Track 40×20 CSS px, thumb 14×14 CSS px, existing Base300 label typography. Keep a native interactive hit area at least 24×24 CSS px. Layout uses After/Before/Above; label text is stable and may wrap.

The React v9 Medium uses an 18 px thumb and React also has a Small size; those are not the Web Components geometry. The 18 px medium-thumb study was deliberately revised and relabeled as a cross-framework difference. Small remains a deferred reference in Penpot only. The first Bluent v3 component does not expose `Size` until an actual consumer density requirement justifies a new API review.

This avoids an unnecessary public enum and avoids conflating two implementations from separate Fluent frameworks.

## Accessibility and behavior contract

- Switch represents a binary setting whose change takes effect immediately. A deferred selection or Mixed state belongs to Checkbox.
- One stable setting-oriented label across both states.
- Use `input[type=checkbox][role=switch]`; native `checked` conveys the state; no competing `aria-checked`.
- Space follows native checkbox activation. Do not synthesize Enter for this native input.
- Disabled is native and never activates.
- Visible label positions: After, Before, Above. No visible label requires a meaningful caller `aria-label` or `aria-labelledby`.
- `Required` marker is decorative (`aria-hidden`); native `required` or consumer EditContext/DataAnnotations rules own validation.
- Visible 2 px keyboard focus outline with 2 px offset.
- Forced-colors uses system colors; reduced motion removes thumb transition.
- RTL uses logical inline geometry; thumb travel follows the logical direction.

## Existing CSS role crosswalk — scoped #418 exception

| Switch part/state | Existing shipped CSS role |
| --- | --- |
| On Rest / Hover / Pressed track | `--colorCompoundBrandBackground`, `--colorCompoundBrandBackgroundHover`, `--colorCompoundBrandBackgroundPressed` |
| Off Rest track | `--colorNeutralBackground1` |
| Off Hover / Pressed track | `--colorNeutralBackground3`, `--colorNeutralBackground3Pressed` |
| Off border Rest / Hover / Pressed | `--colorNeutralStrokeAccessible`, `--colorNeutralStrokeAccessibleHover`, `--colorNeutralStrokeAccessiblePressed` |
| Disabled track / border / thumb / label | `--colorNeutralBackgroundDisabled`, `--colorNeutralStrokeDisabled`, `--colorNeutralForegroundDisabled` |
| Focus-visible | `--colorStrokeFocus2` |
| Shape / typography / motion | `--borderRadiusCircular`, `--strokeWidthThin`, existing spacing, Base300 typography, `--durationNormal`, `--curveEasyEase` |

No new global Switch token, token alias, public focus-host attribute, portal/dialog API, or production bridge is introduced. Only shipped CSS roles are consumed. #418 retains ownership of all future public token vocabulary and aliases. This scoped exception follows the already-accepted task pattern in TextField #432 and NumericField #433; it does not change #418 status or imply its acceptance.

## Penpot source artifact

Canonical file: **Bluent v3 Design System** (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), page 58 (`06b2261f-bfb4-808c-8008-f689e0ff1a1b`).

| Board | Node ID | Purpose |
| --- | --- | --- |
| Switch 40-case visual matrix + RTL | `06b2261f-bfb4-808c-8008-f689e11abe56` | Five presentation rows × On/Off × four label layouts; disabled interaction combinations are N/A |
| Anatomy/accessibility/responsive contract | `06b2261f-bfb4-808c-8008-f68a6da3e29d` | Native semantics, accessible name, key behavior, required/validation, RTL, 320px, forced-colors, reduced motion and current CSS role crosswalk |
| Medium default + deferred Small reference | `b5e126d7-572c-8063-8008-f691ea3d12ec` | Medium-only API decision and cross-framework geometry distinction |

Named source version for the latest sizing decision: `Bluent v3 · Switch Medium-first design decision · 2026-11-18` (revision 867). The design proposal is not a claim of completed maintainer visual parity review or native accessibility acceptance.

## Implementation ownership and non-goals

- #435 owns Switch source, label/value API, CSS, showcase, QA, docs and migration.
- #418 retains public token/alias, focus-host and foundation API ownership.
- #421 owns the shared Component Lab platform; its platform approval is independent from family acceptance.
- No change to stable 2.x, `Dev`, `main`, NuGet publication or deployments.
- No native OS contrast, Safari.app/VoiceOver or spoken AT acceptance is claimed by Chromium emulation/AX snapshots.
