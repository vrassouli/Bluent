# Bluent v3 — native Penpot form-control variant sets (#419)

> **Status: DRAFT / not approved** · Working Penpot file: `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`) · Last named design-file recovery version: **`Bluent v3 · #419 native form-control variants reviewed 2026-10-10`**, verified Penpot revision **89**.
>
> These are **actual editable, local Penpot library variant components**, rather than flattened images or simple copies of the upstream Fluent 2 kit. We constructed real `VariantContainer` sets using `combineAsVariants()`, named each variant axis in the Penpot API, expanded combinations with `variants.addVariant()`, then verified the preview instances remain connected to their own exact local source variants. Their visual references were PNG-exported and inspected. All are **design candidates** awaiting accepted #417 CSS architecture, #418 token contract and separate per-component implementation/review.

## Exact connected assets and counts

| Local family | Penpot page ID | Native variant container ID | Presentation board ID | Variant axes | Unique combinations | Linked local previews |
| --- | --- | --- | --- | --- | ---: | ---: |
| TextField | `e31294c6-7c55-805f-8008-c51213e75deb` | `e31294c6-7c55-805f-8008-c51241e2236b` | `e31294c6-7c55-805f-8008-c512bf412b37` | `State`, `Appearance` | **10** | **10** |
| Checkbox | `e31294c6-7c55-805f-8008-c51213e87848` | `e31294c6-7c55-805f-8008-c512f68f2d1e` | `e31294c6-7c55-805f-8008-c51334e865e4` | `Status`, `State` | **12** | **12** |
| Switch | `e31294c6-7c55-805f-8008-c51213e8a17b` | `e31294c6-7c55-805f-8008-c51360ccbff0` | `e31294c6-7c55-805f-8008-c5139a9544bf` | `Checked`, `State`, `Direction` | **12** | **12** |
| **Total** | 3 new design pages | **3 native variant sets** | 3 real design boards |  | **34** | **34** |

All **34** variant components were read back from Penpot; the applicable axis tuple for each family was unique (no duplicate/missing combination), and all **34** presentation instances returned `isComponentInstance() == true` with a `component().id` within the matching native variant set. The local library now reports **7 component-family entries**: the previous four single-state drafts plus these three native variant families. This **does not** mean 7 public Blazor components, 34 approved production states, or complete Fluent 2 parity.

## Native TextField: five states × two appearance candidates

- `State`: **Rest, Focus, Error, Disabled, ReadOnly**.
- `Appearance`: **Outline, Filled**.

The **10 distinct variants** live in a genuine locally owned variant set. Visuals use editable native field label, placeholder, border and surface shapes; focus has a brand-color intent, error has red border, Disabled uses neutralized contrast, ReadOnly preserves an ordinary visual surface. The two appearances are **candidate visual contracts**, not a new Bluent `Appearance` parameter. The existing public `TextField` currently has inherited `FieldSize`, multiline `Rows`/textarea, addons, Persian/digit conversion, binding and validation behaviors which **are not** implemented by the Penpot variant shapes.

The design's example Medium-height field is **not** a proof of minimum touch-target sizing, RTL text editing, error announcements, or keyboard focus. All ten shown instances link to the local variant sources, not to the upstream `Input` library component.

## Native Checkbox: three statuses × four interaction/error states

- `Status`: **Unchecked, Checked, Mixed** (visual representation of a nullable Boolean `null`).
- `State`: **Rest, Focus, Disabled, Error**.

The **12 variants** use a native component status/state set. In the visual design, Checked renders a checkmark, Mixed renders a horizontal bar and Unchecked is empty. The Focus row has an **extra native focus outline** on all three statuses; the board was re-exported after this correction.

**Critical API distinction:** Existing `Checkbox<TValue>` supports `bool` and `bool?` with a nullable/indeterminate visual class, but the current `Toggle()` source sends `null` to `true`, not an automatic three-state cycle. A static design state does not approve how users cycle values, how `aria-checked=mixed` or DOM `indeterminate` is set, how labels activate or whether Disabled is fully guarded. These remain real browser/assistive-technology acceptance gates in the dedicated component issue.

## Native Switch: two values × three states × two directions

- `Checked`: **Off, On**.
- `State`: **Rest, Focus, Disabled**.
- `Direction`: **LTR, RTL**.

The **12 variants** are a real local component family; they are not imported source instances. The RTL specimens use **editable Persian text** (`اعلان‌ها`), right-aligned text and opposite label/track placement. The knob position also mirrors with direction; focus has a distinct outline. Persian previews use the Penpot canvas **Noto Sans Arabic** font, not an approved application font stack.

A static Penpot RTL example does **not** certify correct keyboard order, click target, `role=switch` versus native checkbox semantics, label-before/after API, real logical CSS behavior or reduce-motion. These must be reviewed on working Blazor controls. No public API was changed.

## Token and provenance notes

- The three new variant families coexist with the previous draft single-state native `Button`, `TextField`, `Checkbox`, `Switch` components. They are **additional reusable variant sets**, not replacements or new product-level C# components.
- **15 additional design-token fill bindings** were applied where the draft light-theme brand/background semantics matched the visual intention (selected checked/On, default Outline surface, Focus border). State-specific disabled/error/filled colors still include **explicit unapproved local swatch values** and need complete semantic token mapping under #418.
- Every image proof is a **Penpot render**. It cannot validate computed CSS, accessibility, contrast for all brands/modes, runtime transitions, form validation, native focus behavior or responsive zoom.
- The original `Microsoft Fluent 2 Web (Community)` Penpot reference (`b64f6665-c9ab-80b5-8008-c3cd9685a0a0`) was **not edited**. Its 134 genuine *source-linked* reference matrix instances remain distinct from these **34 Bluent-owned linked design previews**.
- The first two native variants were merged using `combineAsVariants()`, and subsequent variants were added using Penpot's `Variants.addVariant()` before individually setting variant axis values. We explicitly **verified all 34 axis tuples and instance links** because newly added variants can initially report placeholder axis values until the next plugin update.
- The completed TextField, Checkbox and Switch presentation boards were PNG-exported and visually inspected. We corrected TextField row labels that overlapped the linked field specimen, expanded matrix row widths that clipped components, adjusted Persian text widths, and added explicit Checkbox focus outlines across all statuses. These corrections are part of the final named recovery version.

**Follow-up:** Two additional local **Button** variant families were implemented after this form-control research: 25 appearance/state and 6 size/layout combinations, with 31 linked local previews in a separate Penpot design board, plus eight editable Bluent-specific API sketches. These are documented in [native Button variants](NATIVE-BUTTON-VARIANTS.md). The workspace now contains **five native variant families / 65 combinations**, not just the three form-control families described above. All remain draft.

**Alignment repair:** Following maintainer review, all source variants in this document had their editable text/indicator/knob frames aligned to their control faces. This corrected 10 TextField placeholder, 8 Checkbox glyph and 12 Switch label initial center/overflow flags (within the original 37-flag audit). The [live Penpot alignment gate](ALIGNMENT-QUALITY-AUDIT.md) now reports 0 errors across 910 geometry checks, but this does **not** approve keyboard or typography parity.

## Open acceptance gates

1. **#417** architecture D1–D4 approval: theme scope, CSS layers, semantic aliases and utility migration.
2. **#418** design-to-runtime token contract: 10 brands × Light/Dark, error/disabled/surface semantics, focus contrast, typography, RTL and density.
3. Full component visual coverage (source `Input` has 84 variants, `Checkbox` 30, `Switch` 40; this local slice intentionally is **not** full parity): sizes, shapes, before/after/above label options, hover/pressed, textarea, all error states and accessibility.
4. Actual Blazor keyboard/AT/runtime tests: `InputBase<TValue>` validation, mixed Checkbox DOM state and transitions, Switch role/label and RTL activation, focus in forced colors, reduced motion, reflow and SSR.
5. Individual component design → implementation → full demo/docs/Skills/migration workflow and status gates. This work stays entirely on `v3/issue-419-penpot-library`, draft [PR #499](https://github.com/vrassouli/Bluent/pull/499) targeting `bluent-v3`. **No changes to stable `Dev`, released NuGet or public Blazor component code.**

The machine-readable page/container IDs and draft-only status are also recorded in [`penpot-workspace.manifest.json`](penpot-workspace.manifest.json); its offline integrity test **does not independently verify the live Penpot file** and must never be cited as runtime design parity proof.