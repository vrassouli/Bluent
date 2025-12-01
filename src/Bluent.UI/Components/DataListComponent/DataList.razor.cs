using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace Bluent.UI.Components;

public partial class DataList<TItem>
    where TItem : class
{
    private Virtualize<TItem>? _virtualizer;
    private ICollection<TItem>? _items;
    private TItem? _selectedItem;

    [Parameter] public ICollection<TItem>? Items { get; set; }
    [Parameter] public ItemsProviderDelegate<TItem>? ItemsProvider { get; set; }
    [Parameter] public float ItemsSize { get; set; } = 36;
    [Parameter, EditorRequired] public RenderFragment<TItem>? ItemTemplate { get; set; }
    [Parameter] public RenderFragment<PlaceholderContext>? PlaceHolder { get; set; }
    [Parameter] public RenderFragment? EmptyContent { get; set; }
    [Parameter] public Func<TItem, object> ItemKey { get; set; } = item => item;
    [Parameter] public List<TItem> SelectedData { get; set; } = new();
    [Parameter] public TItem? SelectedItem { get; set; }
    [Parameter] public EventCallback<TItem?> SelectedItemChanged { get; set; }
    [Parameter] public EventCallback<List<TItem>> SelectedDataChanged { get; set; }

    protected override async Task OnParametersSetAsync()
    {
        if (!Equals(_items, Items))
        {
            _items = Items;

            await RefreshDataAsync();
        }

        if (_selectedItem != SelectedItem)
        {
            SelectedData.Clear();
            SelectedItem = _selectedItem;
            if (SelectedItem != null)
            {
                SelectedData.Add(SelectedItem);
            }
        }

        await base.OnParametersSetAsync();
    }

    internal override void OnItemSelectionChanged(ListItem listItem)
    {
        if (listItem.Data is TItem data)
        {
            if (listItem.Selected && !IsSelected(listItem))
            {
                if (SelectionMode == Core.SelectionMode.Single)
                    SelectedData.Clear();

                SelectedData.Add(data);
                SelectedDataChanged.InvokeAsync(SelectedData);
                
                SelectedItem = data;
                SelectedItemChanged.InvokeAsync(SelectedItem);
            }
            else if (!listItem.Selected && IsSelected(listItem))
            {
                var key = ItemKey.Invoke(data);

                SelectedData.RemoveAll(d => Equals(ItemKey.Invoke(d), key));
                SelectedDataChanged.InvokeAsync(SelectedData);

                SelectedItem = SelectedData.LastOrDefault();
                SelectedItemChanged.InvokeAsync(SelectedItem);
            }
        }

        base.OnItemSelectionChanged(listItem);
    }

    internal override bool IsSelected(ListItem listItem)
    {
        if (listItem.Data is TItem data)
        {
            return IsSelected(data);
        }

        return base.IsSelected(listItem);
    }

    internal bool IsSelected(TItem item)
    {
        var key = ItemKey.Invoke(item);
        if (SelectedItem != null && ItemKey.Invoke(SelectedItem).Equals(key))
            return true;
        
        var isSelected = SelectedData.Any(x => ItemKey.Invoke(x).Equals(key));

        return isSelected;
    }

    public async Task RefreshDataAsync()
    {
        if (_virtualizer != null)
            await _virtualizer.RefreshDataAsync();
    }
}