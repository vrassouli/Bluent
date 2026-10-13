# #418 → #501 draft Focus2 token crosswalk (source → semantic → Button)

**2026-10-13 | Status: additive opt-in research contract; no accepted public v3 token API.**

## Why this exists

The existing draft `--bui-v3-border-focus` aliases `--colorBrandBackground`. It is **preserved for compatibility** and was not suitable as the only keyboard ring on all ten Dark brand surfaces (1.94–2.15:1 against the adjacent host). The corrected, project-owned Penpot board `cd054205-a525-80d8-8008-c87438620de4` (file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `acf5f619-7d81-80da-8008-c5ef1089ac94`) documents a separate 2px outer ring at a 1px offset, with an additional canvas-colored 1px gap. #501 page 38 contains the source-linked native Button Focus=Visible design for five appearances; its user-reported asymmetrical ring layout was corrected to the same nominal outer/inner distances. Those changes were actually performed and audited in Penpot; they do **not** constitute a final design approval.

The #418 opt-in **versioned preview schema** now explicitly models the **separate** alternative:

| Layer | Logical name | CSS variable | Upstream |
| --- | --- | --- | --- |
| Fluent source | `bluent.source.focusStroke2` | `--colorStrokeFocus2` | Actual existing emitted brand Light/Dark CSS |
| Semantic candidate | `bluent.semantic.focusRing.strongCandidate` | `--bui-v3-focus-ring-strong-candidate` | Source Focus2 |
| Button candidate | `bluent.component.button.focusOuterCandidate` | `--bui-v3-button-focus-outer-candidate` | Semantic strong candidate |

The original semantic `bluent.semantic.border.focus` / `--bui-v3-border-focus` remains mapped to `--colorBrandBackground`, **unchanged**. Thus the draft schema is now **12 source + 13 semantic + 10 component = 35 logical tokens** per combination. The generator checks every source value against existing theme source files before emitting research-only CSS and a 20-combination source matrix; it refuses missing or unresolvable source declarations, duplicate aliases or circular references. None of the CSS is added to a stable `bundleconfig.json` or `Bluent.UI` NuGet release.

## Reproducible real browser contract evidence

- `python scripts/quality/generate_v3_token_preview.py --check`: deterministic source crosswalk and committed output check over **10 brands × Light/Dark = 20 combinations × 35 tokens**.
- `python scripts/quality/probe_v3_token_preview.py`: **200/200 real Chromium computed-style assertions**, up from 140: the existing seven checks plus candidate outline color/width/offset on each brand/mode, all drawn from the generated schema, without mutating any legacy source variable.
- `python -m unittest discover -s scripts/quality -p test_v3_focus_alias_contract.py -v`: **4/4** positive/negative source/semantic/component chain and 3:1 numerical contrast checks, including test that the old brand-focus alias still exists and the candidate never overrides its upstream source variable.
- Previous [real Blazor layout, forced-colors and screenshot-paint tests](FOCUS-RING-PAINT-STACK-AUDIT.md) tested the opt-in demo treatment in Chrome/Edge × WASM/InteractiveServer, with 2px painted top/bottom stroke and the same 1px offset. These are separate from static CSS alias-resolution assertions; do not count them as a new public Button API.

**Limits:** the candidate CSS aliases are available only within `[data-bui-v3-tokens]` opt-in scope; the Styling Lab's historical separate opt-in candidate directly references source Focus2. Combining the two demos into one production Button token resolution, creating native Penpot TokenSet bindings for all 20 combinations, actual browser UI Zoom/AT certification and the final brand-aware semantic approval remain decisions for #418/#501. #428 owns the eventual shipping Button rewrite, `aria-pressed` toggle semantics, exhaustive demo/Docs/Skills and migration. This is not a blanket WCAG certificate or acceptance of the candidate as public API.

## Migration and rollback

No consumer migration is required while the candidate remains opt-in and unreleased. To revert this experiment remove the **three additive preview-only** tokens, regenerate the draft CSS/matrix and remove the associated browser contract test. Do **not** remove or rename `--bui-v3-border-focus`; existing nonopted-in styles must continue rendering identically. No changes in `Dev`, stable NuGet, or production deployments.
