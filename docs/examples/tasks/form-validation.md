# Form validation

Use Bluent fields inside the standard Blazor `EditForm` and validation system.

## Requirements

- Package: `Bluent.UI`
- Namespaces: `Bluent.UI.Components`,
  `Microsoft.AspNetCore.Components.Forms`, and
  `System.ComponentModel.DataAnnotations`
- Services and assets: the [shared setup](README.md#shared-consumer-setup)

## Complete source

[`FormValidation.razor`](../../../samples/Bluent.TaskExamples/Pages/Tasks/FormValidation.razor)
is the canonical compiled source. It includes the complete model,
data-annotation rules, `DataAnnotationsValidator`, validation messages, and
valid-submit handler.

## Expected behavior

Submitting empty or invalid values displays validation messages. The success
MessageBar appears only after the form passes validation.

## Common mistakes

- Add `DataAnnotationsValidator`; annotations on the model are not sufficient
  by themselves.
- Bind validation messages to the same model properties as the fields.
- Use `type="submit"` for the submit button and `OnValidSubmit` when invalid
  submissions must not run the save handler.
- Do not present uncompiled pseudocode as a form example.

## Render modes and evidence

The Razor page and model are build-verified in WebAssembly. Validation events
and submit callbacks require interactivity. The pattern uses Blazor's standard
forms APIs and does not imply a persistence or server-validation mechanism.
