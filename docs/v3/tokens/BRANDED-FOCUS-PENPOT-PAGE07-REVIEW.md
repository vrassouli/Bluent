# #418 Brand-focused keyboard ring: source-owned Penpot page 07 review

2026-10-13. This is an actual design-tool revision and contrast experiment, NOT an approved production color, WCAG certification or a v2 CSS change.

## Existing maintainer-selected appearance

The maintainer prefers the existing brand-colored keyboard Focus Visible ring around Buttons rather than black/white or two-stroke Focus2. TextFields must retain their normal animated 2px bottom border as the only focus decoration, without an extra rectangular ring.

Authoritative Penpot file: Bluent v3 Design System; ID b64f6665-c9ab-80b5-8008-c4ac99d9d000.
Page: 07 · Accessibility & RTL; ID 07c521b9-e441-80bd-8008-c4b24ce6f58c.

The original editable page-07 Accessibility/bidi source board, ID 07c521b9-e441-80bd-8008-c4b32a4e1bec, remains intact except for TWO additional 2px brand-colored bottom-edge underline rectangles aligned exactly to the existing LTR and RTL TextField faces. No additional field border ring was created. Existing text vertical alignment and Buttons were preserved.

New native Penpot board on page 07:
- Name: REVIEW · LTR RTL Field Underline and Branded Dark Ring · #418
- ID: 94a03b1b-8cb6-8091-8008-c8ea9cc25c83
- Position (100,1240), 1440x660, with 37 actual editable Penpot shapes.
- Light specimen: Default brand ring #1267B4 versus #FFFFFF: 5.79:1. Field uses a 2px brand bottom underline, no extra outline.
- Dark baseline specimen: existing brand ring #18599B versus #292929: 2.04:1; real field underline color #4F82C8.
- Dark candidate: SAME brand hue family, using existing emitted Fluent colorCompoundBrandStroke #4F82C8 vs #292929: 3.71:1; TextField underline remains #4F82C8.
- All three Button rings use one 2px stroke symmetrically 3px outside their respective Button face, not a black/white or double-ring replacement.

The board PNG was ACTUALLY exported and inspected. Penpot read-only vector audit passed 28/28 checks with zero failures for sizes, symmetrically aligned rings, 2px field-only underlines, colors, ratio captions and LTR/RTL source faces. Re-run via scripts/quality/penpot_v3_field_brand_focus_review_audit.js in the connected canonical Penpot plugin. Running node --check proves only JavaScript syntax, not the live Penpot geometry.

## Numerical 10-brand source contract

Run python scripts/quality/audit_v3_brand_focus_candidate.py. It reads the actual emitted brand theme source CSS files, 10 brands times Light/Dark, and compares existing colorBrandBackground and colorCompoundBrandStroke against colorNeutralBackground1.

Light neutral background: existing branded focus is between 5.55:1 and 6.11:1; current and compound source are exactly the same.
Dark neutral background: existing branded focus 1.94:1 to 2.15:1, below the 3:1 focus contrast review goal. Existing per-brand colorCompoundBrandStroke is between 3.55:1 and 3.89:1, preserving the familiar brand hue. Five separate Python tests check source count, old contrast shortfall, original Light parity, numerical dark candidate ratios and contrast formula.

These ratios are limited to the actual neutral opaque host in the emitted theme. They do not establish contrast against Primary or other filled/translucent/gradient surfaces or state variants. Contrast theme, actual keyboard navigation, real zoom and native assistive technology require separate evidence. Dark candidate must NOT silently replace the user-selected default, and source #418 opt-in prototype colors remain unapproved. The original black/white Focus2 research remains preserved.

The selected Button design lives in #501 Penpot page 38, board 94a03b1b-8cb6-8091-8008-c8b9bae47e45. This new page-07 artifact is foundation #418 research, not an unauthorized implementation of #419 (Backlog). All repo work is kept on v3/issue-418-design-tokens and PR #500 -> bluent-v3; no Dev or stable NuGet changes.
