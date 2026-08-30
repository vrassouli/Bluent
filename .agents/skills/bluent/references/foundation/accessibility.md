# Accessibility

Accessibility claims must be evidence-backed per `.bluent/QUALITY.md` and the exact canonical component reference.

Do not claim WCAG conformance, keyboard behavior, focus semantics, validation announcements, ARIA roles or screen-reader behavior unless the relevant component page/tests/runtime evidence verify them.

Practical rules:

- prefer visible action text for primary workflows;
- icon-only actions need an accessible name or verified tooltip/label strategy;
- preserve native semantic attributes passed through documented component APIs/attributes;
- do not replace a Bluent component with custom markup merely to add ARIA unless a real library gap is identified;
- when a canonical component page lists an accessibility limitation, preserve that limitation in generated consumer guidance.

Use `docs/components/badge.md`, `docs/components/checkbox.md`, `docs/components/dialog.md`, focused render tests and component source as applicable. For undocumented families, report accessibility as unverified rather than guessing.
