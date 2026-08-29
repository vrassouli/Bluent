# CRUD/list pattern

Canonical example: `docs/examples/tasks/data-grid-paging.md`.

For tabular CRUD/list screens, prefer `DataGrid` for presentation and `DataPager` when paging is required. Place row/page commands with Bluent `Button`/toolbar patterns rather than raw buttons.

The task example is the current compiled authority for typed columns, `ItemsProvider`, and pager composition. Exact DataGrid/DataPager component pages remain pending; inspect current source/demo before using APIs beyond the canonical example.
