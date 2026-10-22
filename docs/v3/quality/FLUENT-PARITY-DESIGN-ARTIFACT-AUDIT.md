# Design-artifact coverage audit - Issue #552

Review date: 2026-10-22. Source baseline: 73155f02.

## Scope

Read-only inventory of the connected source-owned Penpot file Bluent v3 Design System. Snapshot: [PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json). No Penpot shapes were edited.

## Findings

- The #552 Fluent parity audit coverage DRAFT board exists on 03 · Quality & migration (page id 07c521b9-e441-80bd-8008-c4ad87df93c3, board id 4d22aead-d6ef-801a-8008-d482b9bb0cc8).
- The board contains 18/18 family rows, 239 source-known API entries, and 0/18 Fluent approvals. It is a coverage/index artifact, not component-design approval.
- The local Penpot library contains 13 components spanning four family types: Button, TextField, Checkbox and Switch.
- Dedicated family-specific editable variant pages/assets are present for 4/18 family types. 14/18 have no dedicated family page/library asset in this snapshot; upstream Fluent reference pages and the #552 coverage row do not substitute for a Bluent family design.
- All family design approvals remain pending and all evidenceBundle values remain null.

**Status: audited gaps, not accepted.** The inventory is not a visual parity verdict and does not authorize product implementation.

## Family coverage

| Family | Penpot artifact coverage | Existing design page count | Coverage-board gap | Approval |
|---|---|---:|---|---|
| Button | draft-family-artifacts-present | 8 | Behavior/state/AX gaps; focus and API review open. | pending |
| Icon | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Custom SVG sizing and unnamed-image gaps; API docs mismatch. | pending |
| Label | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Info action inherits parent label name instead of an action-specific name. | pending |
| Link | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Disabled anchor stays tabbable but loses link/disabled semantics. | pending |
| Badge | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | AnimateShadow remains 1.5s infinite under reduced-motion emulation. | pending |
| TextField | draft-family-artifacts-present | 1 | HTML name is empty; form serialization remains untested. | pending |
| Checkbox | draft-family-artifacts-present | 1 | Visual indeterminate state is announced unchecked in browser AX. | pending |
| Switch | draft-family-artifacts-present | 1 | Browser AX reports checkbox semantics, not explicit switch role. | pending |
| NumericField | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Step has no effect; float/decimal, limits and form serialization remain open. | pending |
| RadioGroup | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Group ignored in AX; ArrowRight crosses into the next group. | pending |
| SelectField | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Native ArrowDown path only; custom option/ARIA states remain open. | pending |
| DateField | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | DateClass no-op; YearSelect mask/format mismatch; typed Min/Max bypass. | pending |
| TimeField | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Culture affects parsing, not formatting; locale edge cases remain open. | pending |
| MaskedField | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | 09123456789 becomes 0991-234-5678 under the fixed-prefix regex. | pending |
| OtpField | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | Inherited addons/size no-op; English labels and native clipboard/AT remain open. | pending |
| Slider | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | No native role/tabindex/keyboard semantics; visual and forced-colors gaps remain. | pending |
| RangeSlider | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | No dedicated Fluent range tag; dual-thumb semantics/keyboard/visual gaps remain. | pending |
| FileSelect | coverage-row-only-no-dedicated-family-asset-in-snapshot | 0 | MaxFiles=2 accepts 3 files; disabled input and remove-name gaps remain. | pending |

## Existing family-specific draft pages

### Button (#428)

- **02 · Component anatomy** — page id 07c521b9-e441-80bd-8008-c4ad87dee26e; board #419 · Button design mapping · DRAFT (id 07c521b9-e441-80bd-8008-c4ae9e63585f)
- **19 · Bluent Button native variants** — page id e31294c6-7c55-805f-8008-c58ffcf22e07
- **20 · Bluent Button sizes and layout** — page id e31294c6-7c55-805f-8008-c590b2678162
- **21 · Button Bluent-specific API anatomy** — page id e31294c6-7c55-805f-8008-c5912770e8ab
- **22 · Button Fluent parity review** — page id e31294c6-7c55-805f-8008-c5a8fb268d03
- **23 · Button resize stress laboratory** — page id e31294c6-7c55-805f-8008-c5aa0da135fb
- **24 · Button equal-content comparison** — page id e31294c6-7c55-805f-8008-c5af6658c671
- **25 · Button Persian RTL typography** — page id e31294c6-7c55-805f-8008-c5b0bae3546a

**Follow-up:** Extend the existing draft family designs to the full state/appearance/size/RTL matrix and obtain explicit Fluent parity approval.

### TextField (#432)

- **16 · Bluent TextField variants** — page id e31294c6-7c55-805f-8008-c51213e75deb

**Follow-up:** Extend the native variants to focus, filled, invalid, disabled, RTL, high contrast and validation states; record Fluent counterpart and approve.

### Checkbox (#434)

- **17 · Bluent Checkbox variants** — page id e31294c6-7c55-805f-8008-c51213e87848

**Follow-up:** Complete checked, mixed, disabled, focus, required and RTL variants with explicit Fluent state mapping and approval.

### Switch (#435)

- **18 · Bluent Switch variants** — page id e31294c6-7c55-805f-8008-c51213e8a17b

**Follow-up:** Complete on/off, disabled, focus, RTL and forced-colors variants with an explicit Fluent role/state decision and approval.

## Families without a dedicated family-specific asset in this snapshot

Badge, DateField, FileSelect, Icon, Label, Link, MaskedField, NumericField, OtpField, RadioGroup, RangeSlider, SelectField, Slider, TimeField.

For each, create an editable Bluent family board and variant set tied to the pinned Fluent counterpart, covering the required visual and interactive states. Keep the current coverage row as traceability only.

## Acceptance boundary

All 18 designArtifact dimensions are recorded as audited_gaps. Do not move any family to approved/accepted based on the coverage board, upstream references, or browser screenshots alone. Design review must confirm the family-specific editable artifact and explicit state/token mapping first.
