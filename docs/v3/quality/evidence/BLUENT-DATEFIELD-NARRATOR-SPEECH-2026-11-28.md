# DateField Windows Narrator spoken-output smoke — 2026-11-28

## Scope and environment

- Product route: interactive Blazor WebAssembly `/component-lab` on the current `v3/issue-438-datefield` working tree, commit `36dea74a043d5b63e11f1506ccf75c5e95fc36cf`.
- Browser: Google Chrome, dedicated local session; Component Lab DateField pilot selected.
- Assistive technology: Windows Narrator, process `Narrator.exe`, with the Windows Speech Recap window open.
- Interaction: the real DateField DaySelect field and calendar button; date value 18 October 2026.
- Capture mechanism: Narrator Speech Recap / “Copy last phrase” (Narrator key + Ctrl + X). This is Narrator's own speech transcript, not DOM text, an ARIA snapshot, or synthesized wording by the test harness.

## Observed spoken output

### Opening the date picker

After focusing the first real `Choose a date` calendar button through Windows UI Automation and pressing Enter on the Windows keyboard, Narrator's copied speech contained:

> Sunday, 18 October 2026.
>
> October 2026 dialog. Enter Table October 2026, 6 by 7. Sunday, 18 October 2026, toggle button, on. Column Header Su. Row 5 of 6, Column 1 of 7.
>
> Exit Table. Heading level 2, October 2026. Choose month, button. October 2026. Previous month. Next month. Enter Table October 2026, 6 by 7. Su Mo Tu We Th Fr. Column Header. Column Header Sa. Row 1 of 6, Column 7 of 7.
>
> Sunday, 27 September 2026; Monday, 28 September 2026; Tuesday, 29 September 2026; Wednesday, 30 September 2026; Thursday, 01 October 2026; Friday, 02 October 2026; Saturday, 03 October 2026; Sunday, 04 October 2026; Monday, 05 October 2026; Tuesday, 06 October 2026; Wednesday, 07 October 2026; Thursday, 08 October 2026; Friday, 09 October 2026; Saturday, 10 October 2026; Sunday, 11 October 2026; Monday, 12 October 2026; Tuesday, 13 October 2026; Wednesday, 14 October 2026; Thursday, 15 October 2026; Friday, 16 October 2026; Saturday, 17 October 2026; Sunday, 18 October 2026; Monday, 19 October 2026; Tuesday, 20 October 2026; Wednesday, 21 October 2026; Thursday, 22 October 2026; Friday, 23 October 2026; Saturday, 24 October 2026; Sunday, 25 October 2026; Monday, 26 October 2026; Tuesday, 27 October 2026; Wednesday, 28 October 2026; Thursday, 29 October 2026; Friday, 30 October 2026.

The copied phrase reports the real popup as a dialog and its calendar as a six-by-seven table. It announces the selected date and the selected-state toggle button, row/column position and the full dates for the visible cells.

### Escape and focus return

With the popup open, pressing Escape on the Windows keyboard closed it. Narrator's copied speech then contained:

> Component Lab · Bluent v3 - Google Chrome window. Interactive DateField day, month, year, range, value-type, addon and disabled examples group. Choose a date, button, collapsed, has popup.

A subsequent Windows UI Automation query of the actual first calendar trigger returned `focused=true`, `expanded=false`, role `button`, name `Choose a date`. This corroborates that focus returned to the trigger and the disclosure is collapsed.

## What this establishes

- One real Windows Narrator + Chrome spoken-output smoke was performed against the actual DateField product demo, not an isolated fixture.
- Narrator spoke the dialog, month heading, six-by-seven calendar, selected-date state, cell dates and trigger disclosure state.
- Escape closed the non-modal popup and focus returned to the invoking calendar button.

## Limitations / acceptance boundary

- This is a targeted Narrator smoke for DaySelect DateTime, the focused field label/value, and the popup open/close path. It is not a full Narrator acceptance matrix for validation announcements, all three selection modes, DateOnly, RTL, or every keyboard movement.
- Narrator Speech Recap history also contains the actual focused-field utterance: “Interactive DateField day, month, year, range, value-type, addon and disabled examples group, Day selection (DateTime), edit, 2026/10/18.” This is direct spoken output for the DaySelect field accessible name and its formatted current value.
- An ArrowRight trial did not produce a distinct next-date utterance in the captured transcript; spoken arrow-navigation feedback remains unverified.
- NVDA is installed (2026.3) but launching it in this session requires Windows elevation; no UAC approval was available, so NVDA was not run. VoiceOver is not available on this Windows host.
- The capture is an agent-run smoke and not independent human listening/sign-off. It is evidence for one assistive technology/browser combination, not accessibility certification or full cross-screen-reader acceptance.
