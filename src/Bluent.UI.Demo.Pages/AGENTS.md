# Demo Pages Agent Instructions

These instructions apply to work under `src/Bluent.UI.Demo.Pages`.

Read the repository-root `AGENTS.md`, `.bluent/HANDOFF.md`, `.bluent/QUALITY.md`, and the active sprint plan before making changes.

## Purpose

The demo is a public product experience and a source of verified usage examples. It must help developers understand Bluent, evaluate its capabilities, and learn correct usage patterns.

## Guardrails

- Use existing public Bluent components and APIs.
- Do not add or change public library APIs merely to simplify a demo page without explicit maintainer approval.
- Do not introduce a second design system or unrelated CSS framework.
- Prefer scoped demo styles and existing design tokens/utilities.
- Preserve light and dark themes.
- Preserve LTR and RTL direction.
- Keep desktop and mobile navigation usable.
- Do not copy canonical setup instructions when a link or concise verified summary is sufficient.
- Do not claim compatibility or runtime validation that was not exercised.
- Keep examples realistic but free of secrets, external service dependencies, and unnecessary complexity.

## Page Expectations

For product and scenario pages:

- Provide a meaningful page title and concise purpose.
- Demonstrate business-application usage rather than decorative controls alone.
- Use accessible labels and meaningful action text.
- Include loading, empty, success, warning, or error states when relevant.
- Ensure examples remain understandable in both LTR and RTL.
- Avoid fixed dimensions that break common mobile widths unless the example specifically demonstrates fixed sizing.

For component showcase pages, prefer this structure:

1. Purpose and common use cases.
2. Interactive example.
3. Correct package and namespace reference.
4. Important parameters, events, and binding patterns.
5. Theme, RTL, accessibility, hosting, or JavaScript notes.
6. Limitations and verification evidence.

## Navigation

- Keep Home and Getting Started easy to reach.
- Group components by user intent or application purpose.
- Keep Charts and Diagrams visible as first-class capabilities.
- Compact navigation must remain understandable through icons, labels, tooltips, or an equivalent accessible mechanism.
- New pages must be linked from the appropriate navigation group unless intentionally hidden and documented.

## Validation

Before claiming demo work complete:

- run the repository build and tests;
- run the demo in a browser;
- test representative desktop and mobile widths;
- test light and dark themes;
- test LTR and RTL;
- check navigation, interaction, overlays, and browser console errors;
- record the tested environment and commit SHA;
- capture screenshots only after runtime validation.

Update `.bluent/PROJECT.md`, the active sprint issue, and the pull request with exact evidence.
