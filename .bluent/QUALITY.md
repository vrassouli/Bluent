# Bluent Quality and Validation Policy

This file defines the evidence required before an agent or contributor may claim that Bluent work is complete or validated.

## Evidence Vocabulary

These claims are distinct:

- **Source verified** — confirmed by reading the current implementation.
- **Build verified** — the relevant project or solution compiled successfully.
- **Test verified** — the relevant automated tests ran and passed.
- **Pack verified** — NuGet packages were created and their expected contents/metadata were checked.
- **Runtime verified** — the behavior was exercised in a running application.
- **Visual verified** — the rendered result was reviewed at the stated viewport, theme, and direction.
- **Deployment verified** — the deployment workflow ran successfully and the deployed application was checked.

Never substitute one kind of evidence for another.

## Required for Every Pull Request

- State the user-visible outcome.
- Identify affected projects, packages, components, and documentation.
- Run the narrowest relevant checks plus the repository-required checks.
- Record exact commands and results.
- Disclose skipped, unavailable, or failed validation.
- Document public behavior changes and migration impact.
- Update canonical documentation and project tracking when applicable.

## Baseline Repository Validation

Run from the repository root:

```bash
dotnet tool restore
dotnet restore Bluent.sln
dotnet build Bluent.sln --configuration Release
dotnet test Bluent.sln --configuration Release --no-build
```

For package-affecting work, also run Release packing for affected packable projects and inspect:

- package ID and version metadata;
- dependencies;
- README and license inclusion;
- static web assets;
- symbols/source configuration where applicable.

## Documentation Validation

- Resolve local Markdown links.
- Verify commands, namespaces, package IDs, asset paths, and examples against current source.
- Compile or run examples when the document claims they are runnable.
- Update `llms.txt` when canonical documentation is added, moved, or removed.
- Update component inventory when public component coverage changes.

## Issue #406 consumer-skill validation

The consumer skill has additional acceptance evidence beyond ordinary documentation changes:

- `docs/components/inventory.md` is the maintained consumer retrieval ledger.
- `scripts/quality/check_consumer_skill.py` must derive the current top-level `Bluent.UI` `*Component` source surface and fail if a family is silently absent from the inventory.
- Cross-component source areas such as `ContainersComponent` may be excluded from the family count only through an explicit infrastructure classification in the checker and canonical docs.
- `.agents/skills/bluent/COMPONENT-INDEX.md` routes must resolve to existing canonical references.
- Required skill router/foundation/pattern files must exist.
- Every tracked consumer retrieval family must be at least source verified before #406 can be review-ready.
- `samples/Bluent.TaskExamples` must compile the representative consumer scenarios, including Tree selection/DnD contracts and a Utilities service-backed scenario.
- Product/API/runtime/accessibility defects discovered while verifying #406 belong in issue #411 rather than being silently changed or omitted.
- Existing runtime evidence may be reused only for the exact component/mode/behavior scope recorded in `docs/compatibility/hosting-and-render-modes.md`.
- High-risk browser/JS/pointer/keyboard/accessibility behavior without runtime evidence must remain explicitly labeled unverified or limited.

The Quality workflow is the primary automated gate for #406. It runs zero-warning Release build, canonical task-example compilation, consumer-skill drift validation, tests, release-tool tests, five-package validation, Markdown-link validation, workflow YAML parsing, focused rendered accessibility, and changed-line whitespace validation.

## Demo and Visual Work

Required before Sprint 2 completion:

- Run the Blazor WebAssembly demo.
- Review the Home, Getting Started, navigation, selected component pages, and scenario pages in a browser.
- Test representative desktop and mobile viewport widths.
- Test light and dark themes.
- Test LTR and RTL direction.
- Confirm interactive controls, navigation, dialogs, overlays, and scenario workflows behave as intended.
- Check the browser console for relevant errors.
- Confirm layout does not introduce obvious clipping, overflow, unreadable content, or unreachable navigation.
- Capture screenshots only from the validated running application.
- Record environment details: .NET SDK, browser, OS, commit SHA, and relevant host.

## Deployment Validation

- Review the workflow target branch, SDK version, and action versions.
- Run the static deployment workflow successfully.
- Confirm generated base paths and static assets resolve correctly.
- Open the deployed site and test primary routes directly and through navigation.
- Record the workflow run and deployed URL in the PR.

## Public API Changes

For any public component or API change:

- compare sibling APIs and inherited parameters;
- preserve binding and event naming conventions;
- review accessibility, keyboard, localization, RTL, and JavaScript lifecycle effects;
- add or update runnable examples;
- add tests when behavior can be covered automatically;
- add an `Unreleased` changelog entry;
- add migration guidance for breaking changes.

## Completion Rules

An item may be checked off only when its acceptance criteria and required evidence are recorded.

A sprint may be marked complete only when:

- all Definition of Done items are satisfied;
- required validation has run;
- known limitations and remaining risks are explicit;
- project tracking and public issue/PR status agree.
