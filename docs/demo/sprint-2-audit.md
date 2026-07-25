# Sprint 2 Demo Audit

This document records the current state of the Bluent demo application and defines the implementation order for Sprint 2.

## Executive Summary

The demo contains a broad component showcase, but its presentation layer is not yet suitable as the public face of Bluent.

The main problems are:

- The landing page is still the default Blazor starter page.
- Navigation is a flat component list with no information hierarchy.
- The public experience does not explain Bluent's product positioning or enterprise value.
- Component pages exist in large numbers, but discovery is weak.
- Theme, dark mode, and RTL controls are implemented and should be elevated as visible differentiators.
- Charts and Diagrams already have dedicated demo pages and should be presented as first-class packages.

## Current Application Structure

### Layout

The demo uses:

- `MainLayout.razor` for the application shell.
- `Header.razor` for global controls and branding.
- `Side.razor` for the primary component navigation.
- `<Containers />` at layout level for global overlay services.

This is a sound technical base and should be retained.

### Header Capabilities

The current header already provides:

- Side navigation expansion and collapse.
- Bluent home navigation.
- Theme color selection.
- Light and dark mode switching.
- LTR and RTL direction switching.
- Local persistence through local storage.

These capabilities are strong differentiators and should remain visible in the redesigned demo.

### Navigation

The active side navigation is a single vertical `TabList` containing component links.

Observed issues:

- No Home entry in the active navigation.
- No Getting Started or conceptual documentation entry.
- No grouping by component purpose.
- Charts and Diagrams are mixed into the base component list.
- No enterprise-scenario or workflow examples.
- No search or quick filtering.
- The `Expanded` parameter is not currently used by `Side.razor`.
- A previous hierarchical `NavList` implementation exists only as commented code.

### Landing Page

The home page currently renders:

```text
Hello, world!
Welcome to your new app.
```

This is the highest-priority presentation defect in the project.

### Component Coverage

The demo has broad page coverage, including at least:

- Inputs and forms: fields, checkboxes, radios, sliders, dropdowns, file selection.
- Actions and feedback: buttons, dialogs, drawers, message bars, popovers, toasts, tooltips.
- Navigation and structure: breadcrumbs, menus, tabs, trees, wizards, lists.
- Data and layout: data grids, pagers, cards, stacks, split panels, dock panels.
- Rich capabilities: charts, diagrams, drawing canvas, audio capture.
- Visual system: icons, labels, tags, badges, skeletons, progress bars.

The issue is therefore not lack of demo content; it is discoverability, hierarchy, polish, and positioning.

## Sprint 2 Target Information Architecture

The public demo should use this top-level structure:

1. Home
2. Getting Started
3. Components
   - Actions
   - Inputs and Forms
   - Navigation
   - Feedback and Overlays
   - Data Display
   - Layout
   - Status and Visuals
4. Charts
5. Diagrams
6. Enterprise Scenarios

The exact component-to-category mapping should be maintained in code rather than duplicated manually across multiple files.

## Implementation Order

### Phase 1 — Public Landing Experience

- Replace the starter home page.
- Add a clear value proposition.
- Add primary calls to action for Getting Started and Components.
- Highlight enterprise application use cases.
- Highlight dark mode, theme colors, RTL, charts, and diagrams.
- Add a concise package overview.

### Phase 2 — Navigation Architecture

- Replace the flat list with grouped navigation.
- Add Home and Getting Started entries.
- Separate Charts and Diagrams from general components.
- Preserve mobile collapse behavior.
- Use the `Expanded` state to support compact and full navigation modes.
- Add accessible group labels and predictable active states.

### Phase 3 — Component Showcase Consistency

- Define one visual page structure for component demos.
- Add overview, examples, package name, and source links consistently.
- Prioritize the most important enterprise components first.
- Mark incomplete or experimental examples honestly.

### Phase 4 — Enterprise Scenarios

Add runnable pages that combine multiple components, beginning with:

- Customer profile form.
- Operations dashboard.
- Search and filter workspace.
- Confirmation and notification flow.
- RTL business form.

### Phase 5 — Responsive and Visual Validation

- Validate desktop navigation.
- Validate mobile navigation.
- Validate dark and light modes.
- Validate LTR and RTL layouts.
- Validate theme colors.
- Capture final screenshots and short demonstrations.

## Technical Follow-ups Outside Core Sprint 2

These remain separate quality tasks unless they block deployment:

- Modernize the GitHub Pages workflow.
- Validate Interactive Server, Interactive WebAssembly, and Interactive Auto through Issue #366.
- Resolve or formally triage existing compiler warnings.
- Expand AI-readiness benchmarking.

## Definition of Done

Sprint 2 is complete when:

- The default starter landing page is gone.
- The demo clearly explains Bluent and its intended use.
- Navigation is grouped and works on desktop and mobile.
- Charts and Diagrams are first-class destinations.
- At least three enterprise scenarios are runnable.
- Dark/light, theme color, LTR/RTL, and responsive behavior are validated.
- Professional screenshots are committed or linked from the README.
- The solution builds and existing tests pass.
- One reviewed pull request targets `Dev`.
