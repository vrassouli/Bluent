# Button primary surface token reconciliation — Issue #552

Review date: 2026-10-24. Bluent source baseline: b9952aa93e89fd569de54080a7fdd06037b53a41. Reference: real rendered @fluentui/web-components@3.1.3 with @fluentui/tokens@1.0.0-alpha.24; Bluent comparison is a published WebAssembly Release build of unchanged source.

## Result

The remaining Primary Button surface-color difference has now been traced through the Bluent source token chain. For the two measured base states, the actual computed Bluent background equals the compiled default-theme token exactly. The evidence therefore points to values in Bluent's current default brand palette—not an unexplained CSS override.

| Mode | Fluent computed surface | Bluent computed surface | Bluent source mapping | Absolute RGB channel delta |
| --- | --- | --- | --- | --- |
| Light / LTR | #0F6CBD (rgb(15, 108, 189)) | #1267B4 (rgb(18, 103, 180)) | --colorBrandBackground → default brand key 80 | 3, 5, 9 |
| Dark / RTL | #115EA3 (rgb(17, 94, 163)) | #18599B (rgb(24, 89, 155)) | --colorBrandBackground → default brand key 70 | 7, 5, 8 |

## Verified Bluent source chain

1. src/Bluent.UI/Styles/Components/_button.scss sets the Primary appearance background-color to var(--colorBrandBackground).
2. theme-default-light.scss and theme-default-dark.scss both select $brand-default.
3. The Light theme maps --colorBrandBackground to brand key 80; the Dark theme maps it to key 70.
4. src/Bluent.UI/Styles/Themes/_brand.scss defines those default-map values as #1267B4 and #18599B.
5. The compiled theme-default-light.css / theme-default-dark.css and captured Release browser computed backgrounds match those values exactly.

The reference values above are observed computed colors on the pinned Fluent Button host; this report does not assume Fluent uses Bluent's token names. Machine-readable measurements and source paths are in the [token reconciliation evidence](evidence/FLUENT-BLUENT-BUTTON-BRAND-TOKEN-RECONCILIATION.json). The prior [crop diagnostic](evidence/FLUENT-BLUENT-BUTTON-PRIMARY-CROP-DIFF.json) remains a separate pixel-level measurement.

## Interpretation and handoff

This establishes a source-token divergence relative to the pinned Fluent run. It does not establish whether the divergence is a defect: Bluent may have a deliberate brand palette, and changing tokens just to match the upstream reference would bypass design ownership.

The decision remains pending review against the editable Bluent v3 Design System in Penpot (file b64f6665-c9ab-80b5-8008-c4ac99d9d000; see [the design workflow](../design/BLUENT-V3-PENPOT.md)). Confirm the Primary appearance color for Light and Dark, along with its brand-token rationale, before proposing remediation. No product source, API or CSS was changed in this audit step.

Status boundary: diagnostic evidence only. Design approval and all 18 family parity dimensions remain open; this does not accept Button parity, close #428/#552, or make PR #553 review-ready.
