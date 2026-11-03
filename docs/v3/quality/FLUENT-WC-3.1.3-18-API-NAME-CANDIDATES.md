# #552 — Unreviewed API name candidates for 18 historical Bluent pilots

**Machine-generated source-triage queue, not a Fluent parity matrix or supported-property table.**
This combines the existing *direct* and *locally inherited* Bluent component parameters with the pinned published `@fluentui/web-components@3.1.3` custom-element metadata. The upstream catalog contains 42 tags; only already identified related tags are examined for each family.

Total: **18 families**, **19 component classes**, **239 source-known C# parameter occurrences**. Potential exact-spelling matches: **27**, no exact spelling match: **212**. **Approved equivalences: 0**.

| Family | Owner | Parameters | Name-match candidates | No name-match candidate |
| --- | --- | ---: | ---: | ---: |
| Button | #428 | 30 | 4 | 26 |
| Icon | #429 | 10 | 0 | 10 |
| Label | #430 | 14 | 2 | 12 |
| Link | #431 | 12 | 2 | 10 |
| Badge | #445 | 16 | 4 | 12 |
| TextField | #432 | 12 | 1 | 11 |
| NumericField | #433 | 17 | 1 | 16 |
| Checkbox | #434 | 9 | 2 | 7 |
| Switch | #435 | 9 | 1 | 8 |
| RadioGroup | #436 | 17 | 2 | 15 |
| SelectField | #437 | 7 | 1 | 6 |
| DateField | #438 | 13 | 1 | 12 |
| TimeField | #439 | 9 | 1 | 8 |
| MaskedField | #440 | 9 | 1 | 8 |
| OtpField | #441 | 9 | 1 | 8 |
| Slider | #442 | 13 | 3 | 10 |
| RangeSlider | #443 | 13 | 0 | 13 |
| FileSelect | #444 | 20 | 0 | 20 |

## Interpretation and the remaining mandatory work

- `spellingCandidates` compares lower-kebab C# parameter names with CEM **attribute/event/slot names**; it does not understand semantic equivalence, enum values, event callback ordering, accessibility, defaulting, bindings, CSS or rendered DOM.
- A missing spelling candidate is **not evidence of a missing feature** (C# inheritance, HTML global attributes, Blazor abstractions, different API naming and intentional extensions require review). A matching spelling candidate is **not evidence of support or parity**.
- Framework `InputBase<TValue>` members, generic constraints, public methods, design token properties, actual WC Storybook behavior and native OS/AT remain outside this local-source parameter census.
- Each owning component issue must manually classify each API capability as Supported / Missing / Bluent extension / N/A with evidence; future accepted mappings belong in a **separate reviewed ledger**, not by changing these research statuses.
- [Exact WC tag and attr catalog](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md), [source API census](FLUENT-PARITY-18-API-CENSUS.md) and [canonical 18-family backlog](https://github.com/vrassouli/Bluent/blob/v3/issue-421-component-lab/docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md) are distinct evidence layers.

Reproduce source-only snapshot: `python scripts/quality/build_v3_wc_api_candidates.py --write`; protect it with `--check` and existing source-census tests. No product, Penpot approval or stable `Dev` changes.
