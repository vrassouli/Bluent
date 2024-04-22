using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Tree
{
    private List<TreeItem> _items = new();
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public EventCallback<TreeItem> OnClick { get; set; }

    //internal bool ChildrenHaveSubItems => _items.Any(i => i.HaveSubItems);

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-tree";
    }

    internal void Add(TreeItem item)
    {
        _items.Add(item);
        StateHasChanged();
    }

    internal void Remove(TreeItem item)
    {
        _items.Remove(item);
        StateHasChanged();
    }

    internal void OnItemClick(TreeItem item)
    {
        OnClick.InvokeAsync(item);
    }
}
