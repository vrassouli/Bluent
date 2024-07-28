using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Tree
{
    private List<TreeItem> _items = new();
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public TreeCheckboxMode CheckboxMode { get; set; } = TreeCheckboxMode.None;
    [Parameter] public bool CircularCheckboxes { get; set; }
    [Parameter] public bool Draggable { get; set; }
    [Parameter] public bool ToggleSubItemsOnClick { get; set; } = true;
    [Parameter] public bool ToggleCheckStateOnClick { get; set; }
    [Parameter] public EventCallback<TreeItem> OnClick { get; set; }
    [Parameter] public EventCallback<TreeDndContext> OnItemDrag { get; set; }

    public IReadOnlyList<TreeItem> Items => _items;
    private TreeDndContext _dragData = new();

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            StateHasChanged();

        base.OnAfterRender(firstRender);
    }

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

    internal async Task OnItemDropedAsync()
    {
        await OnItemDrag.InvokeAsync(_dragData);

        _dragData.DraggedItem = null;
        _dragData.DropedItem = null;
    }
}
