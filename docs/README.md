# Bluent Documentation

This directory is the canonical home for Bluent product documentation.

The repository root README remains the short evaluation and installation entry point. Detailed, maintained guidance belongs here so developers, contributors, and coding agents can follow stable links without reconstructing behavior from source code.

## Documentation map

| Area | Canonical location | Purpose |
| --- | --- | --- |
| Product overview | [../README.md](../README.md) | Evaluate Bluent and complete the shortest verified installation path |
| Product direction | [../VISION.md](../VISION.md) | Understand users, principles, positioning, and long-term goals |
| Roadmap | [../ROADMAP.md](../ROADMAP.md) | Track outcome-based project phases |
| Getting started | `getting-started/` | Install, register, configure, and run Bluent in supported Blazor hosting models |
| Packages | `packages/` | Choose packages and understand dependencies and boundaries |
| Components | `components/` | Use public components through a consistent reference format |
| Guides | `guides/` | Complete cross-component tasks such as forms, dialogs, theming, RTL, and localization |
| Compatibility | `compatibility/` | Check framework, render-mode, package-version, migration, and upgrade guidance |
| Examples | `examples/` | Find runnable, source-verified examples and reference applications |
| AI readiness | `ai/` | Maintain benchmark prompts, dated results, scoring, and recurring failure analysis |
| Contributor workflow | [../CONTRIBUTING.md](../CONTRIBUTING.md) | Build, test, and contribute to the repository |
| Releases | [../RELEASING.md](../RELEASING.md) and [../CHANGELOG.md](../CHANGELOG.md) | Prepare releases and understand changes |

Directories are introduced as their first maintained document is added. Empty placeholder directories are intentionally avoided.

## Recommended reading paths

### New adopter

1. Read the root [README](../README.md).
2. Follow the canonical getting-started guide.
3. Confirm the supported hosting model and render mode.
4. Select only the packages needed by the application.
5. Use task guides first, then component references for API detail.
6. Check compatibility and migration guidance before upgrading.

### Coding agent

1. Read the repository agent instructions.
2. Read `llms.txt` for the maintained documentation index.
3. Use the getting-started and package guides before generating code.
4. Treat component references and verified examples as authoritative for public APIs.
5. Do not invent components, parameters, events, namespaces, or supported hosting modes.
6. When documentation and source disagree, report the discrepancy and prefer current source until documentation is corrected.

### Documentation contributor

1. Verify behavior against current source and runnable examples.
2. Use the component-reference template for component documentation.
3. Link to one canonical explanation instead of duplicating setup guidance.
4. Include package, namespace, prerequisites, and known limitations.
5. Mark version-specific behavior explicitly.
6. Run applicable builds, tests, examples, and link checks before opening a pull request.

## Source-of-truth rules

- Public behavior is defined by released code; documentation describes it and must stay aligned.
- The canonical getting-started guide owns installation and setup details. Other pages link to it.
- Package pages own package boundaries and dependency guidance.
- Component pages own component API usage; task guides compose components without duplicating full API references.
- Compatibility pages own version and migration statements.
- AI benchmark reports are dated observations, not product documentation.
- The demo is supporting evidence and must not be the only place a public behavior is documented.
- Unsupported or unverified claims must not be published as facts.

## Component reference standard

Every component reference should contain, where applicable:

1. Purpose and when to use it
2. NuGet package and namespace
3. Minimal verified example
4. Parameters
5. Events and binding behavior
6. Child content and composition rules
7. Styling, theming, RTL, and localization notes
8. Accessibility and keyboard behavior
9. JavaScript, static asset, or hosting requirements
10. Known limitations and common mistakes
11. Links to runnable examples and related components
12. Verification date or applicable package version

Examples should be small enough to understand independently and must use current public APIs.

## Content lifecycle

A documentation change is complete when:

- Its claims are verified against current source or a runnable example.
- Internal links resolve.
- Code snippets use the correct package, namespace, registration, and static assets.
- Version-specific details are labeled.
- Related canonical pages are updated instead of contradicted.
- The documentation coverage inventory reflects the change.
- `llms.txt` is updated when a canonical document is added, moved, or removed.

## Planned Sprint 1 deliverables

Sprint 1 is tracked in [Issue #365](https://github.com/vrassouli/Bluent/issues/365). The intended sequence is:

1. Documentation architecture and source inventory
2. Verified getting started and package/hosting guidance
3. Component catalog, template, and cross-cutting requirements
4. Coding-agent instructions and `llms.txt`
5. AI benchmark definition and baseline
6. Consistency, link, build, and example validation
