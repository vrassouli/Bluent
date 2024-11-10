using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace Bluent.UI.Components;

public delegate ValueTask<ItemsProviderResult<TItem>> FilteredItemsProviderDelegate<TItem>(FilteredItemsProviderRequest request);
public readonly struct FilteredItemsProviderRequest
{
    public int StartIndex { get; }
    public int Count { get; }
    public string? Filter { get; }
    public CancellationToken CancellationToken { get; }
    public FilteredItemsProviderRequest(int startIndex, int count, string? filter, CancellationToken cancellationToken)
    {
        StartIndex = startIndex;
        Count = count;
        Filter = filter;
        CancellationToken = cancellationToken;
    }
}
