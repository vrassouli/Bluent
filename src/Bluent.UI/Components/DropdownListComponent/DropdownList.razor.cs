using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace Bluent.UI.Components;


public partial class DropdownList<TItem>
    where TItem : class
{
    private Popover? _popover;
    private Virtualize<TItem>? _virtualizer;
    private string? _filter;

    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.BottomStart;
    [Parameter] public int MaxHeight { get; set; } = 180;
    [Parameter] public bool HideFilter { get; set; } = false;
    [Parameter] public bool HideClear { get; set; } = false;
    [Parameter] public string? FilterPlaceholder { get; set; } = "Filter";
    [Parameter] public TItem? SelectedItem { get; set; }
    [Parameter] public EventCallback<TItem?> SelectedItemChanged { get; set; }
    [Parameter] public string EmptyDisplayText { get; set; } = "Select...";
    [Parameter, EditorRequired] public Func<TItem, string> DisplayText { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment<TItem> ItemContent { get; set; } = default!;
    [Parameter, EditorRequired] public FilteredItemsProviderDelegate<TItem> ItemsProvider { get; set; } = default!;

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && _popover != null)
        {
            _popover.SetTrigger(this);
        }

        base.OnAfterRender(firstRender);
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-dropdown-list";
    }

    private ValueTask<ItemsProviderResult<TItem>> ListItemsProvider(ItemsProviderRequest request)
        => ItemsProvider(new FilteredItemsProviderRequest(request.StartIndex, request.Count, _filter, request.CancellationToken));

    private bool IsSelected(TItem item)
    {
        return item == SelectedItem;
    }

    private async Task OnSelectedItemChanged(TItem item, bool selected)
    {
        if (selected && !IsSelected(item))
            await OnSelectionChanged(item);
        else if (!selected && IsSelected(item))
            await OnSelectionChanged(null);
    }

    private async Task OnSelectionChanged(TItem? selection)
    {
        SelectedItem = selection;
        await SelectedItemChanged.InvokeAsync(SelectedItem);
    }

    private async Task OnFilterChanged(string? filter)
    {
        _filter = filter;
        if (_virtualizer != null)
        {
            await _virtualizer.RefreshDataAsync();
            _popover?.RefreshSurface();
        }
    }

    private async Task OnClearFilter()
    {
        await OnFilterChanged(null);
    }

    private async Task OnClearSelection()
    {
        await OnSelectionChanged(null);
    }

    private string GetDisplayText()
    {
        if (SelectedItem != null)
            return DisplayText(SelectedItem);

        return EmptyDisplayText;
    }
}
