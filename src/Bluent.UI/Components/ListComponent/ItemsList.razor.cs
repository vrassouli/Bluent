using Bluent.Core;
using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class ItemsList
{
    private List<ListItem> _items = new();

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public SelectionMode SelectionMode { get; set; } = SelectionMode.Single;
    [Parameter] public EventCallback<IEnumerable<ListItem>> SelectedItemsChanged { get; set; }
    // [Parameter] public bool Draggable { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-list";

        yield return SelectionMode.ToString().Kebaberize();
    }

    internal void Add(ListItem listItem)
    {
        _items.Add(listItem);
    }

    internal void Remove(ListItem listItem)
    {
        _items.Remove(listItem);
    }

    internal bool ShouldRenderIcon()
    {
        return _items.Any(x => !string.IsNullOrEmpty(x.Icon));
    }

    internal virtual void OnItemSelectionChanged(ListItem listItem)
    {
        if (listItem.Selected && SelectionMode == SelectionMode.Single)
        {
            foreach (var item in _items.Where(x => x.Selected && x != listItem))
            {
                item.SetSelection(false);
            }
        }

        SelectedItemsChanged.InvokeAsync(_items.Where(x => x.Selected));
    }

    internal virtual bool IsSelected(ListItem listItem)
    {
        return listItem.Selected;
    }
}
