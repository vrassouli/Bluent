# #552 — Fluent WC 3.1.3 catalog crosswalk for all 18 historical pilots

**Research/Phase 0 reference freeze only — not a Fluent 2 parity decision.** The catalog was extracted from the published npm `@fluentui/web-components@3.1.3` tarball, `package/custom-elements.json`, with npm integrity `sha512-1jl4CHoFFSfevkr8l7F+dKNJzyMWBZqwQfB/khNZtwyY0rv87799mpDWSVu0QeiZAFEbqCtnAOnXWsxJ/kek+Q==` and content SHA-256 `e460a61de0cd6f99ec6caedc203db681d95ac16332d3b296b50484b79ad61329`.

The frozen CEM contains **42 unique custom-element tags**. The JSON preserves typed/documented attributes, parsed types, events, slots, CSS parts/properties/states, descriptions, superclass and module paths for all 42 tags. A tag with a similar name is **not proof of API, appearance, keyboard, ARIA, lifecycle or behavior equivalence**. This crosswalk supplements #421's canonical retrospective matrix, which still records **18/18 unaccepted**; all per-component design frames and native OS/AT tests remain pending.

| Bluent family | Owner | Wave | WC 3.1.3 relationship | Published tags checked |
| --- | --- | --- | --- | --- |
| Button | #428 | A | tag_present | `fluent-button`, `fluent-toggle-button`, `fluent-compound-button`, `fluent-menu-button`, `fluent-anchor-button` |
| Icon | #429 | A | no_dedicated_tag | No dedicated tag |
| Label | #430 | A | tag_present | `fluent-label` |
| Link | #431 | A | tag_present | `fluent-link`, `fluent-anchor-button` |
| Badge | #445 | A | tag_present | `fluent-badge`, `fluent-counter-badge` |
| TextField | #432 | B | tag_present | `fluent-text-input` |
| NumericField | #433 | B | related_only | `fluent-text-input` |
| Checkbox | #434 | B | tag_present | `fluent-checkbox` |
| Switch | #435 | B | tag_present | `fluent-switch` |
| RadioGroup | #436 | B | tag_present | `fluent-radio-group`, `fluent-radio` |
| SelectField | #437 | B | related_only | `fluent-dropdown`, `fluent-dropdown-option`, `fluent-listbox` |
| DateField | #438 | C | related_only | `fluent-text-input` |
| TimeField | #439 | C | related_only | `fluent-text-input` |
| MaskedField | #440 | C | related_only | `fluent-text-input` |
| OtpField | #441 | C | related_only | `fluent-text-input` |
| Slider | #442 | D | tag_present | `fluent-slider` |
| RangeSlider | #443 | D | no_dedicated_tag | No dedicated tag |
| FileSelect | #444 | D | no_dedicated_tag | No dedicated tag |

## Strict interpretation

- **tag_present** means the named custom element is exported in this pinned release, nothing more.
- **related_only** means an alternative category component is exported, but no dedicated same-family WC tag is claimed.
- **no_dedicated_tag** means this **specific package release** has no dedicated custom element; it does not claim absence from Fluent React, Fluent System Icons, W3C patterns, or other versions.
- The JSON pins published attribute, event, slot and CSS-part **names** for all referenced tags and the complete 42-tag name catalog. A full Bluent-to-Fluent property/event/visual mapping has **not** been approved.
- Icon reference needs separate Fluent System Icons package/version/Regular-Filled-Color assessment; RangeSlider uses the [W3C multi-thumb guidance](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) as an external accessibility reference, not as a Fluent tag.

## Reproduction and guard

With the verified npm 3.1.3 tarball, extract `package/custom-elements.json` to a **disposable** path, then invoke:

```sh
python scripts/quality/build_v3_wc_18_crosswalk.py --cem PATH_TO_custom-elements.json --write
python scripts/quality/build_v3_wc_18_crosswalk.py --check
```

The raw third-party CEM is not committed; only compact source metadata is preserved. Do not silently upgrade the pinned npm version or infer parity from matching names. No Bluent product code, design state, stable `Dev`, or owner issue status was changed.
