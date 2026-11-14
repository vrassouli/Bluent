# TextField placeholder contrast audit — Issue #432

> **Scope:** numeric FG4 / BG3 placeholder pairs across the ten current brand themes in Light and Dark. This is color-pair evidence only, not full component or native accessibility certification.

| Mode | Foreground role | Foreground | BG3 surface | Contrast | Result |
|---|---|---:|---:|---:|---|
| Light | colorNeutralForeground4 | #707070 | #F5F5F5 | 4.5423:1 | Pass, narrow margin |
| Dark | colorNeutralForeground4 | #999999 | #141414 | 6.4663:1 | Pass |

The same neutral FG4/BG3 values are emitted by all ten brand themes in the current preview output. The Light minimum is 4.5423:1, 0.0423:1 above the 4.5:1 normal-text threshold. FG3 would provide additional contrast but is not the exact placeholder role used by the pinned Fluent Web Components 3.1.3 source.

## Limits

- These numbers compare placeholder glyph color with the immediate BG3 input surface only.
- They do not measure the field outer boundary against arbitrary host surfaces. The component border is a separate non-text boundary cue and must be checked in the actual consumer composition.
- They are not native Windows Contrast Themes / forced-colors runtime evidence.
- They are not physical OS IME, keyboard, screen-reader or spoken AT evidence.