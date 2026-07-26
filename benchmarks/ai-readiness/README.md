# Bluent AI-readiness benchmark workspace

This directory contains reproducible execution artifacts for the canonical
[AI-readiness benchmark](../../docs/ai/benchmark.md). The canonical prompt text
and scoring rubric remain in that document; run records repeat the exact prompt
so each result is self-contained.

## Layout

```text
benchmarks/ai-readiness/
├── README.md
├── run-template.md
├── scripts/
│   └── validate_run.py
└── runs/
    └── YYYY-MM-DD-provider-model-context/
        ├── metadata.json
        ├── responses.md
        ├── results.csv
        └── samples/
```

`responses.md` preserves the first generated answer or links to its unchanged
generated source. `results.csv` contains the five rubric dimensions, failure
flags, compilation result, package/setup/API review, canonical-link review,
and rationale for every prompt. `metadata.json` records the environment and
access mode without guessing an unexposed model identifier.

## Run procedure

1. Create a run directory from [run-template.md](run-template.md).
2. Record provider, exact model identifier when exposed, date, context mode,
   repository/documentation/web access, and reviewer before scoring.
3. Copy each prompt exactly from the canonical benchmark and preserve the
   first response before compiling or repairing it.
4. Materialize representative code answers under the run's `samples/`
   directory. Do not silently correct them.
5. Run the sample's documented build command. Record the unchanged result and
   keep any repair as a separate artifact.
6. Fill one `results.csv` row per prompt and validate the record:

   ```bash
   python3 benchmarks/ai-readiness/scripts/validate_run.py \
     benchmarks/ai-readiness/runs/<run-directory>
   ```

7. Publish a dated interpretation under `docs/ai/results/`. Keep measured
   facts, interpretation, limitations, and untested assistants or modes in
   separate sections.

## Comparison rules

- Compare like-for-like context modes and disclose context differences.
- Report both rubric points and operational rates. A baseline with no compiled
  samples has an unavailable compilation rate, not a measured 0% failure rate.
- Count hallucination frequency as prompts with at least one hallucinated
  package, component, parameter, event, namespace, or API.
- Compilation only proves the generated source builds. It does not substitute
  for runtime, visual, deployment, or cross-render-mode evidence.
- Do not infer external-assistant results from this repository or from another
  provider's output.
