# Bluent v3 — local editable Penpot control drafts (#419)

> **Status:** design prototypes only; not approved Blazor/CSS components, not a 100%-feature demo. Built in **project-owned** Penpot `Bluent v3 Design System` file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, on page `15 · Bluent native control drafts` (`07c521b9-e441-80bd-8008-c4d95657c458`) and main demo board `07c521b9-e441-80bd-8008-c4d9703f9bc2`. Named Penpot recovery version **`Bluent v3 · #419 local TextField Checkbox Switch draft 2026-10-10`**, revision **48**.

All objects below are **new, native editable Penpot component assets owned by Bluent**, as opposed to the source-linked Fluent variants in the [component reference matrices](COMPONENT-REFERENCE-MATRICES.md). No upstream source asset has been edited. These are deliberately distinct, unapproved components with names prefixed **`DRAFT ·`**.

| Local component | Penpot component ID | Main instance/board ID | Draft token binding |
| --- | --- | --- | --- |
| `DRAFT · Primary Button` | `07c521b9-e441-80bd-8008-c4aec6fea27e` | `07c521b9-e441-80bd-8008-c4aec6f7e429` | Local `bluent.color.brandBackground` (previously created) |
| `DRAFT · TextField` | `07c521b9-e441-80bd-8008-c4d9894618fd` | `07c521b9-e441-80bd-8008-c4d98926e6fc` | Local `bluent.color.background1` surface fill |
| `DRAFT · Checkbox` | `07c521b9-e441-80bd-8008-c4d99a88df90` | `07c521b9-e441-80bd-8008-c4d99a652d5d` | Local `bluent.color.brandBackground` checked-square fill |
| `DRAFT · Switch` | `07c521b9-e441-80bd-8008-c4d9a7c1e966` | `07c521b9-e441-80bd-8008-c4d9a7a9cde2` | Local `bluent.color.brandBackground` track fill |

On page 15, actual **linked instances of these three new locally-owned components** appear in separate demonstration cards, all verified with `isComponentInstance() == true` and their exact local source component ID:

| Local preview | Instance ID |
| --- | --- |
| TextField | `07c521b9-e441-80bd-8008-c4d9b70c7903` |
| Checkbox | `07c521b9-e441-80bd-8008-c4d9b7140d69` |
| Switch | `07c521b9-e441-80bd-8008-c4d9b71d4287` |

The complete native Penpot preview board was PNG-exported and visually inspected. The TextField preview currently has an editable label, a 1px simulated border, a token-bound surface and placeholder text. The Checkbox is a **single checked visual** with an editable check symbol and label. The Switch is a **single enabled/on visual** with an editable track/knob and label. They are **not native HTML input controls and do not have value propagation or interaction in Penpot**.

## What this achieves — and what it does not

- Establishes a **real reusable Bluent Penpot library** beyond its original local draft Primary Button. The upstream Fluent kit remains a separate linked reference with 134 matrix instances.
- Confirms Penpot can store design-token bindings to fill properties on local design components, letting #419 evolve without copying raw colors into every prototype.
- Allows later side-by-side review against upstream Button/Input/Checkbox/Switch state matrices and the source-verified default brand/theme baseline.
- **Does not** approve design tokens, CSS, final Figma/Penpot visual parity, RTL, focus/keyboard semantics, disabled states, validation, error/indeterminate states, animations, touch-size defaults, locale-specific font metrics or Blazor binding.
- **Does not** authorize #418 to leave Backlog or individual component work to skip Ready/In progress gates. Design review of #417 CSS ADR is still outstanding.

## Remaining design tasks before #419 Review

The prototypes need complete component anatomy/variants (especially TextField state+size+appearance, nullable-checkbox Indeterminate and Switch two-state/bidi label positions), accent theme-state review, typography/focus/contrast, RTL/Persian and responsive densities. The three components need side-by-side evaluation against the already created **real source-linked** Fluent 2 component matrices, and explicit public Bluent API mapping. Visual review requires approved design evidence; app behavior requires browser/runtime tests under the later component issues.

The work remains on **`v3/issue-419-penpot-library`** and [Draft PR #499](https://github.com/vrassouli/Bluent/pull/499), base **`bluent-v3`**. The existing stable branch `Dev`, public NuGet and all published apps were not modified.
