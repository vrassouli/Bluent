# #418 — Approved system-font continuity and rollback

**Decision:** 2026-10-16. **Scope:** maintainer-approved interim compatibility
for v3, not final Persian glyph, native OS/AT or public typography API signoff.

## Editable design and versioned sources

The original native typography token bluent.type.family.base in the Penpot
Bluent v3 Design System file (b64f6665-c9ab-80b5-8008-c4ac99d9d000)
stores a **single quoted** family "Segoe UI" and resolves exactly to
Segoe UI, no longer Segoe,UI. The research board is page 42
(e775e67c-d9da-804b-8008-cb84059cbdab) and board
(e775e67c-d9da-804b-8008-cb8405b790a5).

The existing source CSS --fontFamilyBase begins with quoted Segoe UI,
preserves the existing source fallback list and is identical in all
10 brands and Light/Dark. No v2 CSS was changed by this decision.

Machine-readable acceptance snapshot:
docs/v3/tokens/issue-418-system-font-continuity.json.
This captures the **expected** Penpot source; GitHub CI cannot query live
Penpot. The separate connected-native read-only Penpot audit must still
run for design-source verification.

## CI / regression checks

From repository root:

    python -m unittest discover -s scripts/quality -p test_v3_system_font_continuity.py -v
    python scripts/quality/audit_v3_system_font_continuity.py

These enforce 20 CSS source stacks and the three existing Fluent System
Icons font binaries. They fail if new body-text font binaries appear under
the Bluent.UI static font resource tree, but must NOT delete the three
existing icon fonts. Seven positive/negative controls cover source drift,
missing theme, bad Penpot expected serialization, added text fonts, missing
icons and unsupported accessibility approval.

The tests never read, copy or distribute font-file bytes. They cannot
prove optical Persian shaping, platform glyph selection, font fallback
availability, screen-reader handling or native Windows Contrast Themes.

## Migration and safe rollback

1. **Stable 2.x:** No change. Preserve current Segoe UI-first system stack
   and the packaged icon fonts. Do not add font packages, downloads or
   v3 production defaults as part of this issue.
2. **v3 opt-in previews:** Keep the existing theme source and isolated
   opt-in token bridge. Penpot-only Inter and Noto Sans Arabic specimens
   are NOT new runtime dependencies or approved Persian fallback choices.
3. **Unexpected font rendering:** Disable the isolated v3 preview CSS
   and restore the original theme scope; inspect computed --fontFamilyBase
   and the *actual* platform-rendered font evidence. Compare all ten
   brand/mode source values with this manifest. This rollback must never
   remove the original icon fonts or edit the frozen Dev branch.
4. **Future alternative typefaces:** First design/approve the actual
   fallback choice in Penpot, then intentionally update source CSS,
   manifest, generator, tests, ten-brand regression matrix and migration
   docs. Require explicit reviewer signoff; do not silently modify the
   existing system font stack.
5. **Never roll back the Penpot quote correction** to bare Segoe UI:
   that malformed family resolves as Segoe,UI. It is a format-integrity
   repair, not a decision to replace an application font.

**Still open:** target-machine optical Persian baseline, native Windows
Contrast Themes, named screen readers, 200% and 400% application zoom/
reflow, migration/public API signoff. PR #500 remains Draft; issue #418
In progress. Only isolated v3 task branch -> bluent-v3 is permitted.
