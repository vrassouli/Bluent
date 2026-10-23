# Migration-document coverage audit - Issue #552

Review date: 2026-10-23. Source baseline: 73155f02.

## Findings

- Current component reference documents exist for **18/18 families** under docs/components.
- Family-specific 2.x-to-v3 migration sections found: **0/18**.
- The component-reference template contains a required “2.x → v3 compatibility” section, but it is a template, not 18 populated migration guides.
- The generic migration-and-upgrades guide documents earlier-version migration and a general upgrade outline; it does not provide an approved family-by-family v3 migration path.
- The design migration-impact and CSS migration-impact ledgers are risk/decision records, not consumer-facing component migration instructions.
- Fluent API candidate inventories and the #552 parity matrix identify gaps but do not approve renamed/removed/extended public APIs.

**Status: audited gaps, not accepted.** Existing component documentation is not absent; the missing deliverable is a reviewed, family-specific 2.x-to-v3 compatibility/migration section. Do not invent a migration path while v3 APIs and designs remain pending.

## Family coverage

| Family | Current component doc | Lines | Migration heading | V3 migration section | Gap |
|---|---|---:|---|---|---|
| Button | [button.md](../../../docs/components/button.md) | 143 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Icon | [icon.md](../../../docs/components/icon.md) | 68 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Label | [label.md](../../../docs/components/label.md) | 50 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Link | [link.md](../../../docs/components/link.md) | 47 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Badge | [badge.md](../../../docs/components/badge.md) | 168 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| TextField | [text-field.md](../../../docs/components/text-field.md) | 127 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| NumericField | [numeric-field.md](../../../docs/components/numeric-field.md) | 137 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Checkbox | [checkbox.md](../../../docs/components/checkbox.md) | 179 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Switch | [switch.md](../../../docs/components/switch.md) | 121 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| RadioGroup | [radio-group.md](../../../docs/components/radio-group.md) | 135 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| SelectField | [select-field.md](../../../docs/components/select-field.md) | 124 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| DateField | [date-field.md](../../../docs/components/date-field.md) | 128 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| TimeField | [time-field.md](../../../docs/components/time-field.md) | 118 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| MaskedField | [masked-field.md](../../../docs/components/masked-field.md) | 119 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| OtpField | [otp-field.md](../../../docs/components/otp-field.md) | 117 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| Slider | [slider.md](../../../docs/components/slider.md) | 52 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| RangeSlider | [range-slider.md](../../../docs/components/range-slider.md) | 57 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |
| FileSelect | [file-select.md](../../../docs/components/file-select.md) | 59 | no | no | No family-specific 2.x-to-v3 migration section is present in the current component reference. |

## Shared migration/reference documents

| Document | Role and limitation |
|---|---|
| [migration-and-upgrades.md](../../../docs/compatibility/migration-and-upgrades.md) | Generic version-upgrade guidance and legacy 1.x-to-2.0.0 instructions; no approved family-by-family 2.x-to-v3 path. |
| [COMPONENT-REFERENCE-TEMPLATE.md](../../../docs/v3/COMPONENT-REFERENCE-TEMPLATE.md) | Reusable component-reference template with a 2.x-to-v3 compatibility section; not populated family guidance. |
| [MIGRATION-IMPACT-LEDGER.md](../../../docs/v3/design/MIGRATION-IMPACT-LEDGER.md) | Design/architecture migration-impact ledger; not a consumer-facing component migration guide. |
| [css-migration-impact-ledger.md](../../../docs/v3/architecture/css-migration-impact-ledger.md) | CSS/token migration risks and owners; not component API migration instructions. |
| [COMPONENT-REFERENCE-MATRICES.md](../../../docs/v3/design/COMPONENT-REFERENCE-MATRICES.md) | Upstream reference matrices for a subset of families; not a complete 18-family migration guide. |
| [FLUENT-PARITY-RETRO-AUDIT.md](../../../docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md) | Retrospective parity audit and gap matrix; not consumer-facing migration guidance. |
| [FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md](../../../docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md) | Unapproved Web Components API-name candidates; not a migration guide. |
| [FLUENT-REACT-9.74.10-18-API-CANDIDATES.md](../../../docs/v3/quality/FLUENT-REACT-9.74.10-18-API-CANDIDATES.md) | Unapproved React API candidates; not a migration guide. |

## Required migration section per family

After design/API decisions are approved, the family migration section must document:
1. Current 2.x API and approved v3 API, including unchanged, renamed, removed, intentional Bluent-only and not-applicable members.
2. Before/after code examples for markup, parameters, events/binding and child content.
3. Styling and token changes, asset/package changes, RTL/localization and accessibility behavior.
4. Breaking changes, deprecations, compatibility shims, replacement patterns and any no-counterpart explanation.
5. Required migration steps, validation/tests, render-mode caveats and links to the owning issue/PR.

## Acceptance boundary

All 18 migrationDocs dimensions are recorded as audited_gaps. No consumer-facing v3 migration path is approved or claimed. Keep this inventory separate from product implementation; do not modify current 2.x docs as if proposed v3 APIs were already final.
