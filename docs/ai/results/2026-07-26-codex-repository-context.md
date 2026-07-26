# AI-readiness benchmark rerun — 2026-07-26

## Outcome

One repository-context OpenAI Codex run scored **139/150 (92.7%)**, compared
with the committed repository-context baseline's **99/150 (66.0%)**. Nine of
ten generated samples compiled unchanged; the tenth compiled after one
documented repair. No hallucinated Bluent package, component, parameter,
event, namespace, or API was recorded.

This is a like-for-like context-assisted comparison, not evidence of
context-free discoverability or performance across multiple assistants.

## Environment and durable artifacts

| Field | Value |
| --- | --- |
| Provider | OpenAI |
| Assistant | Codex |
| Exact model | Not exposed by the product; not inferred |
| Execution date | 2026-07-26 |
| Context mode | Repository context plus canonical Sprint 4 documents |
| Repository access | Read access at `origin/Dev` commit `5483d3d` |
| Documentation access | `llms.txt`, canonical docs, task examples, and OrderDesk source |
| Web access | Available; used to inspect GitHub issue state, not to answer prompts |
| Reviewer | Codex self-review against repository source and compiler output |

The complete repeatable record is under
[`benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/):

- [`metadata.json`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/metadata.json)
  records provider, model exposure, date, access, supplied context, and build
  command.
- [`responses.md`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/responses.md)
  preserves all 15 exact prompts and first responses.
- [`results.csv`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/results.csv)
  records package, setup, API, hallucination, compilation, link, score, and
  rationale fields for every prompt.
- [`samples/`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/samples/)
  contains the generated consumer and ten representative samples.
- [`first-pass/DrawerAndPopover.razor`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/first-pass/DrawerAndPopover.razor)
  preserves the only non-compiling first-pass source, and
  [`repairs/`](../../../benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/repairs/)
  records both attempted repairs.

## Measured facts

### Score comparison

The baseline total remains **99/150**. Its printed API subtotal is `20`, but
the 15 committed row values sum to `18`; the comparison below uses the
row-derived subtotal so the categories reconcile to the committed total.

| Category | Baseline | Rerun | Change |
| --- | ---: | ---: | ---: |
| Discovery | 26/30 (86.7%) | 30/30 (100%) | +4 |
| Setup accuracy | 27/30 (90.0%) | 30/30 (100%) | +3 |
| API accuracy | 18/30 (60.0%) | 30/30 (100%) | +12 |
| Build | 0/30 (0.0%) | 19/30 (63.3%) | +19 |
| Explanation and canonical links | 28/30 (93.3%) | 30/30 (100%) | +2 |
| **Total** | **99/150 (66.0%)** | **139/150 (92.7%)** | **+40** |

No prompt text or rubric dimension changed. Build remains zero for five
prompts that did not request a compilable artifact, matching the baseline's
scoring treatment.

### Operational rates

| Measure | Baseline | Rerun |
| --- | ---: | ---: |
| Generated samples attempted | 0 | 10 |
| Compiled unchanged | 0; rate unavailable | 9/10 (90%) |
| Compiled after documented repair | 0; rate unavailable | 10/10 cumulative (100%) |
| Setup rubric accuracy | 27/30 (90.0%) | 30/30 (100%) |
| API rubric accuracy | 18/30 (60.0%) | 30/30 (100%) |
| Prompts with hallucinated APIs | 0/15 (0%) | 0/15 (0%) |
| Prompts with a non-compiling first pass | Not measured | 1/15 (6.7%) |
| Generated code samples with a non-compiling first pass | Not measured | 1/10 (10%) |

The baseline had no compiled generated samples, so its compilation success
rate is unavailable rather than a measured 0%. Its zero Build points are a
rubric result, not an observed compilation failure rate.

### Generated sample result

The unchanged aggregate build failed once:

```text
Pages/Samples/DrawerAndPopover.razor(31,52): error CS0104:
'DrawerContent' is an ambiguous reference between
'Bluent.AiReadiness.Generated.Shared.DrawerContent' and
'Bluent.UI.Components.DrawerContent'
```

The other nine samples compiled unchanged with zero warnings and zero errors
when the drawer sample was isolated. An alias-only repair did not affect Razor
resolution. Fully qualifying the application-owned type repaired the drawer,
after which the full ten-sample consumer compiled with zero warnings and zero
errors. The generated Bluent service and component APIs themselves were
current; the defect was an application type-name collision.

### Package, setup, API, and link findings

- Package selection was correct for the main UI, Core, Charts, Diagrams, and
  Utilities boundaries.
- Generated setup used `Bluent.UI.Components`, `Bluent.UI.Extensions`,
  `AddBluentUI()`, one `Containers` host, both base stylesheets, the Diagram
  stylesheet, and no invented global base-package or Chart.js script.
- Generated code compiled current form, validation, dialog, drawer, toast,
  DataGrid/DataPager, theme/RTL, Chart, and Diagram APIs.
- Render-mode answers used the post-validation compatibility evidence and did
  not repeat the baseline's now-stale “unverified interactive modes” status.
- Every response linked to a relevant canonical page. No unsupported adoption,
  Persian/RTL, editing, persistence, or render-mode claim was recorded.

## Interpretation

The 40-point improvement is consistent with the repository changes completed
by Issues [#391](https://github.com/vrassouli/Bluent/issues/391),
[#392](https://github.com/vrassouli/Bluent/issues/392), and
[#393](https://github.com/vrassouli/Bluent/issues/393):

- canonical compiled task sources supplied exact forms, DataGrid, overlays,
  Charts, Diagrams, theme, and RTL contracts;
- the negative-control compiler gate made source validity directly
  checkable; and
- OrderDesk showed how the same APIs compose in one application with domain
  code separated from component composition.

The largest score gains are API accuracy (+12) and Build (+19). That supports
the narrower conclusion that the new repository documentation is more usable
by a repository-aware coding assistant. It does not establish that public
models have learned Bluent or will discover it without supplied context.

## Remaining failures and follow-up

No recurring hallucinated Bluent API was observed in this single run. The one
actionable generated-code failure was converted into focused
[Issue #397](https://github.com/vrassouli/Bluent/issues/397): document and
compile-check application component naming collisions with Bluent public
types.

Remaining measurement gaps are broader than that source fix:

- context-free public discoverability remains unmeasured;
- repository-link-only and `llms.txt`-only modes remain unmeasured;
- there is still no independent multi-provider comparison; and
- runtime and visual behavior of the newly generated consumer was not tested.

## Limitations

- This is one run from the same assistant product family as the baseline.
- The exact model/deployment identifier was not exposed.
- Repository and canonical documentation context was available, so the run
  measures documentation usability, not prior knowledge.
- Self-generation and self-review can share blind spots, although compiler
  output independently checks the generated source surface.
- The ten code samples compile as one WebAssembly consumer. Compilation does
  not prove runtime interaction, visual quality, deployment, accessibility,
  Persian culture behavior, or every render mode.
- The baseline did not preserve independently compiled sample artifacts, so
  compilation-rate improvement cannot be expressed as a like-for-like
  percentage-point delta.

## Untested assistants and modes

No run is claimed for ChatGPT's consumer UI, Claude, Gemini, GitHub Copilot,
Microsoft Copilot, or any other external assistant. No context-free,
repository-link-only, `llms.txt`-only, web-only, or public-recommendation mode
was executed. No result for those assistants or modes is inferred from this
Codex repository-context run.

## Validation

Validation ran on 2026-07-26 on macOS 26.5.2, Apple Silicon, with .NET SDK
`10.0.300`:

- `dotnet tool restore` — passed.
- `dotnet restore Bluent.sln` — passed; all projects were up to date.
- `dotnet build Bluent.sln --configuration Release --no-restore -warnaserror`
  — passed with 0 warnings and 0 errors.
- `dotnet test Bluent.sln --configuration Release --no-build` — passed 19/19.
- `bash scripts/quality/check_task_examples.sh` — passed; the valid consumer
  compiled with 0 warnings and 0 errors, and the negative control failed as
  required with `CS0234` naming `InvalidTaskExample.cs.invalid`.
- `python3 scripts/quality/check_markdown_links.py` — passed across 50
  Markdown files.
- `python3 -m unittest -v scripts/release/test_release_tools.py` — passed
  13/13.
- Ruby parsed all three files under `.github/workflows/`.
- `git diff --check origin/Dev` — passed.
- `python3 benchmarks/ai-readiness/scripts/validate_run.py
  benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context`
  — passed for all 15 prompts.
- The repaired ten-sample consumer passed its Release build with warnings
  treated as errors: 0 warnings and 0 errors.

No runtime, visual, deployment, package, tag, release, external CI, or
external-assistant validation was run or claimed.
