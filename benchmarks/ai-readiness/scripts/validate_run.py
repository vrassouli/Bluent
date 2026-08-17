#!/usr/bin/env python3

import csv
import json
import sys
from pathlib import Path


REQUIRED_METADATA = {
    "schema_version",
    "run_id",
    "provider",
    "assistant",
    "model_identifier",
    "model_identifier_exposed",
    "execution_date",
    "execution_timezone",
    "context_mode",
    "repository_access",
    "documentation_access",
    "web_access",
    "supplied_context",
    "reviewer",
    "baseline_reference",
    "sample_build_command",
}

REQUIRED_COLUMNS = [
    "prompt",
    "title",
    "discovery",
    "setup",
    "api",
    "build",
    "explanation",
    "total",
    "packages",
    "setup_review",
    "api_review",
    "hallucinated_apis",
    "compilation_result",
    "canonical_links",
    "failure_flags",
    "rationale",
]


def fail(message: str) -> None:
    raise SystemExit(f"AI benchmark validation failed: {message}")


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: validate_run.py <run-directory>")

    run_directory = Path(sys.argv[1])
    metadata_path = run_directory / "metadata.json"
    responses_path = run_directory / "responses.md"
    results_path = run_directory / "results.csv"

    for path in (metadata_path, responses_path, results_path):
        if not path.is_file():
            fail(f"missing {path}")

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    missing_metadata = sorted(REQUIRED_METADATA - metadata.keys())
    if missing_metadata:
        fail(f"metadata fields missing: {', '.join(missing_metadata)}")

    responses = responses_path.read_text(encoding="utf-8")
    missing_prompts = [
        str(prompt)
        for prompt in range(1, 16)
        if f"## {prompt}." not in responses
    ]
    if missing_prompts:
        fail(f"response sections missing: {', '.join(missing_prompts)}")

    with results_path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != REQUIRED_COLUMNS:
            fail("results.csv columns do not match the required schema")
        rows = list(reader)

    if len(rows) != 15:
        fail(f"expected 15 result rows, found {len(rows)}")

    expected_prompts = {str(prompt) for prompt in range(1, 16)}
    actual_prompts = {row["prompt"] for row in rows}
    if actual_prompts != expected_prompts:
        fail("results.csv prompt numbers must be exactly 1 through 15")

    for row in rows:
        scores = []
        for dimension in ("discovery", "setup", "api", "build", "explanation"):
            try:
                score = int(row[dimension])
            except ValueError:
                fail(f"prompt {row['prompt']} has a non-integer {dimension} score")
            if score not in (0, 1, 2):
                fail(f"prompt {row['prompt']} has an out-of-range {dimension} score")
            scores.append(score)

        if int(row["total"]) != sum(scores):
            fail(f"prompt {row['prompt']} total does not equal its dimension sum")

        for field in REQUIRED_COLUMNS:
            if row[field].strip() == "":
                fail(f"prompt {row['prompt']} has an empty {field} field")

    print(
        f"AI benchmark run is structurally valid: {run_directory} "
        f"({len(rows)} prompts)"
    )


if __name__ == "__main__":
    main()
