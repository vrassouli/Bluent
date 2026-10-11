# Bluent v3 — controlled Fluent Button fidelity and Persian RTL design tests (#419)

> **Status: DRAFT, not product parity or accessible runtime approval.** All changes were made in the separate project-owned `Bluent v3 Design System` Penpot file (ID `b64f6665-c9ab-80b5-8008-c4ac99d9d000`). The imported `Microsoft Fluent 2 Web (Community)` library, stable `Dev`, NuGet and public Blazor APIs remain unchanged.

## 1. Equal-content Fluent comparison

**Penpot page:** `24 · Button equal-content comparison` — `e31294c6-7c55-805f-8008-c5af6658c671`.

**Real editable local comparison `VariantContainer`:** `e31294c6-7c55-805f-8008-c5af7f698c58` with two native axes, `Appearance` (Primary, Secondary, Outline, Subtle, Transparent) × `State` (Rest, Disabled) = **10 real reusable native comparison fixtures**. These are **isolated test fixtures**, not additions to the previously audited *core 65 native v3 design variants*. They do not change the core local Button appearance/state family.

**Preview board:** `#419 · Equal-content Fluent Button comparison` — `e31294c6-7c55-805f-8008-c5afb988d983`; contains **10 genuine imported Fluent source instances + 10 genuine local controlled fixture instances**. All 20 links were read back in the live Penpot API and verified, and the board was PNG-exported and visually reviewed.

### Variables explicitly controlled

| Variable | Imported Microsoft Fluent 2 Button | Owned Bluent comparison fixture |
| --- | --- | --- |
| Width × height | **91×32px** Medium icon+label | **91×32px** |
| Label | `Button` | `Button` |
| Text box and icon slot | 41×20px, 20×20px | Same |
| Icon | Original editable **16×16px Fluent path**, centered in its 20px slot | Exact **locally editable copied vector path**, same normalized path-command geometry; imported original untouched |
| Text position | x=38, y=5 from root; 14px font size | Same |
| Icon slot position | x=12, y=6 from root; 6px gap to label | Same |
| Shape/radius, fill, border, text/icon color | Actual upstream light-default appearance/state attributes | Matched from the corresponding upstream source variant, still **draft reference-specific values**, not an approved Bluent semantic token contract |
| Typography | **Segoe UI** declared on source text | **Inter**, the available local Penpot design font. Segoe UI was not found in the connected `penpot.fonts.all` collection |

This study fixes the previous comparison's **10/10 mismatched example labels and 10/10 missing local icons** by controlling those variables in a **separate comparison family**. It does **not** retrospectively remove those gaps from the original native 25-state Button source family, which still documents the true open parity/migration work.

The original Fluent icon was first approximated with a native editable ellipse outline. An actual Fluent source path then became accessible via the connected reference's editable `Path.content`. An **independent path shape was created in the local file for all ten fixtures**, using the exact source commands translated to the fixture's position, with the old approximation hidden. Normalized geometry was compared by relative path coordinates. This preserves the upstream library while making the comparison **exact in native path geometry**, not in optical text rendering.

**Repeatable script:** [`penpot_v3_equal_content_button_audit.js`](../../../scripts/quality/penpot_v3_equal_content_button_audit.js) runs inside the connected Penpot `execute_code` context. It checks both component references, exact ten style×state tuples, local copied path vector color/shape/coordinates, label box positions, fills/borders, font families and mismatch counts.

**Live proof before copying the icon path:** at observed revision **147**, it passed **213 geometry/style/link checks, 0 errors**, with 10 mismatched font families and 10 different icon *primitive types* (ellipse vs path). The updated script was then executed at observed revision **150** after the exact vector-path copy, yielding **233 checks, 0 errors, zero copy mismatches, zero icon primitive-type differences**, but still **10 font-family mismatches**. The drawing was PNG-exported and inspected after the real path replacement.

**Remaining parity gap:** matching both groups' label dimensions and copy **cannot** establish identical Segoe UI glyph metrics or all-mode/brand contrast and responsive layout. The copied source icon is a **reference placeholder**, not validation that all public `Icon` values are correctly handled by runtime Bluent.

## 2. Persian RTL visual direction laboratory

**Penpot page:** `25 · Button Persian RTL typography` — `e31294c6-7c55-805f-8008-c5b0bae3546a`.

**Reusable locally owned `VariantContainer`:** `e31294c6-7c55-805f-8008-c5b0d6e50880`, `Direction` (LTR, RTL) × `Size` (Small, Medium, Large) = **6 source variants**. These are again **experimental design-only fixtures**, not a new public Button component.

**Presentation board:** `#419 · Persian Button mirrored direction and typography` — `e31294c6-7c55-805f-8008-c5b10a9aeae4`. Six preview instances link to the exact owned source variants.

- Uses precisely the same Persian label **`ذخیره تغییرات`** for LTR and RTL to isolate layout direction from copy length.
- Local **Noto Sans Arabic** as a *visual candidate*, **not** an approved product Persian font stack.
- Native editable vector `+` with slot widths **16/20/24px**, target face heights **24/32/40px** for Small/Medium/Large, and **10px** icon-to-label gap.
- For LTR, the icon is **left** of the text; for RTL, **right** of the text. The text's own writing direction stays `rtl` in both cases because it is Persian.
- All six design-content groups were checked by source coordinate readback: center offset **0px**, labels vertically centered with their Button face and matching visual icon placement. The six linked specimens were PNG-exported and reviewed: no visible clipping or overlapping label/icon.

**Verified live results:** at observed Penpot revision **157**, the six RTL/LTR specimens passed the repeatable audit with **98 geometry/text-direction/source-link checks, 0 errors**. The PNG was reviewed and a recovery version `Bluent v3 · #419 exact Button source comparison and Persian RTL 2026-10-11` was saved at revision **157**.

**Repeatable live script:** [`penpot_v3_button_persian_rtl_audit.js`](../../../scripts/quality/penpot_v3_button_persian_rtl_audit.js), checks links, fonts/script direction, mirror side, gap, size and centering. This is a Penpot-only design audit, **not** validation of real `dir=rtl`, focus order, form submission or a screen reader.

## 3. Why these fixtures are not v3 component implementation

- The core design library still has **65 primary reusable visual variants** across five actual local product-facing families, as well as four older one-state native drafts.
- The **10 matched-copy controlled parity fixtures** and **6 Persian direction/typography fixtures** are *additional local design test families*, not claims of 16 new Blazor components or product-level Fluent feature coverage.
- Both boards use native editable shapes and source links; neither produces CSS/HTML, event handling, EditContext semantics or working user interaction.
- The earlier authentic **150 source Fluent Button variants**, default-vs-secondary naming difference and independent Bluent **Danger/Split/Badge/Link/Toggle** APIs remain mandatory migration and compatibility gates.

**Next acceptance work:** choose/license and validate actual typography across Windows, macOS and browser renderers; add controlled source/draft tests beyond Rest/Disabled and Medium; incorporate source icon+label anatomy into the *core* Button variant design only after approved visual semantics; true RTL browser/mobile/zoom/keyboard/forced-colors/contrast and fully exercising demos in individual component issues. #419 stays In progress, [PR #499](https://github.com/vrassouli/Bluent/pull/499) stays Draft, base `bluent-v3`.