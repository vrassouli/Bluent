﻿using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;
using System.Linq.Expressions;

namespace Bluent.UI.Components;


public partial class DropdownList<TItem, TValue>
    where TItem : class
{
    private Popover? _popover;
    private Virtualize<TItem>? _virtualizer;
    private string? _filter;
    private TItem? _selectedItem;

    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.BottomStart;
    [Parameter] public int MaxHeight { get; set; } = 180;
    [Parameter] public bool HideFilter { get; set; } = false;
    [Parameter] public bool HideClear { get; set; } = false;
    [Parameter] public string? FilterPlaceholder { get; set; } = "Filter";
    [Parameter] public TValue? Value { get; set; }
    [Parameter] public EventCallback<TValue?> ValueChanged { get; set; }
    [Parameter] public string EmptyDisplayText { get; set; } = "Select...";
    [Parameter] public float ItemSize { get; set; } = 50;
    [Parameter, EditorRequired] public Func<TItem, TValue?> ItemValue { get; set; } = _ => default;
    [Parameter, EditorRequired] public Func<TItem?, string> ItemText { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment<TItem> ItemContent { get; set; } = default!;
    [Parameter, EditorRequired] public FilteredItemsProviderDelegate<TItem> ItemsProvider { get; set; } = default!;
    [Parameter] public RenderFragment<PlaceholderContext>? Placeholder { get; set; }
    [Parameter] public RenderFragment? EmptyContent { get; set; }

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
        if (Value is null)
            return false;

        return Value.Equals(GetItemValue(item));
    }

    private TValue? GetItemValue(TItem item) => ItemValue(item);

    private async Task OnSelectedItemChanged(TItem item, bool selected)
    {
        if (selected && !IsSelected(item))
            await OnSelectionChanged(item);
        else if (!selected && IsSelected(item))
            await OnSelectionChanged(null);
    }

    private async Task OnSelectionChanged(TItem? selection)
    {
        _selectedItem = selection;

        if (selection == null)
        {
            Value = default;
        }
        else
        {
            Value = GetItemValue(selection);
        }

        await ValueChanged.InvokeAsync(Value);

        _popover?.Close();
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
        var displayText = ItemText(_selectedItem);

        return displayText ?? EmptyDisplayText;
    }
}
