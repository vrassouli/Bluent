// using Etraab.Common;
// using Microsoft.AspNetCore.Components;
// using Microsoft.AspNetCore.Components.Web.Virtualization;
//
// namespace Etraab.Blazor;
//
// /// <summary>
// /// Base component that provides helpers for working with a <see cref="Virtualize{TItem}"/> component
// /// and for sending paged/virtualized requests to a service.
// /// </summary>
// /// <typeparam name="TVirtualized">The item type rendered by the virtualize component.</typeparam>
// public abstract class EtraabVirtualizedComponentBase<TVirtualized> : EtraabComponentBase
// {
//     private int? _totalItems;
//     private string? _search;
//     private int _searchDebounceMs; // consumed once, then reset
//
//     /// <summary>
//     /// The <see cref="Virtualize{TItem}"/> instance associated with this component.
//     /// Set by the consuming component to allow programmatic refreshes.
//     /// </summary>
//     protected Virtualize<TVirtualized>? Virtualize { get; set; }
//
//     /// <summary>
//     /// Optional search text supplied from the parent component. When this value changes
//     /// the component will debounce and then refresh the virtualized data.
//     /// </summary>
//     [Parameter] public string? Search { get; set; }
//
//     /// <summary>
//     /// Event callback invoked when the total number of items available changes.
//     /// The callback parameter contains the new total item count.
//     /// </summary>
//     [Parameter] public EventCallback<int> TotalItemsChanged { get; set; }
//     
//     protected EtraabVirtualizedComponentBase(int debounceMs = 250)
//     {
//         _searchDebounceMs = debounceMs;
//     }
//     
//     /// <summary>
//     /// Builds a <see cref="RequestFilter"/> from an <see cref="ItemsProviderRequest"/>.
//     /// </summary>
//     /// <param name="request">The items provider request supplied by <see cref="Virtualize{TItem}"/>.</param>
//     /// <returns>A <see cref="RequestFilter"/> containing start index, count and the current search text.</returns>
//     protected RequestFilter BuildRequestFilter(ItemsProviderRequest request)
//     {
//         return new RequestFilter(request.StartIndex, request.Count, _search);
//     }
//
//     /// <summary>
//     /// Sends a paged/virtualized request to a service and adapts the result to an
//     /// <see cref="ItemsProviderResult{TItem}"/> for consumption by <see cref="Virtualize{TItem}"/>.
//     /// </summary>
//     /// <typeparam name="TService">The service type used to perform the request.</typeparam>
//     /// <param name="action">A delegate that performs the request given the service and a cancellation token.</param>
//     /// <param name="createScope"></param>
//     /// <returns>An <see cref="ItemsProviderResult{TItem}"/> containing the page of data and the total available item count.</returns>
//     /// <remarks>
//     /// This method will swallow <see cref="TaskCanceledException"/> and <see cref="OperationCanceledException"/>
//     /// and return an empty set to avoid bubbling cancellation into the virtualize component.
//     /// </remarks>
//     protected async ValueTask<ItemsProviderResult<TVirtualized>> SendVirtualizeRequestAsync<TService>(
//         Func<TService, CancellationToken, Task<PagedList<TVirtualized>>> action, bool createScope = false)
//         where TService : notnull
//     {
//         // Consume debounce so scrolling/paging stays snappy
//         var debounce = Interlocked.Exchange(ref _searchDebounceMs, 0);
//         
//         try
//         {
//             var result = await SendRequestAsync(action, createScope, debounce);
//             if (result is null)
//             {
//                 return new ItemsProviderResult<TVirtualized>([], 0);
//             }
//             
//             var totalItems = result.Total;
//             if (_totalItems != totalItems)
//             {
//                 _totalItems = totalItems;
//                 await TotalItemsChanged.InvokeAsync(totalItems);
//             }
//             
//             return new ItemsProviderResult<TVirtualized>(result.Data, result.Total);
//         }
//         // catch (TaskCanceledException)
//         // {
//         //     return new ItemsProviderResult<TVirtualized>([], _totalItems ?? 0);
//         // }
//         catch (OperationCanceledException)
//         {
//             // Swallow cancellations for Virtualize
//             return new ItemsProviderResult<TVirtualized>([], _totalItems ?? 0);
//         }
//     }
//     
//     /// <summary>
//     /// Called when component parameters have been set. Detects changes to <see cref="Search"/>
//     /// and triggers a debounced refresh of the virtualized data when the search text changes.
//     /// </summary>
//     /// <returns>A task that completes when parameter handling is finished.</returns>
//     protected override async Task OnParametersSetAsync()
//     {
//         if (!string.Equals(_search, Search, StringComparison.Ordinal))
//         {
//             _search = Search;
//             _searchDebounceMs = 250; // debounce next fetch only
//             await RefreshAsync();
//         }
//
//         await base.OnParametersSetAsync();
//     }
//     
//     /// <summary>
//     /// Requests that the associated <see cref="Virtualize{TItem}"/> instance refresh its data.
//     /// If the <see cref="Virtualize{TItem}"/> instance is not set this method does nothing.
//     /// </summary>
//     /// <returns>A task that completes when the refresh call completes (or immediately if no virtualize instance).</returns>
//     public virtual async Task RefreshAsync()
//     {
//         if (Virtualize is not null)
//         {
//             await Virtualize.RefreshDataAsync();
//         }
//     }
//
//     /// <summary>
//     /// set search
//     /// </summary>
//     /// <param name="search"></param>
//     /// <returns></returns>
//     public async Task SetSearchAsync(string? search)
//     {
//         Search = _search = search;
//         await RefreshAsync();
//     }
// }