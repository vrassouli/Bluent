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

## Source-owned Penpot review (read-only, 2026-10-24)

The connected file was confirmed as **Bluent v3 Design System** (file ID b64f6665-c9ab-80b5-8008-c4ac99d9d000). The relevant editable artifacts confirm that the current palette is **not yet approved design intent**:

- Page **22 · Button Fluent parity review**, board **#419 · Linked Button reference comparison** (e31294c6-7c55-805f-8008-c5a91188deb7) is headed “Button — inspect actual differences before approving parity”. It labels its context **FLUENT 2 REFERENCE × BLUENT LOCAL DRAFT / ISSUE #419**. The linked upstream Primary/Rest specimen (e31294c6-7c55-805f-8008-c5a92534126b) uses #0F6CBD; the Bluent Primary/Rest draft (e31294c6-7c55-805f-8008-c5a925451f7a, face e31294c6-7c55-805f-8008-c5a925451f7c) uses #1267B4. The board's decision note explicitly requires reviewing color/typography and state semantics before claiming Fluent parity.
- Page **19 · Bluent Button native variants** labels its native states matrix **DRAFT**; the Primary/Rest face (e31294c6-7c55-805f-8008-c59076478c3a) is #1267B4.
- Page **27 · v3 token architecture and themes · #418** says its semantic/component token names remain **PROPOSED** and shows Light #1267B4 / Dark #18599B. Page **08 · Brand inventory** explicitly states that the generated CSS brand backgrounds are current values, **not approved v3 semantics**.

So Penpot records the divergence and the intended existing source values, but it does **not** resolve the design decision. We must not interpret the current draft as approval to preserve the existing palette or to overwrite it with Fluent values. The next decision gate is owner/designer review of the Primary Light/Dark colors and token rationale. During this read-only inspection, Light token sets were active and Dark token sets inactive; their literal Dark values were recorded, but no claim is made that switching/resolving the Penpot Dark theme was dynamically validated. Exact frame IDs and this caveat are included in the structured evidence JSON.

## Interpretation and handoff

This establishes a source-token divergence relative to the pinned Fluent run. It does not establish whether the divergence is a defect: Bluent may have a deliberate brand palette, and changing tokens just to match the upstream reference would bypass design ownership.

The decision remains pending review against the editable Bluent v3 Design System in Penpot (file b64f6665-c9ab-80b5-8008-c4ac99d9d000; see [the design workflow](../design/BLUENT-V3-PENPOT.md)). Confirm the Primary appearance color for Light and Dark, along with its brand-token rationale, before proposing remediation. No product source, API or CSS was changed in this audit step.

Status boundary: diagnostic evidence only. Design approval and all 18 family parity dimensions remain open; this does not accept Button parity, close #428/#552, or make PR #553 review-ready.
