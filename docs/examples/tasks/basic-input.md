# Basic form input

Use this pattern for ordinary bound text, numeric, select, and Boolean inputs.

## Requirements

- Package: `Bluent.UI`
- Namespace: `Bluent.UI.Components`
- Services: `builder.Services.AddBluentUI()`
- Assets: both base `Bluent.UI` stylesheets from the [shared setup](README.md#shared-consumer-setup)

## Complete source

[`BasicInput.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/BasicInput.razor)
is the canonical compiled source. It binds `TextField`, `NumericField`,
`SelectField`, and `Checkbox` values and displays the current model state.

## Expected behavior

Typing a name updates the status as input occurs. The numeric field enforces
the declared minimum and maximum in its UI, the select changes the role, and
the checkbox changes the update preference.

## Common mistakes

- Import `Bluent.UI.Components`, not `Bluent.UI`.
- Use `@bind-Value`; do not assume every component binds through the native
  HTML `value` attribute.
- `BindValueEvent="oninput"` is explicit when immediate text updates matter.
- Application validation must still enforce business rules; HTML bounds alone
  are not a server-side validation strategy.

## Render modes and evidence

The source is build-verified in the standalone WebAssembly consumer. Binding
and callbacks require an interactive render mode. Static SSR can render the
initial markup but cannot update the model.
