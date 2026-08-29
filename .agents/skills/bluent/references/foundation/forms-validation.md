# Forms and validation

Canonical sources:

- `docs/examples/tasks/basic-input.md`
- `docs/examples/tasks/form-validation.md`
- exact component references under `docs/components/` when available

Use Bluent fields inside the standard Blazor `EditForm` / `InputBase<T>` validation model. Prefer `@bind-Value`; do not assume native HTML `value` binding conventions apply to every component.

The compiled basic-input task currently demonstrates `TextField`, `NumericField`, `SelectField`, and `Checkbox`. The compiled validation task demonstrates data annotations, `DataAnnotationsValidator`, validation messages, valid submit, and Bluent fields.

For immediate text updates, the canonical task explicitly uses `BindValueEvent="oninput"`. Verify component-specific parameters, constraints and parsing against the exact source/reference rather than extrapolating between fields.

Client-side bounds or input behavior do not replace application/server business validation.
