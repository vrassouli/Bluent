# Forms pattern

Canonical examples:

- `docs/examples/tasks/basic-input.md`
- `docs/examples/tasks/form-validation.md`

Route field choice through `DECISION-GUIDE.md`, then verify exact APIs. Use Bluent fields rather than raw input/select controls when a suitable Bluent field exists. Compose them with standard Blazor `EditForm`, validators and validation messages.

For a login/data-entry form, the verified pattern is: bound Bluent fields + validation + Bluent `Button` action + inline feedback where appropriate. Do not invent field APIs that are not present in the installed version/current source.
