# Bluent Documentation

This directory is the canonical home for Bluent product documentation.

The repository root README remains the short evaluation and installation entry point. Detailed, maintained guidance belongs here so developers, contributors, and coding agents can follow stable links without reconstructing behavior from source code.

## Documentation map

| Area | Canonical location | Purpose |
| --- | --- | --- |
| Product overview | [../README.md](../README.md) | Evaluate Bluent and complete the shortest verified installation path |
| Product direction | [../VISION.md](../VISION.md) | Understand users, principles, positioning, and long-term goals |
| Roadmap | [../ROADMAP.md](../ROADMAP.md) | Track outcome-based project phases |
| Getting started | [`getting-started/`](getting-started/index.md) | Install, register, configure, and run Bluent in supported Blazor hosting models |
| Packages | [`packages/`](packages/index.md) | Choose packages and understand dependencies and boundaries |
| Components | [`components/`](components/README.md) | Use public components through a consistent reference format; see the maintained [coverage inventory](components/inventory.md) |
| Consumer AI skill | [`../.agents/skills/bluent/`](../.agents/skills/bluent/SKILL.md) | Route coding agents from UI intent to canonical Bluent documentation without duplicating the API catalog |
| Guides | [`guides/`](guides/theming-localization-rtl-and-assets.md) | Complete cross-component tasks such as forms, dialogs, theming, RTL, and localization |
| Compatibility | [`compatibility/`](compatibility/README.md) | Check framework, render-mode, package-version, migration, and upgrade guidance |
| Examples | [`examples/`](examples/README.md) and [`examples/tasks/`](examples/tasks/README.md) | Find compilable task patterns, runnable examples, and reference applications |
| Demo gallery | [`demo/`](demo/README.md) | Review current screenshots captured from the validated running demo |
| AI readiness | [`ai/`](ai/benchmark.md), [latest report](ai/results/2026-07-26-codex-repository-context.md), and [`../benchmarks/ai-readiness/`](../benchmarks/ai-readiness/) | Maintain benchmark prompts, repeatable runs, dated results, scoring, and recurring failure analysis |
| Quality | [`quality/compiler-warning-baseline.md`](quality/compiler-warning-baseline.md) | Review the accepted compiler-warning baseline and regression policy |
| Contributor workflow | [../CONTRIBUTING.md](../CONTRIBUTING.md) | Build, test, and contribute to the repository |
| Releases | [../RELEASING.md](../RELEASING.md), [../CHANGELOG.md](../CHANGELOG.md), [`releasing/release-workflow-audit.md`](releasing/release-workflow-audit.md), and [`releasing/stable-release-readiness.md`](releasing/stable-release-readiness.md) | Prepare releases, understand changes, and review release-readiness evidence |

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
3. Load the compact [Bluent consumer skill](../.agents/skills/bluent/SKILL.md) to route the task to the minimum relevant references.
4. Use the getting-started and package guides before generating code.
5. Treat component references and verified examples as authoritative for public APIs.
6. Do not invent components, parameters, events, namespaces, or supported hosting modes.
7. When documentation and source disagree, report the discrepancy and prefer current source until documentation is corrected.

### Documentation contributor

1. Verify behavior against current source and runnable examples.
2. Use the component-reference template for component documentation.
3. Link to one canonical explanation instead of duplicating setup guidance.
4. Include package, namespace, prerequisites, and known limitations.
5. Mark version-specific behavior explicitly.
6. Run applicable builds, tests, examples, and link checks before opening a pull request.

## Current consumer-skill coverage

Issue #406 is expanding source-verified canonical coverage in coherent batches. The source-reconciled inventory currently tracks 57 `Bluent.UI` component families and 76 total families/types across UI, Charts, Diagrams, and Utilities. All 57 main-UI families now have source-verified canonical references; Dialog additionally retains separately recorded runtime verification.

Source discovery expanded the earlier main-UI ledger with `DropdownList`, `Link`, `TileLayout`, `Tooltip`, and `DataList`; all five now have source-verified canonical references. `Containers` is documented as cross-component consumer infrastructure rather than counted as an ordinary component-family row.

Source verification is not runtime certification. High-risk JavaScript, browser-permission, pointer, keyboard, RTL, accessibility, and render-mode behaviors remain explicitly marked where runtime evidence is still required.

Remaining #406 coverage work is in Charts, Diagrams, Utilities, public helper/service/configuration classification, high-risk runtime verification, deterministic drift/link/coverage validation, and consumer dogfood scenarios. The skill index follows the maintained ledger rather than claiming unsupported coverage.

## Source-of-truth rules

- Public behavior is defined by released code; documentation describes it and must stay aligned.
- The canonical getting-started guide owns installation and setup details. Other pages link to it.
- Package pages own package boundaries and dependency guidance.
- Component pages own component API usage; task guides compose components without duplicating full API references.
- The consumer skill is a retrieval/router layer; it must route to canonical docs and explicitly flag missing coverage rather than becoming an independent API encyclopedia.
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
- Consumer-skill routes are updated when canonical component/task coverage changes.

## Planned Sprint 1 deliverables

Sprint 1 is tracked in [Issue #365](https://github.com/vrassouli/Bluent/issues/365). The intended sequence is:

1. Documentation architecture and source inventory
2. Verified getting started and package/hosting guidance
3. Component catalog, template, and cross-cutting requirements
4. Coding-agent instructions and `llms.txt`
5. AI benchmark definition and baseline
6. Consistency, link, build, and example validation

## Machine-readable and agent guidance

- [Coding-agent instructions](../AGENTS.md)
- [Bluent consumer skill](../.agents/skills/bluent/SKILL.md)
- [Machine-readable documentation index](../llms.txt)
