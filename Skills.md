# Bluent consumer skill compatibility pointer

The canonical coding-agent skill for consuming Bluent is now:

- `.agents/skills/bluent/SKILL.md`

Use that skill as the retrieval/router entry point. It links to canonical documentation under `docs/` and to focused references under `.agents/skills/bluent/references/`.

`Skills.md` intentionally does **not** duplicate component APIs, setup instructions, icon catalogs, or usage recipes. Keeping a second monolithic catalog here would create documentation drift and conflict with the source-of-truth model tracked by issue #406.

For human-readable documentation, start at:

- `docs/README.md`
- `docs/getting-started/index.md`
- `docs/components/inventory.md`

If an older automation still discovers `Skills.md`, treat this file only as a compatibility pointer and continue with `.agents/skills/bluent/SKILL.md`.
