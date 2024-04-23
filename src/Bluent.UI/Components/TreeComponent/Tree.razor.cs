using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Tree
{
    private List<TreeItem> _items = new();
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public TreeCheckboxMode CheckboxMode { get; set; } = TreeCheckboxMode.None;
    [Parameter] public bool CircularCheckboxes { get; set; }
    [Parameter] public bool ToggleSubItemsOnClick { get; set; } = true;
    [Parameter] public bool ToggleCheckStateOnClick { get; set; }
    [Parameter] public EventCallback<TreeItem> OnClick { get; set; }

    public IReadOnlyList<TreeItem> Items => _items;

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
