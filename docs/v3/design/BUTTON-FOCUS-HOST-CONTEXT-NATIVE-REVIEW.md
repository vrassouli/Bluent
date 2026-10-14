# #501 / #418 — Native host-aware Button Focus proposal

**Date:** 2026-10-14. **Status:** editable Penpot research under review; not production CSS, token approval, or native OS/AT certification.

## Canonical live source

- File: Bluent v3 Design System, ID b64f6665-c9ab-80b5-8008-c4ac99d9d000.
- Page: 38 · Button Focus Visible states · #501, ID 535db143-a732-807e-8008-c64d2fb91b9a.
- New editable Penpot board: RESEARCH · Host-aware branded Focus · Light / Dark 5 surfaces · #418 #501, ID **f4136a9a-101d-8004-8008-ca2956fe05f9**, at (100,7200), size 2040×1070, with **85 native child shapes**, exported to PNG and visually inspected.
- Existing selected brand-Button / underline-only-TextField board 94a03b1b-8cb6-8091-8008-c8b9bae47e45 and Danger review board 6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa remain intact.

The editable board depicts ten default-theme **Light/Dark × Neutral, Brand, BrandHover, Danger, Inverted** host specimens. Each has a real editable host surface, Button face, Persian/English label, independently outlined 2px Focus ring, exact contrast caption and a source role label. Ring bounds exceed the Button face by exactly 3px on all four edges, corresponding to a 2px CSS outline and 2px offset. These are design shapes, not a running Blazor control.

## Context-dependent fallback proposal

| Surrounding host | Light source ring role | Dark source ring role |
| --- | --- | --- |
| Neutral (colorNeutralBackground1) | colorBrandBackground | colorBrandForeground2 |
| Brand / BrandHover / Danger | colorNeutralForegroundOnBrand | colorNeutralForegroundOnBrand |
| Inverted | colorNeutralForegroundOnBrand | colorBrandForeground2 |

This **preserves the maintainer-selected single BRAND-colored ring on neutral hosts**. An inverse ring on filled/colored hosts is a proposed exception, **not yet a public token/API decision**. Unconditional brand fails on same-hue hosts; unconditional white fails Dark inverted-white. The original TextField retains its animated 2px underline and **no extra outer focus ring**. Focus2 black/white variants are retained only as research.

## Verified evidence and limits

- Actual live Penpot read-only audit scripts/quality/penpot_v3_button_host_context_audit.js: **78/78** identity, presence, native-stroke, symmetric-bounds, ratio and caption assertions passed; 0 failures.
- Ten default-theme penpot/actual Fluent source samples: **10/10 ≥3:1** relative to the OUTER host; range **3.247:1–14.548:1**. Source: emitted default Light/Dark Fluent theme CSS in the #418 branch.
- The independent #418 source audit across **10 brands × 2 modes × 5 hosts** recalculated this explicit contextual mapping: **100/100 ≥3:1**, min **3.103:1**, max **14.548:1**. Run python scripts/quality/audit_v3_focus_host_surface_matrix.py on the #418 task branch to reproduce source cases. This does not test every possible host.
- #418 PR #500 separately carries opt-in actual Blazor Styling Lab five-host, keyboard/forced-colors media emulation and responsive RTL tests. Production component CSS and v2 NuGet remain unchanged by this #501 design work.

**Pending acceptance:** the maintainer has approved the visual brand ring on normal hosts and no outer TextField focus ring, but has NOT approved the host-dependent exception for public Button semantics. Translucent/photo/gradient/nested hosts, native Windows Contrast Themes, screen readers, actual browser zoom, final Penpot token binding and production #428 behavior must still be accepted/tested. Neither a live vector audit nor numeric contrast proves full accessibility compliance.

PR #502 targets bluent-v3 only, not stable Dev / v2.
