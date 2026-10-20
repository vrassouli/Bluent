# #552 Wave C — real Button #428 Hover/Toggle/AX state transitions

**2026-10-20. Audit-only observation, NOT product repair, NOT Fluent parity, approved editable design or native OS/screen-reader signoff.** Extends [Button icon geometry and accessible-name findings](FLUENT-PARITY-BUTTON-ICON-AX.md) and [Button keyboard/toggle observations](FLUENT-PARITY-P0-BUTTON-KEYBOARD.md). Owner #428 with shared Icon #429 and convention #420.

## Source-real reproduction

- Actual original .NET 10 Blazor WebAssembly Debug demo at /components/buttons, current Button.razor / Button.razor.cs and CSS, **without editing Blazor source or styles**.
- Harness: run `node scripts/quality/probe_v3_button_toggle_states.mjs chrome` and repeat with `edge`. Each starts a disposable local server, isolated browser profile, uses Chrome DevTools Protocol **real pointer move, native left mouse press/release and mouse leave**, reads native DOM computed visibility and browser partial Accessibility Tree, then cleans up owned processes/profiles.
- Three tested modes per engine: Light/LTR, Dark/RTL and Chromium Forced Colors **emulation**. This is not a real Windows Contrast Theme session.
- The specimen is the first **Default toggle Button** in the existing demo's Toggle row, with both Regular and Filled icon sources. The demo uses a literal Toggled=false initially and the real component's ClickHandler flips internal state.

## Actual behavior and newly reproduced gap

| Transition | Visual/class behavior in both engines | Browser AX name (actual source) | AX toggle state |
| --- | --- | --- | --- |
| Unselected, pointer outside | Regular visible; Filled display none | U+E60F followed by Default | aria-pressed absent |
| Native mouse hover | Filled visible; Regular display none | U+E60E followed by Default | aria-pressed absent |
| Native click, pointer leaves | Toggled class remains; Filled visible | U+E60E followed by Default | aria-pressed absent |
| Second native click, pointer leaves | Toggled class removed; Regular restored | Original behavior resumes | aria-pressed absent |

**Key distinction:** the visual interaction/ClickHandler works. The accessibility defect is that **a private-use icon font codepoint changes the Button's accessible name when the user only hovers**, and the source does not expose pressed state. This is stronger evidence than only checking icon-only Buttons: even a text-labeled Button has an unstable accessible name. No claim that this is observed by a particular physical screen reader.

## Isolated semantics experiment (two states, no source mutation)

For each test mode, the disposable browser briefly added aria-hidden=true to both decorative icon nodes and explicit aria-pressed to the **native Button**:

- Initial state: aria-pressed=false, resulting partial AX name exactly Default and pressed value false.
- Hover while still unselected: the Filled glyph appears visually, but AX name remains exactly Default with pressed value false.
- State toggled on by real native mouse click: aria-pressed=true, resulting partial AX name exactly Default and pressed value true.
- In both initial and selected cases the harness removes all attributes; AX text and absent aria-pressed **revert exactly** to the original source state. The second real click turns the toggle back off.

**Chrome 33/33 and Edge 33/33** explicit observations/checks, 3 scenarios per engine. These are fixture/browser-state and documented defect-reproduction assertions, **not 66 Fluent parity passes or a product accessibility acceptance**. Product remains unfixed.

## Attached original-engine evidence

| Original real toggle state screenshot (after click + mouse leave) | Chrome | Edge |
| --- | --- | --- |
| Light/LTR | [PNG](evidence/BLUENT-BUTTON-STATE-CHROME-LIGHT-LTR-TOGGLED.png) | [PNG](evidence/BLUENT-BUTTON-STATE-EDGE-LIGHT-LTR-TOGGLED.png) |
| Dark/RTL | [PNG](evidence/BLUENT-BUTTON-STATE-CHROME-DARK-RTL-TOGGLED.png) | [PNG](evidence/BLUENT-BUTTON-STATE-EDGE-DARK-RTL-TOGGLED.png) |
| Forced Colors emulation | [PNG](evidence/BLUENT-BUTTON-STATE-CHROME-FORCED-COLORS-TOGGLED.png) | [PNG](evidence/BLUENT-BUTTON-STATE-EDGE-FORCED-COLORS-TOGGLED.png) |

[Chrome state/AX JSON](evidence/BLUENT-BUTTON-STATE-CHROME.json) · [Edge state/AX JSON](evidence/BLUENT-BUTTON-STATE-EDGE.json). JSON retains start, false candidate, hovered false candidate, restored false, real hover, real click, selected, true candidate, restored true and reset stages.

## Owner handoff / open acceptance

1. **#428**: specify native Button semantics — when Toggled.HasValue, aria-pressed must expose false/true as state changes; plain buttons with Toggled=null must omit pressed semantics. Hide purely decorative Regular **and** Filled icon glyphs from native AX even during hover/toggle; make explicit caller-provided accessible names and AdditionalAttributes precedence consistent with **#420**. An icon-only Button needs a contextual control name (not icon glyph or catalog key).
2. **#429**: choose the Icon semantic and SVG/Image policy for decorative vs informative, including alt handling, so every consuming component does not acquire inconsistent behavior. Do not automatically hide an intentionally informative standalone Icon.
3. Verify Hover/Focus/Toggled and disabled interactions with native screen readers, keyboard Enter/Space, published InteractiveServer, multiple browsers/versions, real Windows Contrast Themes, localization and reference Fluent 2 once an **editable Penpot/Figma approved design** exists. Penpot's last connected file is unrelated PuyaStudio Runner; Figma fallback previously hit Starter call limit. This audit does not promote #428/#429.

**Lifecycle:** #552 In progress; PR #553 Draft; stable Dev untouched and no component API/DOM code changes.
