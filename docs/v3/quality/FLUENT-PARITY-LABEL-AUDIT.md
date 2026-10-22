# #552 family audit — Label (#430)

**Status: partial source/API audit with an accessibility gap identified.** This is not Fluent parity acceptance, a design approval, or a browser/assistive-technology sign-off. The report is source-backed; no product code or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest includes `fluent-label`, and the pinned React semantic triage also has a same-name Label comparator. That does not establish a one-to-one contract. Bluent's Label is a native `label` augmented with expression-derived display/required metadata and an optional Popover info action. The `ForExpression`, `RequiredSymbol`, `LabelRequiredState`, `LabelSize`, and `Info` behaviors need individual mapping against the pinned upstream label attributes/slots and the owning Bluent field components.

## Source findings

| Finding | Evidence | Disposition |
| --- | --- | --- |
| Label association is inferred from a property name | `Label.razor` renders `for="@GetPropertyName()"`; `GetPropertyName()` returns `ForExpression.GetMemberName()`. It does not read or synchronize the actual rendered target input's `id`. | Source-confirmed integration risk: `for` only works if the consumer's target element id matches the derived property name. A browser-level field-by-field association test is still needed before claiming the gap is reproduced in every field family. |
| Info trigger inherits unrelated label text as accessible name | Chrome and Edge AX expose the nested Info button name as `This is a label`, inherited via the containing label; the button has no explicit `aria-label` or `title`. | Runtime gap reproduced; the action needs an action-specific localized name after the design/API decision. Native AT remains untested. Owner coordination: #430, #429 and #420. |
| Required marker is visual, not input validation | `Required` resolves `IsRequired`; when true, the component renders `RequiredSymbol` in a `span`. It does not set the input's `required` attribute or synchronize validation metadata onto the field. | This is a source boundary, not by itself a defect. Do not claim Label performs validation or that its marker makes the target field required. |
| Expression metadata has explicit precedence | `Text` overrides expression display metadata; without `Text`, the display name comes from `ForExpression.GetDisplayName()`. `Required=Auto` derives from the expression helper; explicit Required/NotRequired override it. | Verified source behavior. Full upstream feature mapping, null/invalid expression behavior and consumer integration matrix remain open. |

## Supplemental browser evidence (2026-10-22)

The `/components/labels` demo was captured in Chrome and Edge in Light/LTR, Dark/RTL and CDP-emulated forced-colors (31/31 instrumentation checks per engine across the Label/Link/Badge probe). Browser AX confirms the nested Info button inherits the unrelated accessible name `This is a label`; it is not nameless, but its name does not describe its action. The isolated Required-label fixture emits `for="RequiredProperty"` without a target on that page, so this fixture does not establish whether all consumer fields have correct associations. See [Label/Link/Badge browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md). Native screen-reader output and the full field-association matrix remain open.
## Canonical matrix disposition

- `accessibility`: `audited_gaps` — browser AX names the Info action `This is a label`, inherited from the containing label rather than describing the action; native screen-reader output and field association across field families remain unverified.
- `feature`: `audited_gaps` — 14 API parameters are mapped in [Wave A API review](FLUENT-PARITY-WAVE-A-API-REVIEW.md); native `for`, Auto required inference, custom symbol and Info are extensions.
- `visual`, `behavior`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `not_reviewed`.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#430:** decide whether Label should own the accessible name of its Info trigger and preserve the approved shared Button contract; add a localized action name after the design/API decision.
2. Define the association contract between `ForExpression`, the emitted `for`, and each consuming field's real DOM `id`. Test TextField, NumericField, SelectField, Checkbox/RadioGroup and custom field components separately; do not assume a property name is always the generated input id.
3. Review the [Wave A API ledger](FLUENT-PARITY-WAVE-A-API-REVIEW.md) and decide whether ForExpression, Auto required inference, custom RequiredSymbol and Info Popover are intentional extensions. Preserve Bluent-only expression metadata only after that decision.
4. Complete editable Bluent v3 design, Light/Dark, RTL, required/error states, focus, zoom/reflow and native screen-reader checks before acceptance.

## Evidence sources

- [Canonical Label documentation](../../components/label.md)
- `src/Bluent.UI/Components/LabelComponent/Label.razor` and `.razor.cs`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Shared Button icon/accessible-name evidence](FLUENT-PARITY-BUTTON-ICON-AX.md)
- [Label owner issue #430](https://github.com/vrassouli/Bluent/issues/430)

**Boundary:** this is a partial source audit with a concrete accessible-name risk, not proof of full Label/Fluent parity or native assistive-technology acceptance.
