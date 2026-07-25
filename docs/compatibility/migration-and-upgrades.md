# Migration and upgrade guidance

This page defines the canonical upgrade process for Bluent consumers. Version-specific migrations will be added as releases introduce compatibility changes.

## Current baseline

- Current repository projects target `.NET 10`.
- Bluent follows Semantic Versioning as defined in [RELEASING.md](../../RELEASING.md).
- Packages released together are expected to use aligned versions.
- Historical releases predate the current structured changelog, so older breaking changes do not yet have a complete migration catalog.
- The current relaunch documentation describes source state and must be validated against published package contents before the next stable release.

## Before upgrading

1. Record every directly installed Bluent package and version.
2. Read [CHANGELOG.md](../../CHANGELOG.md) from the current version through the target version.
3. Read the GitHub release notes for the target version.
4. Check the target .NET framework and ASP.NET Core requirements.
5. Check hosting/render-mode status in [Hosting models and render modes](hosting-and-render-modes.md).
6. Use a branch and keep the existing package lock or restore evidence available for comparison.
7. Upgrade all directly installed Bluent packages from the same release line together unless release notes explicitly allow independent versions.

## Upgrade procedure

### 1. Update package references

Update the directly installed packages used by the application:

```bash
dotnet add package Bluent.UI --version TARGET_VERSION
dotnet add package Bluent.UI.Charts --version TARGET_VERSION
dotnet add package Bluent.UI.Diagrams --version TARGET_VERSION
dotnet add package Bluent.UI.Utilities --version TARGET_VERSION
```

Run only the commands for packages the project actually uses. `Bluent.UI.Core` is normally resolved transitively.

### 2. Restore and build

```bash
dotnet restore
dotnet build --configuration Release
```

Treat compiler errors and warnings involving components, generic arguments, parameters, events, extension methods, or namespaces as potential migration work.

### 3. Verify application setup

Check that the current canonical setup still matches the application:

- `AddBluentUI()`
- optional `AddBluentUtilities()`
- component namespaces
- one `<Containers />` in the active interactive layout tree
- base theme and component stylesheets
- package-specific assets
- root `data-bui-theme` and `dir` behavior

See [Getting Started](../getting-started/index.md) and [Theming, localization, RTL, and browser assets](../guides/theming-localization-rtl-and-assets.md).

### 4. Test high-risk behavior

Exercise:

- form binding and validation
- culture-sensitive date, time, and numeric input
- dialogs, drawers, popovers, toasts, and tooltips
- focus and keyboard behavior
- DataGrid and navigation state
- chart module loading
- diagram rendering and interaction
- theme and direction switching
- prerender, hydration, and reconnect behavior for Blazor Web Apps

### 5. Inspect static assets

Remove stale application-copied Bluent assets unless the release explicitly requires them. Prefer framework-served package assets under `_content/{PackageId}/...`.

Clear browser/CDN caches when stylesheet or module behavior changed, then confirm that requested asset URLs correspond to the target package version.

## Compatibility surface

Migration notes are required when a release changes:

- public components or base classes
- parameters, events, binding contracts, generic constraints, or defaults
- public services, interfaces, or registration extensions
- CSS classes intentionally documented for consumers
- theme tokens or packaged asset filenames
- JavaScript module exports or loading behavior
- localization resource behavior
- supported .NET versions, hosting models, or render modes
- package IDs, dependencies, or version alignment

Internal implementation details are not a compatibility promise unless they have been documented or relied upon as public behavior.

## Deprecation and removal

Deprecation is preferred over immediate removal. A deprecated API should normally remain for at least one minor release unless security or correctness makes that unsafe.

A deprecation must include:

- the replacement
- the first deprecated version
- the earliest planned removal version
- an example migration
- any behavioral differences

A removal must appear under `Removed` in the changelog and in release notes.

## Version-specific migration template

Add a section for every release that requires consumer action:

```markdown
## Migrating from X.Y to A.B

### Who is affected

Describe packages, APIs, hosting models, or behaviors.

### Required changes

1. Exact change
2. Exact change

### Before

\`\`\`razor
<OldComponent OldParameter="..." />
\`\`\`

### After

\`\`\`razor
<NewComponent NewParameter="..." />
\`\`\`

### Behavioral differences

Describe defaults, event timing, styling, assets, or runtime behavior.

### Validation

List the build and runtime checks used to verify the migration.
```

## Reporting an undocumented break

Open a bug report containing:

- previous and target Bluent versions
- affected package
- target framework and hosting/render mode
- minimal before/after code
- compiler or runtime output
- whether the behavior was publicly documented
- a minimal reproduction when possible

Undocumented breaking behavior should result in a documentation fix, migration entry, and—when appropriate—a compatibility fix or deprecation path.

## Maintainer release requirement

Before publishing a stable release:

- move relevant `Unreleased` entries into a dated version
- add migration sections for every approved breaking change
- install packed artifacts into a clean consumer project
- validate package metadata and dependency versions
- verify canonical setup and static asset paths
- link migration guidance from the GitHub Release

See the full release checklist in [RELEASING.md](../../RELEASING.md).
