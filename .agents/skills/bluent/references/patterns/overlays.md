# Overlay pattern

Canonical sources:

- `docs/components/dialog.md`
- `docs/examples/tasks/confirmation-dialog.md`
- `docs/examples/tasks/drawer-and-popover.md`
- `docs/examples/tasks/feedback.md`

Use `Dialog` for modal/confirmation flows, `Drawer` for side-panel workflows, `Popover` for anchored transient content, `MessageBar` for persistent inline feedback, and `Toast` for transient global feedback.

Overlay services depend on the shared Bluent setup, including one `<Containers />` in the active layout tree. Do not create page-local duplicate container hosts.

Dialog has a canonical runtime-verified component page. Drawer/Popover/Toast family API pages remain pending, so stay within compiled task patterns or inspect current source before using additional APIs.
