# Contributing to Bluent

Thank you for helping improve Bluent. Contributions to documentation, examples, tests, bug fixes, accessibility, and developer experience are welcome.

Before contributing, read the [project vision](VISION.md), [roadmap](ROADMAP.md), [code of conduct](CODE_OF_CONDUCT.md), and [release policy](RELEASING.md).

## Current Project Phase

Bluent is currently in a project relaunch focused on documentation, presentation, reliability, adoption, and AI readiness.

New components and product features are paused unless the maintainer explicitly approves them. Opening a feature proposal is welcome, but implementation should not begin until its scope is accepted.

## Ways to Contribute

- Report a reproducible bug.
- Improve documentation or examples.
- Correct outdated or ambiguous API guidance.
- Add or improve tests.
- Improve accessibility or localization.
- Propose a focused change that supports the roadmap.
- Share a real application or reproducible sample using Bluent.

## Before Opening an Issue

1. Search existing issues to avoid duplicates.
2. Confirm the behavior against the latest available version.
3. Reduce bugs to the smallest reproducible example.
4. Include the Bluent package versions, .NET version, hosting model, browser, and operating system where relevant.
5. Never include secrets, tokens, private source code, or sensitive business data.

Use the repository issue templates so maintainers receive the information needed to investigate.

## Proposing Features

Feature proposals should explain:

- The user problem rather than only a preferred implementation.
- Why the problem belongs in Bluent.
- The affected package or component area.
- Alternatives or workarounds already considered.
- Compatibility, accessibility, localization, and maintenance implications.

A proposal is not approval to implement. During the relaunch, feature implementation requires explicit maintainer approval.

## Development Setup

### Requirements

- .NET 10 SDK
- Git
- Node.js and npm for projects whose static assets are produced from script packages
- A browser supported by the current Blazor toolchain

### Build

Restore tools and dependencies, then build the solution:

```bash
dotnet tool restore
dotnet restore Bluent.sln
dotnet build Bluent.sln
```

The `Bluent.UI` build invokes the repository's bundling tool. Some Debug builds copy generated JavaScript from sibling script-project output, so frontend assets may need to be built when working in those areas.

### Test

Run the current test projects with:

```bash
dotnet test Bluent.sln
```

### Demo

The repository contains WebAssembly and server-rendered demo projects. For the WebAssembly demo:

```bash
dotnet run --project src/Bluent.UI.Demo/Bluent.UI.Demo.csproj
```

## Making Changes

- Keep each pull request focused on one problem.
- Follow the existing code style and public API conventions.
- Preserve nullable reference type correctness.
- Avoid unrelated formatting or dependency changes.
- Add or update tests when behavior changes.
- Update documentation and examples when public behavior changes.
- Consider accessibility, localization, RTL, and supported render modes.
- Do not introduce a breaking change without documenting the reason and migration path.
- Do not add a new dependency unless its value and maintenance cost are justified.

## Documentation and AI Accuracy

Documentation is also consumed by coding assistants. Examples must use current package names, namespaces, setup steps, component parameters, and events.

When changing a public API:

- Update every affected example.
- Prefer complete, minimal examples over isolated fragments.
- Avoid documenting APIs that do not exist in a released or committed version.
- Mention required services, stylesheets, scripts, containers, and hosting constraints.
- Check that sample code compiles where practical.

## Commit and Pull Request Guidance

Use concise commit messages that explain the intent of the change. Conventional prefixes such as `docs:`, `fix:`, `test:`, `refactor:`, and `build:` are encouraged.

Before opening a pull request:

- [ ] Build the solution in Release configuration without compiler warnings.
- [ ] Run applicable tests.
- [ ] Run `python3 scripts/quality/check_markdown_links.py` for documentation
  changes.
- [ ] Pack and inspect affected packages for package or release changes.
- [ ] Review the diff for unrelated changes.
- [ ] Update documentation and `CHANGELOG.md` when appropriate.
- [ ] Complete the pull request template.
- [ ] Link related issues.

Pull requests should normally target the `Dev` branch.

## Review Expectations

Maintainers may ask for changes to scope, API shape, tests, documentation, accessibility, compatibility, or release notes. A pull request may be declined when it does not fit the project vision or creates disproportionate maintenance cost.

## License

By contributing, you agree that your contributions will be licensed under the repository's [Apache License 2.0](LICENSE).
