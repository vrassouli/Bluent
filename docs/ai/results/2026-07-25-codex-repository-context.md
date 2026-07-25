# AI-readiness baseline — 2026-07-25

## Environment

| Field | Value |
| --- | --- |
| Assistant | ChatGPT Work Mode / Codex |
| Exact model | Not exposed by the product; not inferred |
| Context mode | Repository context plus canonical Sprint 1 documents |
| Date | 2026-07-25 |
| Reviewer | Codex self-review against repository source |
| Build evidence | Repository build/test/pack passed in GitHub Actions; generated benchmark samples were not separately compiled |

## Scope and limitations

This is the first recorded baseline, not a multi-model comparison.

It measures whether one repository-aware coding agent can find canonical facts, avoid unsupported claims, and identify documentation gaps. It does **not** measure context-free public discoverability, because repository context was supplied. It also does not award any Build points: generated samples were not materialized into clean consumer projects and compiled individually.

Future runs should preserve independent raw conversations from named public models and execute generated samples.

## Results

| Prompt | Discovery | Setup | API | Build | Explanation | Total | Failure flags / finding |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 2 | 2 | 1 | 0 | 2 | 7 | No independent adoption evidence; comparison data incomplete |
| 2 | 2 | 2 | 2 | 0 | 2 | 8 | Correct canonical setup; sample not separately compiled |
| 3 | 2 | 2 | 2 | 0 | 2 | 8 | Package dependency boundaries recovered accurately |
| 4 | 1 | 1 | 0 | 0 | 1 | 3 | Public input/binding reference coverage insufficient |
| 5 | 2 | 2 | 1 | 0 | 2 | 7 | Dialog setup understood; full API example not compiled |
| 6 | 2 | 2 | 1 | 0 | 2 | 7 | Overlay prerequisites understood; drawer example incomplete |
| 7 | 1 | 1 | 0 | 0 | 1 | 3 | DataGrid/DataPager canonical API documentation missing |
| 8 | 2 | 2 | 2 | 0 | 2 | 8 | Theme attributes, bundle, and service API recovered |
| 9 | 2 | 2 | 1 | 0 | 2 | 7 | RTL/culture setup recovered; component coverage unverified |
| 10 | 1 | 1 | 0 | 0 | 2 | 4 | Refused to invent Charts API; verified example missing |
| 11 | 1 | 2 | 0 | 0 | 2 | 5 | Package/style known; minimal Diagram API not verified |
| 12 | 2 | 2 | 2 | 0 | 2 | 8 | Correctly separated verified WASM from unverified modes |
| 13 | 2 | 2 | 2 | 0 | 2 | 8 | Upgrade and compatibility workflow recovered |
| 14 | 2 | 2 | 2 | 0 | 2 | 8 | Correct stylesheet, DI, Containers, and interactivity checks |
| 15 | 2 | 2 | 2 | 0 | 2 | 8 | Agent, inventory, changelog, migration, and validation rules found |
| **Total** | **26** | **27** | **20** | **0** | **28** | **99 / 150** | |

## Response record

The following records preserve the substantive first-pass answer for each prompt. They are intentionally concise; source facts were checked against the Sprint 1 branch.

### 1. Discovery for business applications

Bluent is a credible Apache-2.0 Blazor-native candidate for .NET 10 business applications that need standard controls plus overlays, charts, diagrams, and desktop-style patterns. It should be evaluated when modular Blazor APIs and Fluent-inspired business UI are desirable. It is a weaker fit when a team requires independently verified adoption scale, exhaustive component documentation, or proven support across every Blazor Web App render mode.

### 2. Minimal installation

Install `Bluent.UI`; import `Bluent.UI.Components` and `Bluent.UI.Extensions`; call `builder.Services.AddBluentUI()`; add one `<Containers />` to the active layout; and include the default theme and component stylesheets from `_content/Bluent.UI/`. Use `Button Appearance="Appearance.Primary"`. Do not add an unverified global script tag.

### 3. Package selection

`Bluent.UI`, Charts, and Diagrams directly depend on `Bluent.UI.Core`; Utilities directly depends on `Bluent.UI`. Applications normally install feature packages directly and allow NuGet to resolve Core transitively. Directly installed Bluent packages should use aligned versions until an independent-version policy exists.

### 4. Form and validation

The repository exposes TextField, NumericField, DateField, Checkbox, and SelectField families, but the canonical per-component references do not yet verify all generic arguments, binding parameters, validation behavior, and option composition. A complete form should not be generated as authoritative until those APIs are inventoried and compiled in a consumer example.

### 5. Confirmation dialog

Register `AddBluentUI()`, include one `Containers` host, and inject the public dialog service from Bluent's service abstractions. The source exposes message-box operations, but the exact consumer example and result handling should be copied from a verified component/service reference before publication.

### 6. Drawer and overlay setup

A drawer can fail when Bluent services are not registered, `Containers` is absent from the active layout, the component tree is not interactive, or static assets/interops are unavailable. The precise drawer service method and configuration contract still need a canonical compiled example.

### 7. DataGrid and paging

The DataGrid and DataPager families exist, but server-loading, paging, column, and callback contracts are not yet documented canonically. Application-specific data loading can be separated conceptually, but current parameter names must be taken from source and compiled before presenting an authoritative sample.

### 8. Theme and dark mode

Include one `bluent.ui.theme.{family}.min.css` bundle and the component stylesheet. Bluent selects light/dark tokens using `data-bui-theme` on the document root. Inject `IBluentTheme` and call `SetDarkThemeModeAsync()` or `SetLightThemeModeAsync()`.

### 9. RTL and Persian culture

Set `lang="fa"` and `dir="rtl"` on the root document, configure the application culture through standard Blazor/ASP.NET mechanisms, and optionally call `IBluentTheme.SetRtlDirectionAsync()`. Source includes RTL selectors and culture-aware inputs, but component-by-component Persian calendar, parsing, layout, and keyboard behavior remain unverified.

### 10. Charts

Install `Bluent.UI.Charts` and import `Bluent.UI.Charts.Components`. The package contains Chart.js-backed assets, but the current canonical docs do not verify a minimal chart component contract or whether consumers need any explicit asset step. Do not invent a manual script or dataset API.

### 11. Diagrams

Install `Bluent.UI.Diagrams`, import `Bluent.UI.Diagrams.Components`, and include `_content/Bluent.UI.Diagrams/bluent.ui.diagrams.min.css`. Diagram, DrawingCanvas, and shape types exist, but a minimal authoritative composition example requires source and runtime validation.

### 12. Blazor Web App render modes

Blazor WebAssembly is the verified onboarding path. The repository has a static SSR host shape, but interactive component behavior is not guaranteed under static rendering alone. Interactive Server, Interactive WebAssembly, and Interactive Auto remain unverified and are tracked in Issue #366.

### 13. Upgrade planning

Upgrade directly installed Bluent packages together, review changelog/release notes and target framework requirements, restore/build/test, verify canonical DI/container/assets, and smoke-test inputs, overlays, grids, charts, diagrams, themes, RTL, and the chosen render mode. Breaking behavior requires migration guidance.

### 14. Missing styles and overlays

First verify both `Bluent.UI` stylesheet URLs. Then verify `AddBluentUI()`, the `Bluent.UI.Components` import, one `Containers` instance in the active layout, and interactive rendering. Finally inspect static-web-asset requests and JavaScript module loading.

### 15. Repository contribution

Review `AGENTS.md`; preserve public consistency; update the component reference and inventory; add a changelog entry; add migration guidance for a breaking change; update runnable examples; and record build, test, pack, link, and relevant render-mode results in the pull request.

## Summary

- Total score: **99 / 150 (66%)**
- Compiled generated samples unchanged: **0**
- Compiled after repair: **0**
- Hallucinated packages/components/parameters: **0 recorded**; the agent refused unsupported API generation
- Strongest areas: installation, packages, theming, troubleshooting, upgrade workflow, contribution workflow
- Largest gaps: forms, DataGrid/DataPager, Charts, Diagrams, and runtime/render-mode examples
- Context-free discoverability: **not measured**
- Multi-model comparison: **not measured**

## Issues and next actions

- [Issue #366](https://github.com/vrassouli/Bluent/issues/366) tracks render-mode validation.
- Component documentation should start with forms and overlays, then DataGrid/DataPager, Charts, and Diagrams.
- The next benchmark run should use at least one context-free public assistant and preserve raw conversations.
- Generated examples should be placed in clean .NET 10 consumer projects and compiled before Build points are awarded.

## Baseline integrity statement

No Build points were awarded based on the repository CI run. The repository itself built, all 17 existing tests passed, and five NuGet packages were packed successfully, but those results do not prove that benchmark-generated consumer samples compile.
