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

**Real Blazor demo consumer:** the existing `/v3/styling-lab` host already has `data-bui-v3-tokens` and loads `src/Bluent.UI.Demo.Pages/wwwroot/v3/issue-418.opt-in.preview.css`. Its two separately enabled Focus2 candidate cases now resolve `--v3-lab-focus` through `--bui-v3-button-focus-outer-candidate` (with `--colorStrokeFocus2` as a fallback for the research-only demo). The static demo CSS is generated from four source previews by `python scripts/quality/sync_v3_token_demo_asset.py`. The direct browser probe initially exposed a **real sync defect**: the schema and generated docs CSS had the alias, but the demo CSS did not, leaving the candidate outline visually correct only because of the fallback. The demo asset was regenerated, and both `v3-token-contract.yml` and `v3-browser-lab.yml` now run `sync_v3_token_demo_asset.py --check` so that drift cannot recur silently.

**Limits:** the source/semantic/component candidate chain is now consumed by the **opt-in real Blazor Styling Lab**, but this is not production Button CSS or an approved public contract. Connecting native Penpot TokenSet bindings for all 20 brand-mode designs, actual browser UI Zoom/AT certification and final semantic-token naming approval remain future acceptance gates for #418/#501. #428 owns the eventual shipping Button rewrite, `aria-pressed` toggle semantics, exhaustive demo/Docs/Skills and migration. This is not a blanket WCAG certificate or acceptance of the candidate as public API.

## Migration and rollback

No consumer migration is required while the candidate remains opt-in and unreleased. To revert this experiment remove the **three additive preview-only** tokens, regenerate the draft CSS/matrix and remove the associated browser contract test. Do **not** remove or rename `--bui-v3-border-focus`; existing nonopted-in styles must continue rendering identically. No changes in `Dev`, stable NuGet, or production deployments.

## Real source-owned Penpot native token follow-through (2026-10-13)

The same **draft** source→semantic→Button ring alias names were also created as actual editable native Penpot TokenSets in the project-owned `Bluent v3 Design System` file (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), not merely drawn in a static diagram:

| Mode | Candidate TokenSet ID | Source Focus2 |
| --- | --- | --- |
| Light | `5d7c31da-9e95-80b3-8008-c899a1590197` | `#000000` |
| Dark | `5d7c31da-9e95-80b3-8008-c899a1719fcf` | `#FFFFFF` |

Each set holds five actual native tokens: three for the source/semantic/Button outer ring plus two **Penpot-specific** aliases for the surface-colored contrast gap. Both were attached to their respective *existing* Light/Dark Mode themes and **twelve** actual `strokeColor` properties were bound on the five enabled native Button Appearance×Focus variants plus Danger (two strokes each). Light source/semantic/component alias resolution and stroke binding were verified in the connected Penpot plugin. The plugin **froze after toggling Dark and disconnected before the Dark readback and default-Light restore**, so those two checks remain unverified and must not be treated as passed. The committed repeatable connected-design audit and exact IDs are documented in #501 [native token bridge](../design/BUTTON-FOCUS-NATIVE-TOKEN-BRIDGE.md).

**Historical Penpot inventory updates:** before this experiment the file had 38 sets / 195 native tokens; these additive research sets bring its candidate inventory to **40 sets / 205 tokens**, pending a subsequent connected-file recount. Earlier 38/195 checkpoint counts in historical documents describe their original observation and should not be confused with the latest candidate state.

The two Penpot contrast-gap alias names **are not in the 35-token CSS generator schema** because no final public CSS gap alias is approved. The extra Penpot-specific bindings must not be promoted to shipping CSS without explicit #418/#501 design acceptance.