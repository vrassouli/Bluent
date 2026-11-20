# #418 · Penpot button-label visual centering correction

**2026-10-11.** Reported by maintainer: text in the two newly authored #418 Penpot boards appeared above center and some labels were not horizontally centered.

**Authoritative editable source:** Bluent v3 Design System, Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. These are *native editable design elements*, not shipped Bluent.UI component CSS or a final typography font approval.

## Corrected shapes

| Penpot page | Actual background / label | Horizontal text-center offset | Vertical text-center offset |
|---|---|---:|---:|
| 34 · Concurrent brand-scoped theme hosts · #418 | Excel Primary Button | 0 px | 0.20 px |
| 34 | Word Primary Button | 0 px | 0.20 px |
| 35 · Persian validation states and reflow · #418 | Light disabled «ذخیره تغییرات» | 0 px | 0 px |
| 35 | Dark disabled «ذخیره تغییرات» | 0 px | 0 px |
| 35 | Multiline «ارسال گزارش‌های تأییدشده ...» | 0 px | 0 px |

- **Page 34:** `acf5f619-7d81-80da-8008-c60b3680e7e2`, board `acf5f619-7d81-80da-8008-c60b36beac74`. Both `Real Button · Primary` labels originally had auto-width, **left-aligned** text near the top of their filled rectangle. They now have explicit fixed layout, horizontal and vertical center alignment, and their measured rendered `textBounds` is centered against the actual 245×62 px button rectangles.
- **Page 35:** `916ee53e-8991-8009-8008-c61c0754ce9d`, board `916ee53e-8991-8009-8008-c61c075e54cc`. The two Persian disabled labels were initially **10 px high** relative to their actual content bounds, while the multiline RTL label was **14.20 px high and right-aligned**. A naive `verticalAlign=center` was insufficient in Penpot for locally rendered Noto Sans Arabic: the first rerender still placed visible glyph bounds high, and the RTL multiline label had an off-center horizontal ink box. Final adjustments therefore used the **rendered `Text.textBounds`** measured after reflow and center-corrected the actual editable text shape (not the frame alone). The multiline ink is fully within its blue button after correction.

**Verification:** After rendering the revised boards, the native Penpot measurements for all five showed that the center of the rendered text bounding box matches the center of the colored button, with error **≤ 0.21 Penpot px on either axis**. All five rendered text bounds stay within their respective colored backgrounds. Both boards were individually exported to PNG **after changes** and visually inspected; labels are centered, including the multiline RTL label.

**Important distinction:** This fixes *design-asset* centering. It does **not** change any Button C# component, CSS/SCSS, runtime application, font packaging, or existing stable 2.x code. The #418 experimental runtime Chrome probes previously passed the geometric Blazor icon/text checks; a native optical typography/font approval is still pending.

## Repeatable design QA criterion

For each Penpot Button reference rectangle and associated editable label, compare:
`label.textBounds.{x,y,width,height}` against `button.{x,y,width,height}` **after** Penpot has completed a rerender. Horizontal and vertical content-center offsets should be ≤ 1 px at design scale. Check that the text bounds are inside the button. For Persian and multiline RTL labels, neither a centered text-frame nor Penpot's `verticalAlign` setting alone proves visual centering; inspect the exported PNG as well. Keep this check for future #416 component designs.
