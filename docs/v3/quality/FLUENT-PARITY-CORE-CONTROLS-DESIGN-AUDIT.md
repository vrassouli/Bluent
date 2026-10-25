# Fluent parity design-artifact review — core controls

Review date: 2026-10-22. Status: **partial / draft / not approved**.

This review compares the editable Fluent reference boards with the corresponding editable Bluent v3 draft boards in the source-owned Penpot file. It advances the visual and design-artifact dimensions only where a concrete difference is recorded. It does not approve component parity or replace real browser-render screenshots, native screen-reader/OS-contrast evidence, or maintainer design approval.

## Reference baseline and method

- Penpot file: **Bluent v3 Design System**, ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Review map: page `03 · Quality & migration`, ID `07c521b9-e441-80bd-8008-c4ad87df93c3`; board `#552 · Fluent parity audit coverage · DRAFT`, node ID `4d22aead-d6ef-801a-8008-d482b9bb0cc8`.
- Upstream baseline: `@fluentui/web-components@3.1.3`; React fallback `@fluentui/react-components@9.74.10` pinned to the exact checked-in crosswalk tarball; Fluent System Icons `@fluentui/react-icons@2.0.344`. The React latest tag is 9.74.11, but this audit retains the exact 9.74.10 crosswalk snapshot rather than silently changing reference mid-review. See `FLUENT-PARITY-RETRO-AUDIT.md` and `evidence/FLUENT-NPM-REFERENCE-VERSIONS-2026-10-22.json`.
- The Penpot connector did not expose a file revision value; all references below therefore include exact page/node IDs and the review date. Do not infer a revision number.
- The PNG exports were inspected on 2026-10-22. Button's comparison export omits its headings and row/column labels even though those text nodes exist; that export is not usable as final visual-acceptance evidence until it is regenerated or the canvas is independently verified.

## Button — #428

**Editable source and review frames**

- Fluent reference: page `09 · Fluent Button state reference`, page ID `07c521b9-e441-80bd-8008-c4b57568c3ef`; board `#419 · Fluent Button state matrix`, node ID `07c521b9-e441-80bd-8008-c4b5759995ec`.
- Bluent draft: page `22 · Button Fluent parity review`, page ID `e31294c6-7c55-805f-8008-c5a8fb268d03`; board `#419 · Linked Button reference comparison`, node ID `e31294c6-7c55-805f-8008-c5a91188deb7`.
- Pinned counterpart: `fluent-button` from Web Components 3.1.3.

**Finding**

The Fluent reference board contains a labeled state × appearance matrix. The Bluent comparison export renders button faces but omits the heading and row/column labels, although the text nodes remain present and visible in the editable board. The local comparison therefore cannot yet serve as a reliable, self-explanatory acceptance screenshot. Existing Button focus/keyboard/AX findings remain in `FLUENT-PARITY-BUTTON-AUDIT.md`; the separate native button matrix and runtime evidence do not resolve this export defect.

**Disposition**: visual and design-artifact dimensions are `audited_gaps`; regenerate/verify a fully labeled export and complete the appearance × state comparison. Approval remains pending.

## TextField — #432

**Editable source and review frames**

- Fluent reference: page `10 · Fluent Input reference`, page ID `07c521b9-e441-80bd-8008-c4d65ae7b089`; board `#419 · Input Medium states × styles`, node ID `07c521b9-e441-80bd-8008-c4d65b54658b`.
- Bluent draft: page `16 · Bluent TextField variants`, page ID `e31294c6-7c55-805f-8008-c51213e75deb`; board `#419 · Bluent TextField native variant matrix`, node ID `e31294c6-7c55-805f-8008-c512bf412b37`.
- Pinned counterpart: `fluent-text-input` from Web Components 3.1.3.

**Finding**

The Fluent reference shows **4 appearances × 7 states (28 variants)**: Filled Lighter, Filled Darker, Outline and Underline; Rest, Hover, Pressed, Focus, Error, Disabled and Read only. The Bluent draft shows **2 appearances × 5 states (10 variants)**: Outline/Filled and Rest, Focus, Error, Disabled and ReadOnly. The draft is missing Hover and Pressed states, the Underline appearance, and the separate Lighter/Darker Filled variants. This is a visual coverage mismatch; it does not determine whether the current CSS or runtime implementation is correct.

**Disposition**: visual and design-artifact dimensions are `audited_gaps`; resolve the missing appearances/states through design review before implementation. HTML `name`/form serialization and native AT checks remain separately open. Approval remains pending.

## Checkbox — #434

**Editable source and review frames**

- Fluent reference: page `11 · Fluent Checkbox reference`, page ID `07c521b9-e441-80bd-8008-c4d69e1290a6`; board `#419 · Checkbox state × status × style matrix`, node ID `07c521b9-e441-80bd-8008-c4d69e2a5bfe`.
- Bluent draft: page `17 · Bluent Checkbox variants`, page ID `e31294c6-7c55-805f-8008-c51213e87848`; board `#419 · Bluent Checkbox state × value matrix`, node ID `e31294c6-7c55-805f-8008-c51334e865e4`.
- Pinned counterpart: `fluent-checkbox` from Web Components 3.1.3.

**Finding**

The Fluent reference shows **5 interaction states × 3 values × 2 styles (30 variants)**: Rest, Hover, Pressed, Focus and Disabled; Unchecked, Checked and Indeterminate; Standard and Circular. The Bluent draft shows **4 rows × 3 values (12 variants)**: Rest, Focus, Disabled and Error; Unchecked, Checked and Mixed. Hover/Pressed and the Circular style are absent; Error is an additional validation state rather than a replacement for a Fluent interaction state. The browser audit separately confirms that the mixed visual state is not exposed as native `indeterminate`/`aria-checked="mixed"` semantics.

**Disposition**: visual and design-artifact dimensions are `audited_gaps`; add the missing interaction/style variants and review Error as an additive Bluent state. Accessibility remains a confirmed open gap. Approval remains pending.

## Switch — #435

**Editable source and review frames**

- Fluent reference: page `14 · Fluent Switch reference`, page ID `07c521b9-e441-80bd-8008-c4d793a549ff`; board `#419 · Switch state × value × label position`, node ID `07c521b9-e441-80bd-8008-c4d793b68198`.
- Bluent draft: page `18 · Bluent Switch variants`, page ID `e31294c6-7c55-805f-8008-c51213e8a17b`; board `#419 · Bluent Switch direction × state matrix`, node ID `e31294c6-7c55-805f-8008-c5139a9544bf`.
- Pinned counterpart: `fluent-switch` from Web Components 3.1.3.

**Finding**

The Fluent reference shows **5 interaction states × 2 values × 4 label positions (40 variants)**: Rest, Hover, Pressed, Focus and Disabled; Off/On; label before, after, above and no label. The Bluent draft shows **3 interaction states × 2 values × 2 directions (12 variants)**: Rest, Focus and Disabled with LTR/RTL Off/On. Hover/Pressed and the alternate/no-label positions are absent. The local direction variants are useful but do not cover the Fluent reference matrix. The browser audit separately finds checkbox semantics rather than an explicit switch role.

**Disposition**: visual and design-artifact dimensions are `audited_gaps`; add the missing interaction and label-position variants, then validate RTL geometry and activation behavior. Accessibility remains a confirmed open gap. Approval remains pending.

## Cross-family acceptance boundary

- These are editable **draft** frames and concrete design-review findings, not approved designs.
- No product source/CSS, public API or runtime behavior was changed by this design audit.
- `designApproval` remains `pending`; `evidenceBundle` remains `null`; no family is Fluent-approved.
- Remaining evidence includes real browser screenshot comparison across the complete state/appearance matrices, Light/Dark and Brand themes, RTL/Persian and responsive/zoom layouts, forced colors/native OS high contrast, native screen-reader output, and a maintainer decision for each design gap.
