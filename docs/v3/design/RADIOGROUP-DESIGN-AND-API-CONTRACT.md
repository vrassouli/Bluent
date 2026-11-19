# RadioGroup — design and API decision record (#436)

> Owned design source: Bluent v3 Design System Penpot, file b64f6665-c9ab-80b5-8008-c4ac99d9d000, Page 59 (0125a79e-69b2-807f-8008-f726bd56fcc7). The three boards were originally DRAFT and were changed to AI REVIEWED after the user explicitly delegated the remaining technical/design review to the assistant on 2026-11-19. This is a recorded AI technical review, not a claim of human maintainer sign-off.

## Reference hierarchy

1. Existing source and public API in src/Bluent.UI/Components/RadioGroupComponent/.
2. The owned Bluent v3 Page 59 proposal and its three board IDs below.
3. Native browser radio-group behavior and HTML form/accessibility semantics.
4. Fluent 2 Radio/RadioGroup as a behavioral/design cross-reference. Where the Bluent proposal deliberately chooses native HTML semantics, that choice is explicit below rather than represented as an exact Fluent DOM clone.

## Penpot traceability

| Board | Penpot ID | Design intent | Implementation relation |
|---|---|---|---|
| Anatomy, visual states and API | 0125a79e-69b2-807f-8008-f726bd61b423 | fieldset / legend, native indicator-label and text-label/input anatomy, horizontal and vertical composition, rest/selected/focus/disabled states and API boundary | Source uses native fieldset / legend; group/option inputs remain native; existing orientation and label-position API is preserved |
| Keyboard and accessibility | 0125a79e-69b2-807f-8008-f726c1464f5d | Tab entry, arrow traversal, Space, disabled skipping, independent group names, accessible name, EditContext and attribute ownership | Actual CDP tests exercise all listed keyboard behavior, two-group isolation, Chromium accessibility tree and live validation |
| RTL, responsive and state matrix | 0125a79e-69b2-807f-8008-f726c665a5cf | Persian/RTL ordering, responsive viewport concepts, Light/Dark/High Contrast and Rest/Selected/Hover/Pressed/Focus/Disabled/Invalid states | RTL and 320px/1280px browser checks are retained; 390px/768px/1440px remain design targets. Forced-colors browser emulation and the separate native Windows High Contrast smoke check do not certify every theme or palette |

The anatomy proposal calls for a shared native name, an actual native option value, native fieldset / legend, and no invented Size, Appearance, HelperText, ErrorMessage, Required, Name or keyboard-mode public parameters. The implementation follows those boundaries. The third board's read-only row is explicitly shown as not part of the current public API.

## Deliberate Bluent-specific markup decision

The design uses the semantic HTML fieldset / legend pattern instead of a custom div[role=radiogroup]. This is intentional: the child controls remain native radio inputs, the browser owns grouping through the shared name, and the component keeps its existing typed InputBase binding. No extra ARIA radiogroup role or custom JavaScript keyboard system is required for this implementation.

When Label is non-empty, it becomes the visible legend. When the visual legend is omitted, the consumer must pass aria-label or aria-labelledby to the group. Each option needs its own accessible name via Radio.Label or a supported native accessible-name attribute.

Each Radio uses two labels associated with the same native input: the 16px visual indicator is a second `label.indicator[for]` with `aria-hidden="true"` (so the decorative circle remains a real pointer hit target), while the separate `.option-label[for]` carries the visible/readable caption. This preserves native label activation for both `ItemsLabelPosition.Before` and `After`; the indicator itself is not announced as a duplicate option name.

## API preservation and attribute precedence

The implementation does not add or rename public API. RadioGroup<TValue> retains ChildContent, Label, ItemsLabelPosition and Orientation and inherits InputBase<TValue?> binding and EditContext behavior. Radio<TValue> retains required Value and optional Label.

name on the group is an unmatched attribute and is forwarded to every child radio. Otherwise a bound group uses InputBase.NameAttributeValue; an unbound group uses its unique generated Id. Each option's native type, name, value, checked and id are component-owned. Per-option tabindex overrides are explicitly filtered so they cannot break the native same-name radio keyboard model. Other non-conflicting aria-*, data-*, title and disabled attributes remain available. Arrow/Tab/Space traversal and focus are browser-owned, not component-owned.

## Browser acceptance crosswalk

The local real-browser test matrix is four separate cells: Chrome/WebAssembly, Edge/WebAssembly, Chrome/published InteractiveServer and Edge/published InteractiveServer. Each cell contains 26 passing assertions (**104/104 total**). The checks cover native group/name semantics, actual Chromium AX names/roles, Tab, Arrow traversal and wrap, Space for an initially unselected group, disabled option skipping and activation, independent groups, EditContext aria-invalid, native FormData, pointer binding, RTL, forced-colors browser emulation, theme-attribute CSS computation, and 320px reflow without horizontal overflow.

The first server 320px run caught overflow from the demo's unwrapped copyable pre/code specimen, not from RadioGroup. The showcase now has scoped pre wrapping, and the original full-page no-overflow assertion remains enabled.

A native Windows High Contrast smoke check was performed on Dev01 (Windows 11 Pro build 28000): the OS `High Contrast White` scheme was toggled on via Win32, the live component was captured, and the Windows UI Automation tree exposed named groups and named radio buttons with correct selected/disabled state. See `docs/v3/quality/evidence/BLUENT-RADIOGROUP-WINDOWS-NATIVE.md` and the retained PNG. The original High Contrast flags (126, disabled) were restored after the capture. Narrator was launched, but spoken speech could not be independently audited; spoken Narrator/NVDA/VoiceOver acceptance remains unverified. On 2026-11-19, by explicit user delegation, the assistant inspected the three Penpot exports against source and browser evidence, corrected the label hit-target, native-name precedence, keyboard ownership, attribute ownership and measured-viewport annotations, and changed the boards' visible status from historical DRAFT to AI REVIEWED. This is a technical review record, not a human maintainer sign-off, spoken AT acceptance or full pixel/WCAG certification.

## Token and foundation boundary

Only already-shipped source CSS roles are used. No preview-only #418 alias is consumed. The broad #418 token foundation and #421 66-family coverage ledger remain independently owned and open; the Component Lab platform acceptance is a separate prerequisite and is not represented as closing #421.

## Review decision and open boundaries

The user explicitly instructed the assistant to complete all remaining #436 work and perform the review. The assistant's technical review is recorded on the three editable Penpot boards (AI REVIEWED) and in this decision record, dated 2026-11-19. The boards align to current source and measured browser evidence; corrections made during review are enumerated above. This does not impersonate a human review or claim speech output that was not captured.

- Exact-head RadioGroup source/evidence contract and all four hosted browser cells pass; the Component Lab retry passes all four cells.
- The overall hosted workflow set still reports unrelated TextField (#432) assertions and a Button (#428) menu/Tab focus timeout. These failures are not RadioGroup failures and are documented in PR #566; they must be resolved by their owning tasks.
- Narrator/NVDA/VoiceOver spoken output remains unverified. The native High Contrast/UIA smoke check and Chromium accessibility-tree assertions are recorded, but no screen-reader speech certification is claimed.
- #418 token vocabulary and the wider #421 ledger remain separate. Only shipped token roles are consumed. The task is in Review and is not Done until PR #566 is accepted and merged into `bluent-v3`.