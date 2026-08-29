# Bluent consumer skill

Use this skill when implementing user-facing Blazor UI with Bluent.

## Bluent-first rule

For interactive UI, prefer a Bluent component when Bluent already provides the required capability. Do not default to raw `<button>`, `<input>`, `<select>`, `<textarea>`, hand-built dialogs, menus, trees, or equivalent custom controls merely because they are quicker to write. Semantic and layout HTML remain appropriate.

Before introducing custom interactive UI:

1. route the need through [DECISION-GUIDE.md](DECISION-GUIDE.md);
2. find the family in [COMPONENT-INDEX.md](COMPONENT-INDEX.md);
3. read the linked canonical component/task documentation;
4. inspect current source/demo only when the canonical reference does not settle the question;
5. use custom/raw UI only for a genuine component gap or concrete framework/browser constraint.

## Retrieval workflow

Load only what the task needs:

- setup, packages, assets or render modes -> `references/foundation/setup-assets.md`
- theme/dark mode -> `references/foundation/theming.md`
- Persian/RTL/localization -> `references/foundation/rtl-localization.md`
- forms and validation -> `references/foundation/forms-validation.md`
- accessibility claims -> `references/foundation/accessibility.md`
- common UI composition -> the matching file under `references/patterns/`
- exact component API -> the canonical component reference linked by `COMPONENT-INDEX.md`

The files in this skill route to canonical repository documentation. They are not a second API encyclopedia.

## Authority and uncertainty

Use evidence in this order:

1. installed/released package API when the consumer is pinned to NuGet;
2. canonical `docs/components/...` reference matching that version;
3. current public source;
4. current runnable demo/example;
5. tests.

Never invent a component, namespace, parameter, event, enum value, service, asset, accessibility behavior, or render-mode guarantee.

If canonical docs are incomplete, say so and inspect current source/demo. Do not convert a plausible pattern into an authoritative claim.

## Version awareness

This skill is maintained from the Bluent `Dev` branch. `Dev` may contain APIs newer than the latest NuGet release. For an application consuming NuGet, prefer APIs matching its installed package version and treat unreleased `Dev` behavior as version-specific.

## Before completion

- confirm the selected component exists in the relevant package;
- verify parameter/event names against canonical docs or source;
- preserve `@bind-*` conventions;
- include required service registration, containers and assets;
- check RTL/localization, accessibility and render-mode constraints only where verified;
- build/test the consumer when practical;
- if you discover a documentation/source mismatch, report it instead of guessing.
