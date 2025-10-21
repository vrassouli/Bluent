using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace Bluent.UI.Components;

public partial class DataList<TItem>
    where TItem : class
{
    private Virtualize<TItem>? _virtualizer;
    private ICollection<TItem>? _items;

    [Parameter] public ICollection<TItem>? Items { get; set; }
    [Parameter] public ItemsProviderDelegate<TItem>? ItemsProvider { get; set; }
    [Parameter] public float ItemsSize { get; set; } = 36;
    [Parameter, EditorRequired] public RenderFragment<TItem>? ItemTemplate { get; set; }
    [Parameter] public RenderFragment<PlaceholderContext>? PlaceHolder { get; set; }
    [Parameter] public RenderFragment? EmptyContent { get; set; }
    [Parameter] public Func<TItem, object> ItemKey { get; set; } = item => item;
    [Parameter] public List<TItem> SelectedData { get; set; } = new();
    [Parameter] public EventCallback<List<TItem>> SelectedDataChanged { get; set; }

    protected override async Task OnParametersSetAsync()
    {
        if (!Equals(_items, Items))
        {
            _items = Items;

            await RefreshDataAsync();
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
            }
            else if (!listItem.Selected && IsSelected(listItem))
            {
                var key = ItemKey.Invoke(data);

                SelectedData.RemoveAll(d => Equals(ItemKey.Invoke(d), key));
                SelectedDataChanged.InvokeAsync(SelectedData);
            }
        }

        base.OnItemSelectionChanged(listItem);
    }

    internal override bool IsSelected(ListItem listItem)
    {
        if (listItem.Data is TItem data)
        {
            var key = ItemKey.Invoke(data);
            var isSelected = SelectedData.Any(x => ItemKey.Invoke(x).Equals(key));

            return isSelected;
        }

        return base.IsSelected(listItem);
    }

    internal bool IsSelected(TItem item)
    {
        var key = ItemKey.Invoke(item);
        var isSelected = SelectedData.Any(x => ItemKey.Invoke(x).Equals(key));

        return isSelected;
    }

    public async Task RefreshDataAsync()
    {
        if (_virtualizer != null)
            await _virtualizer.RefreshDataAsync();
    }
}