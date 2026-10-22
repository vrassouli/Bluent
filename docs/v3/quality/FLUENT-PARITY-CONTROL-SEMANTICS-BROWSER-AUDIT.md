# #552 browser audit — Checkbox, Switch and RadioGroup

**Partial runtime evidence only.** The Bluent UI Demo WebAssembly app was built from task-branch source at `73155f02` and exercised with real pointer/keyboard input through Chromium DevTools Protocol. Chrome and Edge each completed **35/35 instrumentation checks**. No product code or design file was changed.

## Test scope and evidence

- Browser engines: Chrome and Edge, headless on Dev01.
- Component routes: `/components/checkboxes` and `/components/radios`.
- Modes: Light/LTR and Dark/RTL set through the demo's actual header switches; forced-colors is **CDP-emulated**, not native Windows Contrast Themes.
- Interactions: native Space, pointer selection, ArrowRight, Tab, computed accessibility-tree roles/names/states, and the component's real Blazor binding updates.
- Viewport: 1280 × 960. Six screenshots per engine, linked below.

| Evidence | Results |
| --- | --- |
| [Chrome structured evidence](evidence/BLUENT-CONTROL-SEMANTICS-CHROME.json) | 35/35 checks; 0 failed |
| [Edge structured evidence](evidence/BLUENT-CONTROL-SEMANTICS-EDGE.json) | 35/35 checks; 0 failed |
| Screenshots | [Chrome Light/LTR Checkbox](evidence/BLUENT-CONTROL-SEMANTICS-CHROME-CHECKBOX-LIGHT-LTR.png) · [Chrome Dark/RTL Checkbox](evidence/BLUENT-CONTROL-SEMANTICS-CHROME-CHECKBOX-DARK-RTL.png) · [Chrome forced-colors Checkbox](evidence/BLUENT-CONTROL-SEMANTICS-CHROME-CHECKBOX-FORCED-COLORS.png) · [Chrome Light/LTR RadioGroup](evidence/BLUENT-CONTROL-SEMANTICS-CHROME-RADIOGROUP-LIGHT-LTR.png) · [Chrome Dark/RTL RadioGroup](evidence/BLUENT-CONTROL-SEMANTICS-CHROME-RADIOGROUP-DARK-RTL.png) · [Chrome forced-colors RadioGroup](evidence/BLUENT-CONTROL-SEMANTICS-CHROME-RADIOGROUP-FORCED-COLORS.png) |
| Edge screenshots | [Light/LTR Checkbox](evidence/BLUENT-CONTROL-SEMANTICS-EDGE-CHECKBOX-LIGHT-LTR.png) · [Dark/RTL Checkbox](evidence/BLUENT-CONTROL-SEMANTICS-EDGE-CHECKBOX-DARK-RTL.png) · [forced-colors Checkbox](evidence/BLUENT-CONTROL-SEMANTICS-EDGE-CHECKBOX-FORCED-COLORS.png) · [Light/LTR RadioGroup](evidence/BLUENT-CONTROL-SEMANTICS-EDGE-RADIOGROUP-LIGHT-LTR.png) · [Dark/RTL RadioGroup](evidence/BLUENT-CONTROL-SEMANTICS-EDGE-RADIOGROUP-DARK-RTL.png) · [forced-colors RadioGroup](evidence/BLUENT-CONTROL-SEMANTICS-EDGE-RADIOGROUP-FORCED-COLORS.png) |

## Confirmed browser observations

### Checkbox #434

- The indeterminate demo fixture has the visual `indeterminate` class, but its actual native input reports `checked=false`, `input.indeterminate=false`, and no `aria-checked="mixed"`.
- The Chrome and Edge accessibility trees expose a **checkbox** named `Indeterminate checkbox` with unchecked state—not a mixed state.
- Native Space activates the control and Blazor updates it to checked. This verifies the tested keyboard activation path, not the tri-state design contract.

**Disposition:** the visual mixed state is not exposed as native/ARIA mixed state. Keep the mixed-state contract open for the owner of #434.

### Switch #435

- Chrome and Edge accessibility trees expose the header Switch as role **checkbox**, with the state-dependent accessible name `Light`; the source does not provide `role="switch"`.
- Native Space toggles the value and can restore it. The demo's actual header controls also applied Dark/RTL during the mode runs.

**Disposition:** keyboard activation works in this tested path; the semantic role still needs an explicit owner decision and comparison against the pinned Fluent Switch behavior.

### RadioGroup #436

- The group wrapper is ignored in the browser accessibility tree (`role=none`, `ignored=true`) and has no computed group name. Source markup has no explicit radiogroup role, `aria-label`, `aria-labelledby`, `fieldset` or `legend`; its child label is not associated with the group.
- Each option is exposed individually as a named radio (for example, `Yes` / `No`), but every rendered radio has an empty native `name`.
- ArrowRight moves from the first option to the second option in the first group. From that group's last option, another ArrowRight moves focus to the first option in the **next** RadioGroup. The previously selected option in the first group remains checked while the next group's first option becomes checked. This cross-group navigation leakage reproduced in both Chrome and Edge.
- In the tested two-option group, Tab from the first option reaches the second option, so the options are separate Tab stops rather than a single native radio-group stop.

**Disposition:** confirmed behavior and accessibility gaps. Add a stable group-specific native `name` and a group label/semantic relationship under #436's approved design/API workflow; test that arrow navigation wraps within one group, never crosses into another group, Tab entry follows the chosen radio pattern, and form serialization includes the group value.

## Acceptance boundary

These are browser DOM and accessibility-tree observations from the WASM demo, not native screen-reader output. Forced-colors was emulated; this is not native Windows Contrast Themes. This run does not cover published InteractiveServer, all validation/disabled/form cases, a normalized same-state Fluent visual comparison, or editable design approval. It does **not** complete any nine-dimension family audit or create a full evidence bundle. `auditStatus` remains `researching`, design approvals remain pending, `evidenceBundle` remains null, and zero families are Fluent-approved.

Related family reports: [Checkbox/Switch audit](FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md) · [RadioGroup audit](FLUENT-PARITY-RADIOGROUP-AUDIT.md).
