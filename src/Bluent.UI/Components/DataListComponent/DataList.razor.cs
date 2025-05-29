using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace Bluent.UI.Components;

public partial class DataList<TItem>
    where TItem : class
{
    [Parameter] public ICollection<TItem>? Items { get; set; }
    [Parameter] public ItemsProviderDelegate<TItem>? ItemsProvider { get; set; }
    [Parameter] public float ItemsSize { get; set; } = 36;
    [Parameter, EditorRequired] public RenderFragment<TItem>? ItemTemplate { get; set; }
    [Parameter] public RenderFragment<PlaceholderContext>? PlaceHolder { get; set; }
    [Parameter] public RenderFragment? EmptyContent { get; set; }
    [Parameter] public Func<TItem, object> ItemKey { get; set; } = item => item;
    [Parameter] public List<TItem> SelectedData { get; set; } = new List<TItem>();
    [Parameter] public EventCallback<List<TItem>> SelectedDataChanged { get; set; }

    internal override void OnItemSelectionChanged(ListItem listItem)
    {
        var data = listItem.Data as TItem;

        if (data is not null)
        {
            if (listItem.Selected && SelectionMode == SelectionMode.Single)
            {
                var key = ItemKey.Invoke(data);

                SelectedData.RemoveAll(d => ItemKey.Invoke(d) != key);
            }

            SelectedData.Add(data);
            SelectedDataChanged.InvokeAsync(SelectedData);
        }


        base.OnItemSelectionChanged(listItem);
    }

    internal override bool IsSelected(ListItem listItem)
    {
        var data = listItem.Data as TItem;
        if (data is not null)
        {
            var key = ItemKey.Invoke(data);
            var isSelected = SelectedData.Any(x => ItemKey.Invoke(x).Equals(key));

            return isSelected;
        }
        return base.IsSelected(listItem);
    }
}
