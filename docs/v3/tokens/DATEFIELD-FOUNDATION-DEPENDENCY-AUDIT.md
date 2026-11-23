# #418 consumer dependency audit — DateField

**Date:** 2026-11-21
**Status:** Foundation review only · no DateField implementation · no token/API/CSS approval

This audit uses the existing `DateField<TValue>` source as a downstream consumer to identify what the shared Bluent v3 foundation must settle before Issue #438 can enter implementation. It does **not** start or promote #438, redesign its public API, or claim that current v2 component behavior is accepted as the v3 target.

## Source topology

The current DateField wrapper composes:

- `DateField<TValue>` → `MaskedField` for typed date entry and inherited Blazor `InputBase<TValue>` binding/validation.
- `DateFieldPicker<TValue>` → `Popover` + icon-only `Button` + `Calendar<TValue>` for calendar selection.
- `Calendar<TValue>` uses culture-aware date/month/year surfaces and is closed by selection when hosted in the cascading `Popover`.

Source reviewed: DateField.razor, DateField.razor.cs, DateFieldPicker.razor, Calendar.razor, BluentFieldComponentBase, and current field/calendar/popover styles. The canonical source references are also linked from [DateField](../../components/date-field.md) and [Calendar](../../components/calendar.md).

## Foundation dependencies DateField exposes

| Shared foundation concern | DateField consumer requirement | #418 disposition |
| --- | --- | --- |
| Text foreground | Entered date text needs the ordinary text foreground in every supported brand/mode. | `text.primary` is currently a narrow first-wave candidate with Label evidence; DateField use must be reviewed as an additional consumer. Until approval, do not consume the preview alias. |
| Disabled foreground | Disabled date input and disabled trigger must remain distinguishable while preserving native disabled semantics. | `text.disabled` is a first-wave candidate with Label visual-only scope; DateField consumer parity and cross-mode evidence are still required. |
| Placeholder foreground | A consumer may forward a native placeholder through unmatched attributes; DateField has no dedicated placeholder parameter. | `text.placeholder` source role was selected for TextField only. DateField's possible attribute-forwarded usage is not blanket-approved. |
| Validation-message text | Date parsing / `EditContext` validation produces readable error text, not merely a decorative marker or non-text status icon. | **Open shared gap:** current `text.dangerAccessible` is Label required-marker-only; `status.danger` is non-text-only on the studied neutral surface. Neither is an approved validation-message foreground. See the candidate proposal below. |
| Field surface, border and geometry | The shared field shell owns neutral surface, borders, density/size, typography, spacing, radius and addon layout. | Keep these in the shared field/foundation crosswalk; do not create DateField-only public tokens where a shared field role is appropriate. Exact semantic consumer approval remains open. |
| Focus | The input uses the shared field focus treatment; the calendar trigger is a separate `Button` and focus stop. | Preserve the existing TextField underline-only field focus direction and the `Button`'s distinct focus treatment. Do not invent a universal DateField ring or expose a new focus alias through this audit. |
| Calendar / `Popover` surface | The calendar panel needs a themed surface, foreground, border, elevation/shadow, radius, spacing, typography and overlay stacking. | These are shared surface/overlay concerns. D2/D5 ownership and nested theme behavior remain governed by the existing #418 portal decisions and #420 interaction work; the calendar must inherit the owning brand/mode. |
| Motion | Calendar view changes and `Popover` open/close animations must respect reduced-motion preferences. | Retain the shared reduced-motion policy and verify the consumer path; no DateField-specific motion token is proposed. |
| Forced colors | Field text/borders, focus indicator, disabled affordances and calendar selection must remain perceivable when the OS overrides colors. | Browser emulation is useful regression evidence but does not close the still-open native Windows Contrast Themes / AT acceptance gate. |
| Direction and locale | The numeric date-entry string is intentionally LTR; surrounding labels/layout and the calendar surface must work in RTL and culture-specific calendars. | Shared logical spacing/layout and theme foundations must not force the whole component LTR. Persian IME/caret and native locale/accessibility evidence remain open. |

## Existing validation source and open semantic decision

The current shared field stylesheet already defines the .validation-message selector with color var(--colorPaletteRedForeground1). This is the existing source-color path used by the standard Blazor ValidationMessage CSS class; it is not an absent implementation or a new color proposal. The same Fluent source variable is present in the #418 source layer as bluent.source.paletteRedForeground1, but the current semantic alias bluent.semantic.text.dangerAccessible is explicitly Label required-marker-only.

A reproducible source audit now checks that selector and measures the existing variable against colorNeutralBackground1, colorNeutralBackground2 and colorNeutralBackground3 in all ten brands × Light/Dark themes: python scripts/quality/audit_v3_validation_text_contrast.py. Current results: **60/60 pairs pass 4.5:1**; minimum **5.204:1**. Light themes use #bc2f32 (minimum 5.364:1 across the three neutral surfaces); Dark themes use #e37d80 (minimum 5.204:1). This confirms the existing source path on those measured neutral surfaces only. It does not prove contrast on brand/inverted/custom consumer hosts or native forced-colors surfaces.

The remaining semantic decision is whether to add a separately named role, tentatively semantic.text.validation, that aliases this existing source role with an explicitly limited validation-message consumer contract. It is not approved yet. Do not widen semantic.text.dangerAccessible beyond Label #430, and do not use semantic.status.danger for readable text; the latter remains non-text-only on the studied neutral surface. A separate alias must not be introduced merely to rename the existing source implementation.

### 2026-11-23 host-surface diagnostics — scope boundary, not a new token

The existing contrast audit now keeps its 60 neutral-base pairs as the pass/fail gate and adds a separate diagnostic matrix of 200 pairs (10 representative non-neutral or interaction-state backgrounds × 20 brand/mode themes). Diagnostic failures are reported but intentionally do not fail the neutral-base gate. Results include:

| Background context | Passing pairs | Minimum contrast | Interpretation |
| --- | ---: | ---: | --- |
| Neutral Background 1/2/3 (base surfaces) | 60/60 | 5.2036:1 | Existing supported numeric evidence for the neutral-base scope only |
| Neutral Background 1 Hover | 10/20 | 3.8852:1 | State-dependent host; not a general validation-text surface |
| Neutral Background Inverted | 0/20 | 2.4877:1 | Fails the normal-text target in every theme |
| Brand Background | 0/20 | 1.0027:1 | Fails the normal-text target in every theme |
| Brand Background 2 | 10/20 | 4.0266:1 | Fails in half of the themes |
| Status Danger Background 1 | 20/20 | 5.3755:1 | This particular light danger surface passes; it does not generalize to other danger states |
| Palette Red Background 1 | 20/20 | 5.4831:1 | This particular light palette surface passes |
| Palette Red Background 2 | 0/20 | 3.5017:1 | Fails in every theme |

This rules out describing the existing source color as a context-free validation-text foreground for arbitrary hosts. If a separate `semantic.text.validation` alias is considered, its consumer contract must state the allowed host/surface and what happens on brand, inverted, interactive-state and other unsupported backgrounds. The current evidence supports only the three neutral base surfaces measured above; no automatic host detection or universal fallback is established. The name remains a review candidate, not a schema entry, public allow-list member or CSS alias.

The reproducible command remains `python scripts/quality/audit_v3_validation_text_contrast.py`. Its JSON report exposes the diagnostic summaries separately from the neutral-surface `pass` result. These are opaque-color arithmetic checks, not rendered/native OS or assistive-technology acceptance.

Before any semantic role is added to the preview schema or emitted CSS, the review must establish:

1. the role name and whether it is exclusive to validation messages or covers a broader error-text consumer contract;
2. that the existing source mapping remains appropriate, with contrast review extended to every supported validation-message host/surface across 10 brands × Light/Dark and a normal-text target of at least 4.5:1;
3. whether disabled, high-contrast and forced-colors cases use system colors or another established source path;
4. actual consumer review and editable design approval.

Until then, do not add a role to the current 17-role schema, public allow-list, generator, CSS or package. Keep the existing Label-only and non-text Danger boundaries unchanged. This remains a review dependency for #418, not an approved token or implementation direction.

## Explicitly deferred to DateField #438

These are component-owned findings, not Foundation work:

- `DateClass` is declared on DateField but is not passed to DateFieldPicker / Calendar.
- Typed text parsing does not enforce `Min` / `Max`, although the picker receives those bounds.
- `YearSelect` mask / formatting / parser construction need a consistent year-only contract.
- The icon-only calendar trigger needs an explicit accessible name.
- Calendar popup keyboard navigation, focus return, announcements, RTL, culture-specific calendar behavior and full browser/render-mode acceptance need dedicated design and runtime tests.

The current source and documentation already record these as gaps; they must be handled in #438 after its own design/Ready gate, not pulled into #418.

## Recommended #418 exit check for this consumer

Before closing the foundation issue, confirm that the shared foundation contract:

- documents field text / disabled / placeholder scope and the open validation-text role decision;
- distinguishes field focus from action-button focus;
- covers neutral popup surfaces, elevation and overlay theme ownership;
- preserves reduced motion, forced-colors system mappings, logical layout and RTL;
- keeps component-specific behavior/API and DateField acceptance in #438.

**Boundary:** this audit changes documentation/test expectations only. It does not alter DateField source, public API, token schema, generated preview CSS, production CSS, packages, or the status of #438.

## Editable design reference

- Penpot file: Bluent v3 Design System — b64f6665-c9ab-80b5-8008-c4ac99d9d000
- Page 52: 52 · Public token vocabulary & CSS aliases · OPTION B SELECTED · PREVIEW ONLY — 388782f1-b766-8073-8008-f3299e62827a
- Board: #418 · Public token vocabulary & production alias policy · OPTION B SELECTED · RELEASE GATES OPEN — 388782f1-b766-8073-8008-f3299e849141

The existing page remains PREVIEW ONLY. This source audit is not a Penpot design approval.
