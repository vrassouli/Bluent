# Bluent v3 Label implementation handoff

Use this Skill only for the isolated v3 Label task [#430](https://github.com/vrassouli/Bluent/issues/430). It is a branch-local development handoff, **not a released v3 API** and not the reference for an existing 2.x NuGet consumer. Keep work on `v3/issue-430-label` targeting `bluent-v3`; do not merge into `Dev`, `main`, or a stable 2.x branch.

## Retrieval order

1. [Canonical v3 Label reference](../../../docs/v3/components/label.md) for the current source-backed API, token roles, semantics and evidence boundaries.
2. [Component router](../bluent-v3/COMPONENT-ROUTER.md) and [v3 issue workflow](../../../docs/v3/ISSUE-WORKFLOW.md) for owner/status/branch decisions.
3. [Source-owned design references](../../../docs/v3/design/BLUENT-V3-PENPOT.md) plus Label page 48/49 in the Bluent v3 Design System Penpot file.
4. Actual source: `src/Bluent.UI/Components/LabelComponent/`, `src/Bluent.UI/Components/PopoverComponent/`, and `src/Bluent.UI.Scripts/src/Popover/Popover.ts`.
5. `src/Bluent.UI.Demo.Pages/Pages/Components/Labels.razor` and the repeatable Label/Popover contracts under `scripts/quality/`.

## Non-negotiable Label contract

- Preserve the native `<label>` as the association target. `ForExpression.GetMemberName()` supplies the default `for`; the expression display name is used only when `Text` is absent. Preserve unmatched attributes and generated `Id`/`Class`/`Style` precedence.
- With no `Info`, keep the original native Label markup path. With `Info`, render the action Button as a **sibling** of the native `<label>`, not inside it.
- `InfoButtonAriaLabel` overrides a localized default name composed from the visible label plus “more information”. No empty-name icon-only Info action.
- Required and Disabled are visual Label states only. The marker is `aria-hidden`; the associated input owns native required, validation and disabled semantics.
- Use `--bui-v3-text-primary`, `--bui-v3-text-disabled`, and `--bui-v3-text-danger-accessible` with the approved source fallbacks in the canonical reference. Reuse global typography/spacing; do not create `component.label.*` tokens.
- Use the shared Popover owner for expanded/controls state, Escape/focus restoration, outside dismissal and focus-leave cleanup. Do not add an independent Label document keyboard listener or a focus trap.
- Keep English and `fa-IR` resource strings in sync; maintain logical CSS for RTL.

## Regression checks

```powershell
python scripts/quality/check_v3_label_contract.py
python -m unittest discover -s scripts/quality -p 'test_v3_label_contract.py' -v
python scripts/quality/check_v3_popover_js_bundle.py
python -m unittest discover -s scripts/quality -p 'test_v3_popover_js_bundle.py' -v
python scripts/quality/check_v3_docs_contract.py
python scripts/quality/check_v3_skill_contract.py
dotnet build Bluent.sln --configuration Release --no-restore -warnaserror
dotnet test Bluent.sln --configuration Release --no-build
```

Rebuild TypeScript ESM/global bundles from `src/Bluent.UI.Scripts` and synchronize the tracked `src/Bluent.UI/wwwroot/bluent.ui*.js*` assets. Rebuild Sass with the pinned `sass@1.93.2`, then rebuild `Bluent.UI` so the minified published component CSS follows the SCSS. Never edit generated bundles/minified CSS as the source of truth.

## Evidence and maturity

Source/contract/unit/build evidence is not a substitute for real Chrome/Edge WebAssembly/InteractiveServer tests, responsive/RTL/Light/Dark runtime probes, computed accessibility-tree checks, native Windows Contrast Themes or spoken screen-reader acceptance. Record exact commit/browser/render mode for every runtime result; do not infer any unrun evidence. The broader #418 foundation task remains In progress even though the three Label consumer mappings have been approved.
