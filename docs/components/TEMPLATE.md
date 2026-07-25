# Component reference template

Use this template for public Bluent components. Remove sections that genuinely do not apply, but do not omit a section merely because the information has not been investigated; mark it as pending verification instead.

---

# ComponentName

One sentence describing what the component does and the user problem it solves.

## When to use

Use `ComponentName` when:

- scenario one
- scenario two

Consider another component when:

- trade-off or alternative

## Package and namespace

```bash
dotnet add package PACKAGE_ID
```

```razor
@using COMPONENT_NAMESPACE
```

State whether the package requires service registration, stylesheets, JavaScript behavior, or a shared container.

## Minimal example

Provide the smallest example that demonstrates a real supported behavior.

```razor
<ComponentName Parameter="Value">
    Content
</ComponentName>
```

State how the example was validated and link to a runnable repository example when available.

## Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `Parameter` | `string?` | `null` | No | Explain behavior, not just the type |

Include inherited public parameters that materially affect usage. Do not expose internal implementation members as component API.

## Events and binding

| Event or binding | Type | When it occurs |
| --- | --- | --- |
| `ValueChanged` | `EventCallback<T>` | Describe timing and semantics |

Show the supported `@bind-` form when applicable. Document event ordering only when verified.

## Child content and composition

Document:

- child-content slots
- required parent or child components
- cascading context
- valid nesting and ordering
- empty-state behavior

## Services and containers

List injected or registered services that affect public use.

State whether `AddBluentUI()`, `AddBluentUtilities()`, or `<Containers />` is required.

## Styling and theming

Document:

- required packaged stylesheets
- appearance, size, orientation, or design-token options
- supported CSS customization points
- dark/light theme behavior
- whether arbitrary CSS selectors are intentionally stable

Do not present internal CSS class names as a compatibility contract unless they are explicitly public.

## Localization and RTL

Document:

- localized built-in strings
- culture-sensitive formatting
- right-to-left layout behavior
- `dir` or culture prerequisites
- known gaps

## Accessibility and keyboard interaction

Document verified:

- semantic role
- accessible name behavior
- focus behavior
- keyboard commands
- disabled/read-only semantics
- validation announcements

Do not claim standards conformance without evidence.

## Hosting and render modes

Use the terms defined in [Hosting models and render modes](../compatibility/hosting-and-render-modes.md).

| Render mode | Status | Notes |
| --- | --- | --- |
| WebAssembly | Verified / unverified | Evidence |
| Interactive Server | Verified / unverified | Evidence |
| Interactive WebAssembly | Verified / unverified | Evidence |
| Interactive Auto | Verified / unverified | Evidence |
| Static SSR | Verified / limited / unsupported / unverified | Evidence |

## JavaScript and static assets

List:

- dynamically imported modules
- required script tags, if any
- required stylesheets
- browser APIs
- cleanup/disposal behavior
- CSP or deployment considerations

## Common mistakes

### Symptom

Explain the likely cause and exact correction.

## Known limitations

List current limitations, unsupported combinations, and version-specific behavior. Link to tracking issues where possible.

## Related components

- [Related component](related-component.md)
- [Relevant guide](../guides/example.md)

## Source and verification

- Component source: `path/to/component`
- Demo/example: `path/to/example`
- Tests: `path/to/tests`
- Verified against commit or version: `VERSION_OR_SHA`
- Verification date: `YYYY-MM-DD`

---

## Authoring rules

- Verify names, types, defaults, events, and namespaces against current public source.
- Prefer a compiled example over a plausible example.
- Separate observed behavior from intended behavior.
- Never copy a source comment without confirming that implementation matches it.
- Link to canonical setup and package pages instead of duplicating them.
- Use stable public terminology consistently.
- Record missing evidence as a documentation gap.
- Update the component inventory when adding or materially revising a component page.
