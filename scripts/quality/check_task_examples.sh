#!/usr/bin/env bash
set -euo pipefail

project="samples/Bluent.TaskExamples/Bluent.TaskExamples.csproj"
collision_log="$(mktemp -t bluent-drawer-content-collision.XXXXXX)"
trap 'rm -f "$collision_log"' EXIT

echo "Building canonical task examples..."
dotnet build "$project" \
  --configuration Release \
  --no-restore \
  -warnaserror

echo "Verifying that an application-owned DrawerContent collision is rejected..."
if dotnet build "$project" \
  --configuration Release \
  --no-restore \
  -warnaserror \
  -p:ValidateDrawerContentCollision=true \
  >"$collision_log" 2>&1; then
  cat "$collision_log"
  echo "Expected the DrawerContent collision example to fail compilation." >&2
  exit 1
fi

if ! grep -Fq "DrawerContentCollision.cs.invalid" "$collision_log"; then
  cat "$collision_log"
  echo "The collision check failed without identifying its source file." >&2
  exit 1
fi

if ! grep -Fq "CS0104" "$collision_log"; then
  cat "$collision_log"
  echo "The collision check failed without the expected CS0104 ambiguity." >&2
  exit 1
fi

grep -F "DrawerContentCollision.cs.invalid" "$collision_log"
echo "Task examples compiled, and the DrawerContent collision was rejected with CS0104."
