# AGENTS.md

This file provides repository-wide instructions for coding agents working on Bluent.

## Project

Bluent is a Blazor-native toolkit for modern business applications. The current project phase prioritizes documentation, reliability, presentation, adoption, and AI readiness.

Read these sources before making changes:

1. `.bluent/HANDOFF.md`
2. `.bluent/PROJECT.md`
3. the active sprint plan under `.bluent/sprints/`
4. `.bluent/QUALITY.md`
5. `VISION.md`
6. `ROADMAP.md`
7. `CONTRIBUTING.md`
8. `docs/README.md`
9. the nearest scoped `AGENTS.md`
10. the documentation page for the affected package or component

Use `.bluent/BACKLOG.md` for unscheduled and future work. Do not silently pull backlog items into the active sprint.

## Guardrails

- Do not add new product components or features without explicit maintainer approval.
- Preserve public API consistency across packages and component families.
- Avoid breaking changes unless necessary, approved, documented, and accompanied by migration guidance.
- Do not invent support claims, components, parameters, events, namespaces, render modes, or static assets.
- Treat current source and verified examples as evidence; report documentation/source mismatches.
- Do not describe a demo page as validation unless its behavior was actually built or run.
- Apply the evidence definitions and completion rules in `.bluent/QUALITY.md`.
- Keep changes focused and reviewable.
- Update `.bluent/PROJECT.md`, the active tracking issue, and the pull request when completing project work.

## Repository map

- `src/Bluent.Core` — shared abstractions and base functionality; NuGet package `Bluent.UI.Core`
- `src/Bluent.UI` — main component library and services; NuGet package `Bluent.UI`
- `src/Bluent.UI.Charts` — chart components; NuGet package `Bluent.UI.Charts`
- `src/Bluent.UI.Diagrams` — diagram components; NuGet package `Bluent.UI.Diagrams`
- `src/Bluent.UI.Utilities` — higher-level application utilities; NuGet package `Bluent.UI.Utilities`
- `src/Bluent.UI.Demo` — Blazor WebAssembly demo host
- `src/Bluent.UI.Demo.SSR` — Blazor Web App/static SSR host
- `src/Bluent.UI.Demo.Pages` — shared demo pages; follow its scoped `AGENTS.md`
- `docs` — canonical product documentation
- `.bluent` — project state, handoff, backlog, quality policy, and sprint execution plans

Package IDs and project directory names are not always identical. Verify the project file before writing installation instructions.

## Canonical setup facts

For the main package:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Extensions
```

```csharp
builder.Services.AddBluentUI();
```

```razor
<Containers />
```

```html
<link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
<link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
```

Do not use `@using Bluent.UI` as the component import. Do not add a global base-package script tag; current base interop uses the packaged ES module.

Blazor WebAssembly is the verified onboarding path. Other interactive render modes remain under validation in Issue #366.

## Build and validation

Run from the repository root:

```bash
dotnet tool restore
dotnet restore Bluent.sln
dotnet build Bluent.sln --configuration Release
dotnet test Bluent.sln --configuration Release --no-build
```

For package work, also pack the affected projects in Release configuration and inspect the resulting package metadata, dependencies, README, license, and static assets.

Do not claim that validation passed unless the command actually ran successfully. Record commands, configuration, relevant environment, and failures. Follow `.bluent/QUALITY.md` for runtime, visual, documentation, package, and deployment evidence.

## Documentation rules

- Use `docs/components/TEMPLATE.md` for public component references.
- Update `docs/components/inventory.md` when component coverage changes.
- Link to canonical setup pages instead of duplicating instructions.
- Include package, namespace, minimal verified example, parameters, events, assets, hosting notes, limitations, and verification evidence.
- Mark source verification separately from runtime verification.
- Update `llms.txt` when canonical documentation is added, moved, or removed.
- Add migration guidance for public API, behavior, asset, hosting, or dependency changes.

## Component changes

When changing a public component:

1. Identify inherited public parameters and behavior.
2. Check sibling components for naming and event consistency.
3. Preserve binding conventions and generic constraints.
4. Review localization, RTL, accessibility, and keyboard effects.
5. Review JavaScript module loading and disposal.
6. Update or add a runnable example.
7. Update canonical documentation and the coverage inventory.
8. Add an `Unreleased` changelog entry when user-visible.

## Packages and dependencies

- `Bluent.UI`, Charts, and Diagrams directly reference Core.
- Utilities directly references `Bluent.UI`.
- Prefer aligned versions for directly installed Bluent packages.
- Applications normally should not install Core directly.
- Keep package metadata and dependency relationships accurate.

## Source style

Follow existing .NET and Razor conventions in the affected project. Prefer clear public API names and explicit behavior over clever abstractions. Avoid broad mechanical rewrites in focused documentation or fix pull requests.

## Pull requests

A pull request should state:

- user-visible outcome
- affected packages/components
- source and documentation changes
- build/test/pack commands actually run
- runtime, visual, deployment, and render modes actually tested
- breaking changes and migration steps
- remaining risks or unverified behavior

Never hide failed or skipped validation.
