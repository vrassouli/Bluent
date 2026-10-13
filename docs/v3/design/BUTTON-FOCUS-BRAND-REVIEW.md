# #501 / #418 — Selected brand-colored Button focus and underline-only TextField

**Review received 2026-10-13 from the maintainer after actually testing the live v3 Styling Lab.**
The existing **brand-colored Button focus ring** was explicitly preferred over black/white Focus2 and Focus2 double-ring. The separate rectangular outline on TextField was rejected because Bluent already has a 2px animated bottom underline. This is the selected visual direction, **not** a claim that brand focus achieves every accessibility contrast threshold.

## Actual Penpot implementation, not just a description

**Canonical editable file:** Bluent v3 Design System, `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
**Page:** `38 · Button Focus Visible states · #501`, `535db143-a732-807e-8008-c64d2fb91b9a`.
**New editable board:** `REVIEW DECISION · Brand Button Focus + Field Underline · #418 #501`, `94a03b1b-8cb6-8091-8008-c8b9bae47e45`, at (100, 5420), size 1480×720, 28 native Penpot children.

The board was created in the actual Penpot plugin. **PNG exported and visually inspected**: two side-by-side independent Light and Dark specimens with a branded single-ring Button and a separate TextField whose only active focus indicator is a 2px bottom underline, not an outer ring. The Light outer Button stroke is bound to existing real Penpot semantic token `bluent.semantic.border.focus` and resolves to `#1267B4`; the Dark source snapshot is `#18599B`. No new token API or source kit overwrite was introduced.

The two Button outer ring rectangles were then corrected and read back in Penpot: 2px strokes with **exactly 3px symmetric vector edge padding** from the 225×47px Button face on *all four* sides, representing the existing 2px CSS outline at 2px offset. The two TextFields each have their neutral border and a 2px solid branded bottom indicator, with **no second focus rectangle**. The exported PNG was checked for text, border and stroke position. The Dark board includes a warning that its focus contrast is not yet signed off.

**Important scope protection:** the already existing source-owned 10 native Appearance×Focus and Danger Focus2 candidate variants and their actual Black/White token bindings were **preserved intact**. They and their dedicated candidate TokenSets remain research alternatives, not approved default design. This new board makes the maintainer's *selected* default explicit without destructively changing a draft native component family or silently invalidating previous #501 audits. #428 (still Backlog) owns production Button behavior and final migration.

## Repeatable live read-only verification

Run `scripts/quality/penpot_v3_button_brand_review_audit.js` in the connected plugin with the correct file. It checks the board identity, 28 descendant shapes, Light and Dark face/ring/underline pairs, actual brand colors, four-sided 3px ring geometry, 2px strokes, source-linked Light semantic token, and the explicit experimental/contrast caveats. Unlike a screenshot alone, this confirms Penpot editable shape and token properties. This is a **new board audit**, not a replacement of the previous black/white Focus2 candidate family audits.

## Code/demo verification

In the #418 task branch (separate PR #500), the opt-in real Blazor Styling Lab retained brand-colored Button `:focus-visible` while removing the extra full outline from `.bui-field:focus-within`. Existing TextField `::after` bottom underline remains functional; its border is mapped to the OS system `Highlight` in emulated forced-colors, no extra frame. Real Chrome/WASM entire probe passed **592/592**, including Light, Dark and Forced Colors native TextField computed-style checks. Bluent stable 2.x, public Button/TextField component APIs and the library's source field CSS were untouched.

## Open design/accessibility decisions

- Previous brand focus vs studied Dark backgrounds had only **1.94–2.15:1** contrast, short of the 3:1 review target. Do not automatically replace the user's chosen branded ring with neutral Focus2: design and verify a **brand-faithful accessible color/dual-surface fallback** before shipping.
- No real Windows OS accessibility, assistive technology/screen reader, or native browser zoom signoff is asserted. TextField normal underline visibly exists in the Blazor demo; the design board shows a **static focused frame**, not an animation.
- Penpot tab re-suspended while attempting to open the page-07 Accessibility/RTL board after the new page-38 specimen was built, exported and tested. **Do not claim a new page-07 edit**. This is an independent board on page 38; the prior page-07 alignment fixes remain preserved.

### Native design status

`#501` returned from **Review → In progress** when the maintainer requested this concrete design revision; PR #502 was marked Draft pending the updated evidence. Do not set Done without review acceptance and merge into `bluent-v3` only; nothing may merge into stable `Dev` or be published as v2 NuGet.
