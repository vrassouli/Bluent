# AI-readiness run template

Create one immutable run directory per provider, model, date, and context mode.

## Required metadata

Store these fields in `metadata.json`:

- `schema_version`
- `run_id`
- `provider`
- `assistant`
- `model_identifier`
- `model_identifier_exposed`
- `execution_date`
- `execution_timezone`
- `context_mode`
- `repository_access`
- `documentation_access`
- `web_access`
- `supplied_context`
- `reviewer`
- `baseline_reference`
- `sample_build_command`

Use `null` for an unavailable model identifier and explain why. Never infer a
marketing or deployment name that the product did not expose.

## Required response record

For each of the 15 canonical prompts, `responses.md` must contain:

1. the prompt number and title;
2. the exact prompt in a block quote;
3. the unedited first response or a durable link to unchanged generated source;
4. any repair attempt clearly labeled and stored separately.

## Required result columns

`results.csv` must contain:

```text
prompt,title,discovery,setup,api,build,explanation,total,packages,setup_review,api_review,hallucinated_apis,compilation_result,canonical_links,failure_flags,rationale
```

Scores are integers from 0–2 and `total` is their sum. Use `none` for an empty
failure-flag set and `not_applicable` when a prompt does not produce a
compilable sample.

## Integrity checklist

- [ ] All 15 exact prompts are present.
- [ ] First responses were preserved before repair.
- [ ] Provider/model exposure and access modes are explicit.
- [ ] Every score has a rationale.
- [ ] Every code answer has a compile result or an explicit reason.
- [ ] Package, setup, API, hallucination, and link quality are reviewed.
- [ ] The dated report separates facts, interpretation, limitations, and
      untested modes.
