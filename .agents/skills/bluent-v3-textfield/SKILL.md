# Bluent v3 TextField — task-branch handoff

> **Issue #432 is In progress.** This is a source-backed implementation handoff for `v3/issue-432-textfield` targeting `bluent-v3`, not a released consumer API or an accepted Fluent parity claim. The existing [2.x consumer Skill](../bluent/SKILL.md) and [2.x TextField reference](../../../docs/components/text-field.md) remain authoritative for released packages.

## Retrieval order

1. [Canonical v3 TextField implementation record](../../../docs/v3/components/text-field.md) for the current direct/inherited API, usage and evidence boundaries.
2. [Design/API contract](../../../docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md) for exact source audit, Fluent Web Components vs React crosswalk, 24 acceptance scenarios, caret mapping and Penpot IDs.
3. The connected owned Penpot file **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, pages 16–20. Pages 17–20 remain DRAFT; do not infer approval from their existence.
4. Source under `src/Bluent.UI/Components/TextFieldComponent/`, state stylesheet `src/Bluent.UI/Styles/Components/_text-field.scss`, and shared field shell `src/Bluent.UI/Styles/Components/_field.scss`.
5. Focused showcase `/components/text-fields`; the reusable current-API regression pilot is separate at `/component-lab`.
6. [TextField source/API/demo guard](../../../scripts/quality/check_v3_textfield_contract.py) and its negative tests.

## API and behavior rules

- Keep the direct parameters source-backed: `Rows`, `ResizeTextarea`, `GainFocus`, `DigitOnly`, `AsciiDigits`, `ArabicToPersianConversion`.
- The component inherits `Value`/`ValueChanged`/`ValueExpression` and `EditContext` semantics from `InputBase<string?>`, plus `StartAddon`, `EndAddon`, `Size`, `BindValueEvent`, `Class` and `Style` from its Bluent bases.
- Render native `input` or `textarea`; preserve native browser caret, selection, IME, paste and autofill behavior. Do not use `contenteditable`.
- Transform order is fixed: DigitOnly → AsciiDigits → ArabicToPersianConversion. When normalization changes text, map UTF-16 selection offsets through normalized prefixes and restore selection after render.
- `disabled` and `readonly` are native unmatched attributes and have distinct keyboard semantics. ReadOnly is focusable/selectable; disabled is not focusable.
- Validation errors from the active EditContext set `aria-invalid=true` on the native element. Consumers still render and associate readable validation text with `aria-describedby`.
- An interactive addon is a separate control with its own accessible name and focus stop; never treat an addon as part of the input itself.
- Do not invent `Appearance`, `HelperText`, `ErrorMessage`, `Required`, a new `ReadOnly` parameter, focus callback or new size enum. Final TextField token names/modes/brand mappings belong to #418 and remain pending review.
- Placeholder mapping selected from pinned Fluent Web Components 3.1.3: ordinary placeholder uses colorNeutralForeground4 through --bui-v3-text-placeholder; disabled placeholder reuses --bui-v3-text-disabled → colorNeutralForegroundDisabled. Both aliases have the exact Fluent source token as fallback. Placeholder is not an accessible name. See docs/v3/tokens/TEXTFIELD-PLACEHOLDER-DECISION.md.
- The #418 preview schema adds source bluent.color.foreground4 and semantic bluent.semantic.text.placeholder; its 20 brand/mode FG4/BG3 contrast regression must remain green. This resolves the TextField consumer mapping, not the entire foundation's public token approval.

## Verification

Run from the repository root:

```powershell
python scripts/quality/check_v3_textfield_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_textfield_contract.py' -v
python scripts/quality/check_v3_docs_contract.py
python scripts/quality/check_markdown_links.py
dotnet build Bluent.sln --configuration Release --no-restore -warnaserror
dotnet test Bluent.sln --configuration Release --no-build
```

Keep evidence categories distinct: source/API guard, build, unit tests, real browser interaction, visual Penpot review, native Windows contrast and assistive technology are separate gates. The historical 1,106 shared Component Lab assertions cover the current API, not this v3 implementation. A Release build alone is not browser acceptance.

## Branch and release isolation

PR #562 targets `bluent-v3`. Never merge this task into `Dev`, `main`, stable/release branches or v2.x. Do not publish NuGet packages or deploy from this branch. #432 stays In Progress until the approved design/token dependencies, full demo, browser/migration evidence and maintainer review are genuinely complete and the accepted PR is merged into `bluent-v3`.

## Real-browser runtime matrix

The reusable scripts/quality/probe_v3_textfield_demo.mjs uses Chrome DevTools Protocol and supports these environment variables:

- CHROME_PATH: exact Chrome or Edge executable.
- BLUENT_BROWSER_LABEL: Chrome or Edge.
- BLUENT_TEXTFIELD_ROUTE: defaults to /components/text-fields; Server uses /compatibility/text-fields-server.
- BLUENT_TEXTFIELD_RENDER_MODE: defaults to WebAssembly; Server uses InteractiveServer.

It tests 23 assertions per run and writes a JSON + PNG pair to docs/v3/quality/evidence/. Verified local matrix: Chrome/Edge × WebAssembly/InteractiveServer, 23/23 each (92/92 total). All runs had zero runtime signals and QA-owned browser cleanup remaining=0. The persistent Windows matrix is in .github/workflows/v3-compatibility-browsers.yml; exact-head GitHub CI must still finish after push.