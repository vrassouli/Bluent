using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Tree
{
    private DndContext _dndContext = new();
    private List<TreeItem> _items = new();
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public TreeCheckboxMode CheckboxMode { get; set; } = TreeCheckboxMode.None;
    [Parameter] public bool CircularCheckboxes { get; set; }
    [Parameter] public bool Draggable { get; set; }
    [Parameter] public bool Orderable { get; set; }
    [Parameter] public bool ToggleSubItemsOnClick { get; set; } = true;
    [Parameter] public bool ToggleCheckStateOnClick { get; set; }
    [Parameter] public EventCallback<TreeItem> OnClick { get; set; }
    [Parameter] public EventCallback<DndContext> OnItemDrop { get; set; }
    [Parameter] public EventCallback<DndContext> OnInsertAfter { get; set; }
    [Parameter] public Func<object, object, bool>? CanDrop { get; set; }
    [Parameter] public Func<object, bool> CanDrag { get; set; } = _ => true;
    [Parameter] public Func<object, bool> CanReorder { get; set; } = _ => true;
    [CascadingParameter] public DndContext? SharedContext { get; set; }

    public IReadOnlyList<TreeItem> Items => _items;
    private DndContext DndContext => SharedContext ?? _dndContext;

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

    internal async Task OnItemDroppedAsync()
    {
        await OnItemDrop.InvokeAsync(DndContext);

        DndContext.Clear();
    }

    internal async Task OnInsertAfterAsync()
    {
        await OnInsertAfter.InvokeAsync(DndContext);

        DndContext.Clear();
    }
}
