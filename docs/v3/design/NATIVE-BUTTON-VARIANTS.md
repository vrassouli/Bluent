# Bluent v3 — native Button design variants and API extension inventory (#419)

> **Evidence / review status: DRAFT / NOT APPROVED.** Inspected and edited directly in the dedicated `Bluent v3 Design System` Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000` on 2026-10-11. Recovery version **`Bluent v3 · #419 native Button states sizes and API anatomy 2026-10-11`**, verified revision **110**. Everything here is in a task-owned design file; imported Microsoft Fluent 2 source, stable Bluent 2.x `Dev`, released NuGet packages and public Blazor component APIs remain unchanged.

## Live-verified Penpot design artifacts

| Purpose | Page ID | Source VariantContainer ID / illustration board | Preview board ID | Variants | Linked local preview instances |
| --- | --- | --- | --- | ---: | ---: |
| Medium Button **Appearance × State** | `e31294c6-7c55-805f-8008-c58ffcf22e07` | `e31294c6-7c55-805f-8008-c5900fba48e4` | `e31294c6-7c55-805f-8008-c5907590b592` | **25** | **25** |
| Button **Size × Layout** | `e31294c6-7c55-805f-8008-c590b2678162` | `e31294c6-7c55-805f-8008-c590d62d466d` | `e31294c6-7c55-805f-8008-c590fe0982cf` | **6** | **6** |
| Bluent-specific Button API feature sketches | `e31294c6-7c55-805f-8008-c5912770e8ab` | `e31294c6-7c55-805f-8008-c591278b98dd` | Same editable board | **0** (8 editable noninteractive illustrations) | **0** |

All **31 native Button variants** were read back live with exact axes, nonduplicated combinations, and all **31 presentation instances** were checked with `isComponentInstance()` and their `component().id` matching a source variant ID from their respective **local Bluent** Penpot family. All three boards were PNG-exported and visually inspected. The linked **25 upstream Fluent 2 Button reference** variants from the earlier #419 work are **separate** and unchanged.

### State and appearance matrix (25 native variants)

- `Appearance`: **Primary, Secondary, Outline, Subtle, Transparent**.
- `State`: **Rest, Hover, Pressed, Selected, Disabled**.
- One example for each of the **5 × 5 = 25 combinations**, within a **single real native variant family**.
- Token-bound source light default `bluent.color.brandBackground` used for the base **Primary/Rest** face/border; additional state colors and foreground choices are *design-only literal values* pending the final #417/#418 architecture and accessible Brand × Mode theme.
- Images show visually distinct rest/hover/pressed/selected/disabled states. They do **not** implement transitions, native button semantics, keyboard focus, actual hover CSS or a tested toggle behavior.

**Penpot API caution:** changing the **main variant instance's `name`** after creating the family caused Penpot to **erase its `variants.properties` and reset `variantProps`**. The 25 source components remained present. We restored two variant axes, re-established all 25 **unique** tuples, and restyled/verified them. Do not rename a `VariantComponent.mainInstance()` to customize a display label; use the enclosing family name and `setVariantProperty()`, then *always read back* axes and all tuples before claiming success. The preview board itself uses safe per-instance display names. The final live verification returned **25/25 unique linked variants**, not the transient corrupted state.

### Size and layout matrix (6 native variants)

- `Size`: **Small, Medium, Large**.
- `Layout`: **Icon and label, Icon only**.
- All **3 × 2 = 6** local reusable variants use editable native rectangles and text/icon-placeholder glyphs. Design height intent: **24px, 32px, 40px** respectively; widths respond to content/layout. These are *Fluent-aligned draft dimensions*, not a proven accessible touch-target policy or guaranteed current Bluent browser dimensions.
- The `+` icon is an illustrative **text glyph** in Penpot and is **not** evidence of a real Fluent icon asset, CSS icon-font parity or runtime icon rendering.

## Existing Bluent API mapping: preserve more than imported Fluent

Actual source inspected: `src/Bluent.UI/Components/ButtonComponent/Button.razor.cs`, `Button.razor`, `ButtonAppearance.cs`, `ButtonShape.cs`, `ButtonSize.cs`.

| Existing public Bluent API | Current source facts | v3 design / migration decision still needed |
| --- | --- | --- |
| `ButtonAppearance.Default / Primary / Danger / Outline / Subtle / Transparent` | **Six existing enum values**. Imported Fluent 2 references use `Secondary (Default)` where Bluent calls it `Default`; Bluent also has **Danger**. | Do not remove Danger or silently rename Default; define semantic aliases and compatibility/migration explicitly. The first *native* 25-state set currently labels Default's conceptual counterpart **Secondary**, pending acceptance. |
| `ButtonSize.Small / Medium / Large` | Three existing size names; Medium default. | Current heights/density vs Fluent 24/32/40; zoom/reflow, minimum targets, layout |
| `ButtonShape.Rounded / Circular / Square` | Three shapes; Rounded default. | Circular/Square require real variants and RTL/icon-only tests beyond a single visual sketch |
| `Text`, `Icon`, `SecondaryText`, `Orientation`, `Rotated` | Combines icon/text or stacked secondary text; vertical and rotated classes used. | Design compound/vertical/icon-only and preserve original text/icon public API |
| `Href` | Tag changes from `button` to `a` when populated. | Verify link semantics, disabled link behavior, keyboard and router navigation separately |
| `Toggled`, `ToggledChanged` | Nullable toggle state and callback in click handler. | Define Selected visual semantics; test controlled binding, re-render and screen-reader state |
| `Badge`, `BadgeHorizontalPosition`, `BadgeVerticalPosition` | RenderFragment badge + positioning. | Dynamic badge content, clipping, RTL logical placement, announcement |
| `Dropdown`, `ShowDropdownIndicator`, `DropdownPlacement` | Parent `Popover` / dropdown and split control branches. | Test portal theme inheritance, pointer/keyboard, close/focus, nested popover, escape, mobile |
| `OnClick`, `Compact`, `Shape`, `Size` | Split branch uses `ButtonGroup` when both `OnClick` and `Dropdown` supplied. | Distinguish primary and menu action, disabled propagation, responsive compact presentation |

The **third Penpot board** illustrates eight specifically Bluent-relevant scenarios: **Danger, Circular/Square, Toggle/Selected, Link/Href, Badge, Compound/SecondaryText, Dropdown, Split**. The drawings are editable source-native shapes and text but **not executable controls, published variants, functioning menus or API acceptance**. Each case must be implemented and demonstrated under its own component issue before Bluent v3 final approval.

## Source/API baseline regression guard

An executable source inventory checker was added as `scripts/quality/check_v3_button_api_baseline.py`:

```powershell
python scripts/quality/check_v3_button_api_baseline.py
```

It verifies the **existing** six `ButtonAppearance` values, three sizes, three shapes, 20 declared Button public parameters and six source-render mechanisms (link, split, popover, icon, badge, secondary text). The checker currently exits successfully: **0 missing baseline members**. It is a **textual presence check only**; it does **not** establish that future v3 components behave correctly, or that a method and event binding is backward compatible. Source/API mismatches after intentional approved migration require explicit checker and migration-document updates.

**Attempted visual parity board:** a separate Penpot page was planned to place exact Fluent and Bluent Button examples side by side for measurable review. The Penpot plugin browser tab suspended before the operation completed, so **no successfully created/verified comparison board is claimed**. The existing individually exported Fluent upstream and Bluent native Button matrix boards remain available. A comparison must use the same button label and layout to interpret width/height differences fairly.

## Alignment remediation (maintainer-reported design defect)

The first v3 Button size/layout specimens **were not acceptably aligned**: the Small Button's 33px glyph box extended 9px below its 24px face. In the live Penpot source we replaced the decorative `+` text with a centered, editable **vector cross** and fixed icon slots for Small/Medium/Large; recalculated icon+label gaps and frame centers; and corrected the 25 appearance/state labels horizontally and vertically. The imported upstream Fluent components remained untouched.

Our first experiment using a Penpot `FlexLayout` exposed a plugin/render synchronization problem: the Small caption vanished in the exported board. We removed that flex layout and used deterministic geometry instead. **Do not advertise this draft as responsive auto-layout.** We confirmed the final small/medium/large icon positions visually on the exported board and with the 910-check [Penpot geometry scanner](../../../scripts/quality/penpot_v3_alignment_audit.js). The other source families and original drafts also received fixes. See the [full alignment-quality audit](ALIGNMENT-QUALITY-AUDIT.md) and named Penpot recovery revision **122**.

**New visual and responsive design evidence:** the project-owned [side-by-side reference/Blent comparison](BUTTON-PARITY-REVIEW.md) now has 10 real imported Fluent + 10 native linked Button instances (five appearances × Rest/Disabled). Its audit found 10 mismatched example strings and 10 native-icon gaps, so **pixel parity is NOT approved**. The [responsive Penpot constraints lab](BUTTON-RESIZE-REVIEW.md) corrected the six native size/layout sources: icon+label faces stretch with centered content, while icon-only faces stay square and centered. Its final 18-case, 145-check live Penpot test passed with no geometry errors. Neither is a Blazor/browser accessibility certification.

## Full-parity and accessibility gates still open

1. Source Fluent 2 upstream Button offers **150 variant combinations** (2 layouts × 3 sizes × 5 states × 5 styles). Our **25 appearance/state** and **6 size/layout** native families cover *two complementary 2-axis slices*, **not 31 unique combinations of the upstream 150-product Cartesian space**. Other axes and their cross-interactions are not implemented yet.
2. `Default` → conceptual `Secondary` and `Danger` behavior require explicit maintainer/ADR approval, with a compatibility table for current consumer markup.
3. Design complete variants for Shape, rotated/vertical, compound text, toggle, dropdown/split, badge and icon/source glyphs. Test all ten existing brand bundles in Light/Dark rather than assuming default brand applies globally.
4. Focus-visible, forced-colors, contrast, keyboard events, ARIA checked/pressed/expanded, disabled handling, link semantics, reduced-motion, zoom/reflow, RTL and localization need **real Blazor/DOM/browser/AT tests**. Penpot static images cannot prove them.
5. Build a true full-feature component demo, documentation, migration guide and skill only under the individual component issues after #417 styling ADR is approved and #418 tokens satisfy their own workflow gate.

**Issue #419 remains In progress**, [PR #499](https://github.com/vrassouli/Bluent/pull/499) stays **Draft**, with all work on `v3/issue-419-penpot-library` targeting `bluent-v3` only. The machine-readable IDs in [the Penpot manifest](penpot-workspace.manifest.json) are repository bookkeeping, not independently executed live Penpot tests.