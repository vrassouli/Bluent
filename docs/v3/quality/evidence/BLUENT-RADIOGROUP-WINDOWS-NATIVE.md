# RadioGroup — native Windows accessibility smoke evidence

**Date:** 2026-11-19
**Host:** Dev01 · Microsoft Windows 11 Pro · build 28000
**Target:** `http://127.0.0.1:59000/components/radios` in Microsoft Edge
**Component source:** task branch `v3/issue-436-radiogroup`

## Native High Contrast

- The original Windows `HIGHCONTRAST.dwFlags` value was `126` (`High Contrast White` selected, enable bit clear).
- `SystemParametersInfoW(SPI_SETHIGHCONTRAST)` enabled the actual OS High Contrast White mode; a second native read returned flags `127` with the enable bit set.
- The live RadioGroup page was captured while that OS flag was active. Retained capture: `BLUENT-RADIOGROUP-WINDOWS-HIGH-CONTRAST.png` (1004 × 700).
- A `finally` restoration call returned the exact original flags `126`; a native read verified High Contrast disabled again. Narrator was also stopped after the check.

This is an actual OS-level visual smoke capture, not the browser `forced-colors` emulation used by the four-cell CDP suite. It does not by itself certify all theme colors or every Windows contrast palette.

## Windows UI Automation semantics

The `windows-uia` tree for the live page exposed native groups and options rather than flattened text:

- `Delivery window` → `Morning` (selected), `Afternoon`, `Evening`.
- `Preferred contact time` → `Morning`, `Afternoon`, `Evening` (selected).
- Other groups included `Priority`, `Delivery speed`, `Availability`, `Quiet hours preference`, `Alert frequency`, RTL language selection and `Choose a delivery window`.
- Options surfaced as `radiobutton` with their accessible option name, `selected` state and `enabled` state; the disabled `Express` / `Unavailable` options were reported disabled.

This verifies the native Windows UIA roles/names/state exposed by the component in the inspected tree. It is not spoken assistive-technology acceptance.

## Screen reader boundary

Windows Narrator was launched for the inspection and then stopped. The session could not independently capture or audit its spoken output, and reliable Narrator scan-mode keyboard interaction could not be established. Therefore **Narrator spoken acceptance is not claimed**. Named Narrator/NVDA/VoiceOver review remains open.
