# Bluent OrderDesk reference application

OrderDesk is the canonical production-pattern Bluent sample. It is a small
customer and order management application, not a component catalog. The
workflow uses local in-memory data so a contributor can run it without
credentials, a database, or external services.

## Run the application

From the repository root:

```bash
dotnet restore samples/Bluent.OrderDesk/Bluent.OrderDesk.csproj
dotnet run --project samples/Bluent.OrderDesk/Bluent.OrderDesk.csproj
```

Open the local HTTP URL printed by the development server. The application is
a standalone Blazor WebAssembly consumer and uses project references to the
current `Bluent.UI`, `Bluent.UI.Charts`, and `Bluent.UI.Diagrams` sources.

## Project structure

| Path | Responsibility |
| --- | --- |
| `Models/` | Customer, order, filtering, and validated form models |
| `Data/OrderDeskRepository.cs` | Local application data and domain operations |
| `Components/Layout/` | Shared application shell, navigation, theme, and direction controls |
| `Components/Shared/` | Reusable application-level loading and filter-drawer content |
| `Pages/` | Dashboard, customer list/detail/create/edit, and order queue workflows |
| `wwwroot/` | Host document and application-specific presentation |

Application and domain code are intentionally separate from Bluent examples:
the repository owns customer/order state, while pages compose documented public
Bluent APIs. No demo project, demo-only service, or external infrastructure is
referenced.

## Why these patterns

- `AddBluentUI()` and one layout-level `<Containers />` host support dialogs,
  drawers, and toasts for the whole application.
- `DataGrid` uses an `ItemsProvider` so the data-loading boundary can later be
  replaced by an API without changing the grid composition.
- `EditForm`, data annotations, validation messages, and a validation summary
  keep business validation in the application model.
- `IDialogService` gates archival, while `IToastService` and `MessageBar`
  provide transient and persistent feedback.
- `IDrawerService` keeps order filters available without replacing the queue.
- `Bluent.UI.Charts` presents meaningful fulfilled revenue. The diagram
  represents the real order lifecycle rather than adding a decorative graph.
- `IBluentTheme` controls light/dark mode and LTR/RTL direction from the
  persistent application shell.

## Representative verification route

1. Open the dashboard and inspect the revenue chart and order lifecycle.
2. Open Customers, search for a non-existent company to reach the empty state,
   then clear the search.
3. Add a customer, submit the empty form to see validation errors, complete it,
   and confirm the success message and toast on the detail page.
4. Edit the customer and save another change.
5. Archive the customer, cancel once, then confirm and check the feedback.
6. Open Orders, apply a status or minimum-value filter in the drawer, and
   choose a combination with no matches to reach the empty state.
7. Toggle dark mode and RTL from the header on desktop and mobile viewports.
8. Reload in a fresh tab and check the browser console for Bluent-related
   warnings or errors.

The in-memory state resets when the browser application is reloaded. Theme and
direction choices also apply only to the current document; production
applications should persist those preferences in application-owned storage.
