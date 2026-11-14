# TextField placeholder consumer decision — Issue #432

> **Status:** accepted for the TextField consumer by delegated design review on 2026-11-14. This is not approval of the complete #418 foundation or a released public token contract.

## Source mapping

The pinned upstream package is @fluentui/web-components@3.1.3. Its compiled dist/esm/text-input/text-input.styles.css sets ordinary .control::placeholder to colorNeutralForeground4, disabled placeholder to colorNeutralForegroundDisabled, and the Filled darker surface to colorNeutralBackground3.

| TextField state | Source role | Current stylesheet behavior |
|---|---|---|
| Enabled placeholder | colorNeutralForeground4 | Read --colorNeutralForeground4 directly |
| Disabled placeholder | shared disabled foreground | Reuse --bui-v3-text-disabled with --colorNeutralForegroundDisabled fallback |

The proposed #418 semantic alias bluent.semantic.text.placeholder / --bui-v3-text-placeholder is not consumed until #418 integrates and approves that bridge. Do not create a TextField-specific disabled alias. Placeholder is supplementary hint text, never an accessible name.

## Contrast arithmetic

| Mode | FG4 | BG3 | Contrast |
|---|---|---|---:|
| Light | #707070 | #F5F5F5 | 4.5423:1 |
| Dark | #999999 | #141414 | 6.4663:1 |

FG4 narrowly exceeds the 4.5:1 normal-text threshold in Light (0.0423:1 headroom) and has comfortable Dark-mode headroom. FG3 gives more contrast but departs from the exact pinned Fluent Web Components source role. Therefore FG4 is the selected TextField consumer role. Preserve the numeric regression and investigate any rendered consumer failure instead of silently switching roles.

This arithmetic evaluates placeholder text against the immediate BG3 surface. It does not certify the outer field boundary against every consumer host surface, native Windows Contrast Themes, forced-colors runtime behavior, or assistive technology.

## Authority boundary

This decision is scoped to #432 and was recorded in the owned Penpot pages 17–20 and GitHub Issue #432 / PR #562 on 2026-11-14 under the user's delegated instruction. It does not approve the complete #418 token names, values, theme mappings or opt-in API; general Fluent parity beyond the pinned source behavior; native Windows Contrast Themes, physical Persian IME/caret/selection, spoken screen-reader acceptance; or merge, publication, deployment or release.

PR #562 remains the integration vehicle targeting bluent-v3; keep #432 In Progress until remaining evidence gates, review and merge are complete.