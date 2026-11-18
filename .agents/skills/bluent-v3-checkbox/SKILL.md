# Bluent v3 Checkbox — task implementation handoff

> **Task-branch retrieval guide, not a released consumer API.** Use with issue [#434](https://github.com/vrassouli/Bluent/issues/434) and the [canonical v3 Checkbox record](../../../docs/v3/components/checkbox.md). The existing [2.x Checkbox reference](../../../docs/components/checkbox.md) remains authoritative for released packages.

## Verified source and API

- Package / namespace: `Bluent.UI` / `Bluent.UI.Components`.
- Source: `src/Bluent.UI/Components/CheckBoxComponent/`.
- Types: `Checkbox<TValue>` accepts `bool` and `bool?` only; `CheckboxSize` is Medium/Large; the shared `LabelPosition` is After/Before.
- Direct parameters remain `Label`, `UncheckedLabel`, `IndeterminateLabel`, `Required`, `Circular`, `Size`, and `LabelPosition`.
- Inherited binding and validation come from `InputBase<TValue>`; no child-content slot or new public parameter is added.
- `Required` is marker text only. Use an actual HTML `required` attribute or the consuming form's validation rules for required semantics.

## Current task implementation decisions

- The native `input[type=checkbox]` remains the only interactive/semantic control.
- A nullable `null` value synchronizes to native `input.indeterminate`; do not author `aria-checked` or a custom checkbox role.
- Native activation is Mixed → Checked → Unchecked. Application code sets `null` again when needed.
- The Required marker remains inside the associated label for pointer activation and is `aria-hidden`; `aria-labelledby` references only the text span. A caller's non-empty `aria-label`/`aria-labelledby` takes precedence.
- Use the Fluent 2 30-case matrix plus six Bluent Error extensions. Error is a validation state, not an additional Fluent interaction state.
- Use existing theme roles only; do not consume draft #418 aliases or introduce global tokens.
- Keep the 2px focus ring, distinct Hover/Pressed, native Disabled, forced-colors/reduced-motion, logical RTL layout and 24×24 CSS-pixel target policy.

## Verified fixtures and evidence

- WebAssembly demo: `/components/checkboxes` from `src/Bluent.UI.Demo.Pages/Pages/Components/Checkboxes.razor`.
- InteractiveServer QA host: `/compatibility/checkboxes-server` from `src/Bluent.UI.Demo.SSR/Components/Pages/CheckboxInteractiveServerProbe.razor`.
- .NET render contract tests: `tests/RegexSampleGeneratorTest/CheckboxRenderSemanticsTests.cs`.
- Source styles: `src/Bluent.UI/Styles/Components/_checkbox.scss`.
- Native indeterminate module: `src/Bluent.UI/wwwroot/bluent.ui.checkbox.js`.
- Current local checkpoint (Dev01, 2026-11-17): focused .NET render suite 112/112; Release `Bluent.UI` and SSR host builds plus Debug WASM host build pass with 0 warnings/errors. Real Chrome/Edge × WebAssembly/InteractiveServer probes pass 22/22 per cell (88/88 total), including native `indeterminate` and computed AX mixed state, click/Space transitions, Required accessible-name isolation, native Disabled/validation, focus/hover/pressed, forced-colors/reduced-motion and 320px no-overflow. Four JSON reports and eight PNGs are retained under `docs/v3/quality/evidence/BLUENT-CHECKBOX-*`. The optional Blazor hot-reload settings 404 is informational tooling traffic; all application HTTP/console/exception gates pass. Exact-head hosted CI, native OS contrast and spoken AT acceptance remain open.

## Boundary and workflow

- The component-specific design direction was delegated and recorded in Penpot pages 56–57 and issue #434 on 2026-11-17.
- #418 still owns global token vocabulary and production alias approval. This task must not add dependencies on unapproved #418 aliases.
- The Component Lab platform slice from #421 is accepted; the wider 66-family coverage ledger remains separate.
- Keep this work on a dedicated branch targeting `bluent-v3`. Never merge to stable `Dev`/`main`, publish NuGet, or imply released support.
- Mark the family accepted only after exact-head CI, four-cell runtime, documentation/migration, reviewer and maintainer acceptance gates pass. Native OS/AT claims must remain explicit and evidence-backed.
