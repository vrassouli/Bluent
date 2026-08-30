# Data-entry pattern

Canonical examples:

- `docs/examples/tasks/basic-input.md`
- `docs/examples/tasks/form-validation.md`
- `docs/examples/tasks/theme-dark-mode-and-rtl.md`

Choose the narrowest Bluent field matching the data type: `TextField`, `NumericField`, date/time fields, Boolean `Checkbox`, or a selection family. Prefer a specialized field over generic raw HTML when Bluent provides one.

Use `@bind-Value` conventions shown by the compiled examples. For Persian/RTL scenarios, load `../foundation/rtl-localization.md` and verify field-specific culture/conversion APIs against current source or a canonical page.
