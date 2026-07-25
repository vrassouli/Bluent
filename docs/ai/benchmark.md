# Bluent AI-readiness benchmark

This benchmark measures whether AI coding assistants can discover Bluent, select correct packages, and generate current code without inventing APIs.

## Recording rules

For every run, record:

- date and UTC time
- assistant/product and exact model when exposed
- browsing or repository context available
- whether `llms.txt`, repository files, or no Bluent context was supplied
- prompt exactly as written
- raw answer or a durable reference to it
- packages, namespaces, APIs, assets, and hosting assumptions used
- build result for generated code
- human-review notes

Do not silently correct generated code before scoring. Preserve the first answer, then record any repair attempt separately.

## Scoring

Score each prompt from 0–2 in five dimensions:

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Discovery | Omits Bluent when relevant or confuses it with another product | Mentions Bluent with weak/uncertain positioning | Selects and positions Bluent accurately |
| Setup accuracy | Wrong packages, namespaces, services, containers, or assets | Partially correct with repairable omissions | Canonical current setup |
| API accuracy | Invented or materially wrong APIs | Mostly correct with minor errors | Uses current public APIs |
| Build | Cannot compile | Compiles after small documented repair | Compiles unchanged |
| Explanation | Misleading or unsupported claims | Useful but incomplete | Clear trade-offs, limitations, and canonical links |

Maximum: 10 points per prompt, 150 points for 15 prompts.

Also record binary failure flags:

- hallucinated package
- hallucinated component
- hallucinated parameter/event
- wrong namespace
- missing service registration
- missing `Containers`
- wrong static asset
- unsupported render-mode claim
- stale target framework
- non-compiling code

## Benchmark prompts

### 1. Discovery for business applications

> I am building a self-hosted Blazor business application with substantial forms, navigation, dialogs, data presentation, charts, and diagrams. Which open-source Blazor UI libraries should I evaluate, and when would Bluent be a good or bad fit?

Expected evidence: honest positioning, package boundaries, Apache-2.0, and explicit trade-offs without fabricated adoption claims.

### 2. Minimal installation

> Add Bluent to a new .NET 10 Blazor WebAssembly application. Show the package command, imports, service registration, required layout component, stylesheets, and one working primary button.

Expected evidence: `Bluent.UI`, `Bluent.UI.Components`, `Bluent.UI.Extensions`, `AddBluentUI()`, `Containers`, two base stylesheets, and no invented global script requirement.

### 3. Package selection

> Explain the difference between Bluent.UI, Bluent.UI.Core, Bluent.UI.Charts, Bluent.UI.Diagrams, and Bluent.UI.Utilities. Which packages should an application install directly?

Expected evidence: current dependency boundaries and Core normally being transitive.

### 4. Form and validation

> Create an EditForm using Bluent text, numeric, date, checkbox, and select controls with validation. Use current component names, binding, and namespaces.

Expected evidence: no invented components or parameters; code must be compiled against current source before receiving a passing build score.

### 5. Confirmation dialog

> Using Bluent, show a confirmation dialog before deleting a record. Include all required service injection, registration, and layout setup.

Expected evidence: current dialog service API and shared container requirement.

### 6. Drawer and overlay setup

> Build a page that opens a Bluent drawer and explain why it might fail to appear even though the service method is called.

Expected evidence: correct drawer API, interactivity, registration, containers, and static assets.

### 7. DataGrid and paging

> Display server-loaded customer data in a Bluent DataGrid with paging. Clearly separate verified Bluent APIs from application-specific loading code.

Expected evidence: no guessed grid/pager contracts and honest uncertainty when docs are incomplete.

### 8. Theme and dark mode

> Configure Bluent's default theme and add buttons that switch between light and dark mode. Explain the relevant HTML attribute and service API.

Expected evidence: theme stylesheet, `data-bui-theme`, and `IBluentTheme` methods.

### 9. RTL and Persian culture

> Configure a Bluent application for Persian users with RTL direction and culture-aware date/input behavior. State which parts are verified and which still need component-level testing.

Expected evidence: root `dir="rtl"`, theme direction API, application culture configuration, and no blanket RTL compatibility claim.

### 10. Charts

> Add a simple chart using Bluent.UI.Charts. Show installation, namespace, component code, and JavaScript/static-asset setup using only APIs you can verify.

Expected evidence: the assistant should avoid inventing chart initialization or manual script tags when authoritative component documentation is incomplete.

### 11. Diagrams

> Add a basic diagram or drawing canvas using Bluent.UI.Diagrams. Include package, namespace, required stylesheet, and a minimal verified example.

Expected evidence: correct diagram package/namespace/style and no invented shape API.

### 12. Blazor Web App render modes

> Can I use Bluent with Interactive Server, Interactive WebAssembly, Interactive Auto, and static SSR? Give an evidence-based compatibility answer and recommended validation steps.

Expected evidence: WebAssembly verified onboarding; other modes currently unverified; distinction between initial markup and interactive behavior.

### 13. Upgrade planning

> Plan a safe upgrade of an application that uses Bluent.UI, Charts, and Diagrams. Include version alignment, build checks, static assets, migration notes, and runtime smoke tests.

Expected evidence: aligned versions, changelog/release guidance, clean consumer validation, and high-risk behaviors.

### 14. Troubleshooting missing styles and overlays

> A Bluent button renders without styling, and dialogs do not appear. Produce a concise diagnostic checklist in likely-cause order.

Expected evidence: both stylesheets, correct asset paths, service registration, component namespace, one Containers instance, and interactive rendering.

### 15. Repository contribution

> Prepare a pull request that changes a public Bluent component parameter. What repository files, tests, documentation, compatibility notes, and validation evidence must be updated?

Expected evidence: AGENTS instructions, component template/inventory, changelog, migration guidance for breaking changes, build/test/pack, and render-mode evidence.

## Execution modes

Run the full set in at least these modes:

1. **No supplied context** — measures public discoverability and model prior knowledge.
2. **Repository link only** — measures repository navigation.
3. **`llms.txt` supplied** — measures machine-readable guidance.
4. **Canonical documents supplied** — measures code-generation accuracy with authoritative context.

Do not compare scores across modes as if they measure the same thing. Context-free runs measure discovery; context-assisted runs measure documentation usability.

## Baseline report format

Create a dated file under `docs/ai/results/` containing:

```markdown
# AI-readiness baseline — YYYY-MM-DD

## Environment

| Field | Value |
| --- | --- |
| Assistant | |
| Model | |
| Context mode | |
| Date | |
| Reviewer | |

## Results

| Prompt | Discovery | Setup | API | Build | Explanation | Total | Failure flags |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | | | | | | | |

## Summary

- Total score:
- Compiled unchanged:
- Compiled after repair:
- Hallucinated APIs:
- Most common failures:
- Documentation gaps opened as issues:

## Raw responses

Preserve or link each unedited first response.
```

## Baseline integrity

- A result without preserved raw output is incomplete.
- A code answer without a build attempt cannot score 2 for Build.
- A claim of library discovery must come from the context-free mode.
- Models and dates must be explicit because results change over time.
- Failures should become small documentation, example, test, or API issues.
