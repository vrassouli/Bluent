# Issue #418 — implementation contract (2026-11-25)

**Branch-local engineering implementation:** `v3/issue-418-design-tokens`, PR #500. This document records what is compiled in the isolated v3 branch. It is not a claim that Penpot pages 45/53/54/55 have final visual approval, that PR #500 has been accepted/merged, or that a stable package has been released.

## D1 — First-wave opt-in token bridge

The `Bluent.UI` component bundle includes `_v3-token-contract.scss`. It is opt-in: a consumer places `data-bui-v3-tokens` on a scope root and uses a Fluent theme host with `data-bui-theme="light|dark"`. The bridge does not redefine existing `--color*` variables.

Nine reusable public source aliases are emitted:

| Public alias | Existing Fluent source |
|---|---|
| `--bui-v3-color-background1` | `--colorNeutralBackground1` |
| `--bui-v3-color-foreground1` | `--colorNeutralForeground1` |
| `--bui-v3-color-foreground4` | `--colorNeutralForeground4` |
| `--bui-v3-color-brand-background` | `--colorBrandBackground` |
| `--bui-v3-color-stroke1` | `--colorNeutralStroke1` |
| `--bui-v3-color-brand-foreground1` | `--colorBrandForeground1` |
| `--bui-v3-color-brand-foreground-link` | `--colorBrandForegroundLink` |
| `--bui-v3-color-brand-foreground-link-hover` | `--colorBrandForegroundLinkHover` |
| `--bui-v3-color-brand-foreground-link-pressed` | `--colorBrandForegroundLinkPressed` |

Three semantic aliases are emitted, with intentionally narrow consumer boundaries:

| Alias | Source | First-wave consumer boundary |
|---|---|---|
| `--bui-v3-text-primary` | `--colorNeutralForeground1` | Label #430 primary text only |
| `--bui-v3-text-disabled` | `--colorNeutralForegroundDisabled` | Label #430 visual disabled state only; not a normal-text contrast claim |
| `--bui-v3-text-placeholder` | `--colorNeutralForeground4` | TextField #432 placeholder only; placeholder is not an accessible name |

Not emitted: `text.dangerAccessible`, `status.danger`, `semantic.text.validation`, Action/Link semantic foreground aliases, unreviewed semantic roles and every component-private alias. Existing required-marker and status mappings retain their current narrow evidence boundaries.

Example opt-in scope:

```html
<div data-bui-v3-tokens data-bui-theme="light">
  <!-- descendants may consume the opt-in --bui-v3-color-* and three approved text aliases -->
</div>
```

## D2 — Dark Action/Link candidates remain preview-only

The generated contrast matrix contains 40 candidates (10 brands × Action Rest, Link Rest, Link Hover and Link Pressed). Every value is at least 4.6:1 against the opaque Dark `--colorNeutralBackground1` surface used by the preview; the minimum observed ratio is 4.6001:1.

Those 40 values are **not** included in the compiled public token bridge. They do not establish contrast on other backgrounds, translucent/composited, gradient or image surfaces, nor visual acceptance of real Button/Link states. Page 55 remains DRAFT / REVIEW REQUIRED pending review of the exact rendered values and states.

## D3 — Focus Option A is wired to the existing Button focus ring

The actual painted host may opt into the selected mapping by placing both attributes on that same element inside a `data-bui-v3-tokens` scope:

- `data-bui-v3-focus-mode="light|dark"`
- `data-bui-v3-focus-host="neutral|brand|brandHover|danger|inverted"`

The mapping sets the existing inherited `--bui-button-focus-ring-color`; Button retains its existing `:focus-visible` geometry (2px outline, 2px offset).

| Opaque host | Light ring source | Dark ring source |
|---|---|---|
| Neutral | `--colorBrandBackground` | `--colorBrandForeground2` |
| Brand / BrandHover / Danger | `--colorNeutralForegroundOnBrand` | `--colorNeutralForegroundOnBrand` |
| Inverted | `--colorNeutralForegroundOnBrand` | `--colorBrandForeground2` |

Missing/unknown metadata receives no host-specific override; the existing visible focus fallback remains. `forced-colors: active` uses system `Highlight`. Only studied opaque host roles are supported. Do not annotate alpha/translucent, gradient, image/video or other composite hosts as though their contrast were measured. TextField's underline-only focus treatment is unchanged. Page 53 remains DRAFT / REVIEW REQUIRED pending visual/design acceptance.

## D4 — Dialog / portal source corrections

- `DialogConfiguration.ValidateAccessibleBehavior` rejects a supplied blank `AccessibleName`, a supplied blank `AccessibleDescription`, and `AccessibleDescription` without `AccessibleName` for both direct configuration and builder service paths.
- `DialogConfigurator.Configuration` no longer silently discards `AccessibleDescription`.
- `SetAccessibleDialog(string name)` is available when the icon-only close button is hidden. If the close button remains visible on a named Dialog, its accessible label is required; supply the localized label or hide the button.
- Return-focus-only opt-in contexts participate in route/container disposal completion. Host teardown completes the pending result; it does not promise focus restoration into a page that no longer exists.
- Existing `IDialogService.ShowAsync` overloads and the immutable `PortalThemeScope` owner snapshot captured at `ShowAsync` remain unchanged.

## D5 — Detached Popover surface role/name contract

`Popover` exposes three nullable, opt-in parameters (all default `null`):

- `SurfaceRole : string?`
- `SurfaceAriaLabel : string?`
- `SurfaceAriaLabelledBy : string?`

These values render on the actual detached surface root whose ID is `{TriggerId}_surface` and which the trigger's `aria-controls` identifies. They are Blazor-side `PopoverConfiguration`; they are not added to JS-serialized `PopoverSettings`. The two name sources are mutually exclusive, nonempty and require an explicit role that permits author-provided naming. `SurfaceRole` must be a supported, canonical lowercase WAI-ARIA 1.2 role token; abstract roles are rejected, roles with name-from-author prohibited cannot be named, and roles marked name-required cannot be supplied without a name. This allow-list and name policy follow W3C WAI-ARIA 1.2 sections 5.2.8.4–5.2.8.6: https://www.w3.org/TR/wai-aria-1.2/#namecalculation. A generic unconfigured Popover stays an unnamed, role-less `div`; no `aria-haspopup` or `aria-modal` is inferred.

Role/name parameters and the surface fragment have **live-update** semantics for the lifetime of a registered trigger: a parent change refreshes that exact detached surface. This is distinct from the service Dialog's immutable owner snapshot captured at `ShowAsync`. Forwarding role/name does not implement a role's keyboard model, focus movement, dismissal or modality; each consumer still owns those behaviors.

The tests cover detached-root markup, fail-closed validation and parameter-refresh notification. A real-browser accessibility-tree check that resolves `aria-labelledby` IDs and exercises a real consumer keyboard model remains an independent acceptance item. DateField #438 remains Backlog and was not started.

## Verification performed on this branch

- Dialog / Popover HtmlRenderer regressions: **19/19**.
- Public token bridge contract tests: **5/5**.
- Additive API ledger tests: **8/8**.
- `Bluent.UI` Release build with warnings as errors: **0 warnings, 0 errors**; Sass and CSS bundler output generated.

The prior exact-head 56/56 CI result applies to commit `5e42cbe`, not to these newer uncommitted changes. A fresh exact-head CI run is required after commit/push. Native spoken AT, physical keyboard, user-defined High Contrast schemes, native Safari and Persian OS IME/caret/selection acceptance remain separate gates. Penpot pages 45, 53, 54 and 55 remain DRAFT / REVIEW REQUIRED pending design review.
