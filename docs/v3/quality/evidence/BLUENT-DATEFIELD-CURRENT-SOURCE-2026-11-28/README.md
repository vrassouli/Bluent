# DateField current-source browser evidence — WebAssembly (2026-11-28)

This directory contains six screenshots captured from the current v3/issue-438-datefield working tree using the isolated /compatibility/datefield-probe fixture and real Chrome/Chromium.

- Render mode: Blazor WebAssembly
- Probe: scripts/quality/probe_v3_datefield.mjs
- Result: 41/41 checks passed, 0 failures, 0 uncaught browser exceptions
- Accessibility snapshot: Chromium AX tree (BLUENT_DATEFIELD_AX_TREE=1)
- Selection grid checks: BLUENT_DATEFIELD_SELECTION_GRID_CHECK=1

Coverage includes DateTime and DateOnly binding/selection, field labels, named non-modal dialog and grid, one tabbable selected day, focus entry/restoration, Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown, Space, Escape, natural Tab exit, three-column MonthSelect/YearSelect navigation, 320px and 390px layouts, Light/Dark LTR/RTL, forced-colors and reduced-motion browser emulation, and absence of horizontal overflow.

Files:
- datefield-calendar-viewport-default.png
- datefield-320-light-ltr.png
- datefield-320-dark-rtl.png
- datefield-390-light-rtl.png
- datefield-390-dark-ltr.png
- datefield-320-forced-colors-reduced-motion.png

These captures are QA evidence from the isolated fixture, not an approved product screenshot baseline. Browser-emulated forced-colors is not native OS verification. Chromium AX snapshots do not verify spoken screen-reader output.