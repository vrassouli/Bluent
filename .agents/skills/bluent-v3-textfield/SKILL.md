# Bluent v3 TextField — task-branch handoff

> **Issue #432 is accepted and merged into bluent-v3 via PR #562 (task head 5d0aef5d).** This is an unreleased v3 component implementation, not a stable consumer API or a global #418 token approval. The existing 2.x consumer Skill and reference remain authoritative for released packages.

## Retrieval order

1. [Canonical v3 TextField implementation record](../../../docs/v3/components/text-field.md) for the current direct/inherited API, usage and evidence boundaries.
2. [Design/API contract](../../../docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md) for exact source audit, Fluent Web Components vs React crosswalk, 24 acceptance scenarios, caret mapping and Penpot IDs.
3. The connected owned Penpot file **Bluent v3 Design System**, file b64f6665-c9ab-80b5-8008-c4ac99d9d000, pages 16–20. Pages 17–20 remain visibly DRAFT; decision comments on pages 17–20 record task-specific delegated acceptance for #432 only (2026-11-14). Do not treat the board labels or that task decision as approval of #418 or native OS/AT acceptance.
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
- Placeholder mapping accepted for #432 under delegated design review: pinned Fluent Web Components 3.1.3 uses colorNeutralForeground4 for ordinary placeholder and colorNeutralForegroundDisabled when disabled. Until #418 integrates bluent.semantic.text.placeholder / --bui-v3-text-placeholder, use --colorNeutralForeground4 directly; do not consume the unmerged alias. Reuse the existing shared --bui-v3-text-disabled role for the disabled state with exact source fallback. Placeholder is not an accessible name. See docs/v3/tokens/TEXTFIELD-PLACEHOLDER-DECISION.md.
- The #418 preview schema includes source bluent.color.foreground4 and proposed semantic bluent.semantic.text.placeholder; its 20 brand/mode FG4/BG3 contrast regression must remain green. The TextField-specific source-role choice is accepted, but the semantic alias remains unconsumed until #418 integration; the entire foundation public token vocabulary/mapping is still under review.

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

The persistent Windows matrix is in .github/workflows/v3-compatibility-browsers.yml. Exact-head CI on 14b8357522dc81f991a2e028ebc8f4254179ec11 passed Chrome/WASM 25/25, Edge/WASM 25/25, Chrome/InteractiveServer 24/24 and Edge/InteractiveServer 26/26 (100/100 aggregate; workflow run 43585766019). A later local Edge/InteractiveServer refresh passed 26/26 against the real SSR host, final CSS and SignalR HTTP 101. After the native evidence commit, rerun exact-head CI before moving #432 to Review.
## Native Windows and Persian keyboard verification — 2026-11-14

- Native Windows High Contrast White was enabled through the system-parameters API and observed by Edge as forced-colors active. With the actual Bluent component stylesheet loaded (883 rules), field border computed to CanvasText, disabled border/input to GrayText, and active 2px underline to Highlight.
- The live showcase exposed 21/21 named textboxes in the Chromium accessibility tree, including distinct native disabled and readonly states. Actual Narrator spoken output was not captured/listened to, so spoken AT acceptance remains unverified.
- Windows Persian input method 0429:00000429 was selected via Win+Space. Physical key events A/S/D produced Persian شسی without Unicode injection. A real key event replaced selection range [1,2] in the Persian-normalization specimen; beforeinput/input reported ش, the value became کشس, and the caret returned to index 2.
- The standard Persian keyboard layout produced direct text input (isComposing=false); no compositionstart, compositionupdate or compositionend event occurred. This does not certify a composition/candidate-based IME lifecycle.
- Evidence files: docs/v3/quality/evidence/BLUENT-TEXTFIELD-WINDOWS-HIGH-CONTRAST.json/.png and BLUENT-TEXTFIELD-WINDOWS-PERSIAN-KEYBOARD.json/.png.
- High Contrast flags were restored to 126/off, original Custom.theme restored, and active keyboard layout restored to English 0x04090409.
- Task-specific design/token acceptance is recorded in Penpot pages 17–20. Those boards retain DRAFT labels; the global #418 foundation remains under Review.
## Accepted implementation — 2026-11-14

PR #562 is merged into bluent-v3 after delegated technical review. Exact task-head CI passed 8/8 workflows and 28/28 checks, with the four-way Chrome/Edge × WebAssembly/InteractiveServer TextField matrix all green. Native Windows High Contrast and direct Persian keyboard-layout selection/caret behavior were also verified and recorded in JSON/PNG evidence.

Do not claim composition-based OS IME lifecycle or spoken Narrator output: neither was certified. Penpot pages 17–20 retain DRAFT labels; task-specific decisions were accepted, while #418 global token foundation remains separate. The public TextField API contains no Appearance parameter; Filled visual boards are not a shipped public appearance API. Stable 2.x/Dev packages and deployments remain unchanged.