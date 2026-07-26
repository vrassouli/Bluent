#!/usr/bin/env bash
set -euo pipefail

project="samples/Bluent.TaskExamples/Bluent.TaskExamples.csproj"
invalid_log="$(mktemp -t bluent-invalid-task-example.XXXXXX)"
trap 'rm -f "$invalid_log"' EXIT

echo "Building canonical task examples..."
dotnet build "$project" \
  --configuration Release \
  --no-restore \
  -warnaserror

echo "Verifying that an invalid example is rejected..."
if dotnet build "$project" \
  --configuration Release \
  --no-restore \
  -warnaserror \
  -p:ValidateInvalidTaskExample=true \
  >"$invalid_log" 2>&1; then
  cat "$invalid_log"
  echo "Expected the deliberately invalid task example to fail compilation." >&2
  exit 1
fi

if ! grep -Fq "InvalidTaskExample.cs.invalid" "$invalid_log"; then
  cat "$invalid_log"
  echo "The negative control failed without identifying its source file." >&2
  exit 1
fi

grep -F "InvalidTaskExample.cs.invalid" "$invalid_log"
echo "Task examples compiled, and the negative control was rejected with a focused diagnostic."
