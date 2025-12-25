using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class TreeItem
{
    private List<TreeItem> _items = new();
    private bool _mouseEntered;
    private bool _canDrop;
    private bool _isDragging;

    [Parameter] public string Title { get; set; } = default!;
    [Parameter] public string? Icon { get; set; } = default!;
    [Parameter] public string? ExpandedIcon { get; set; } = default!;
    [Parameter] public bool Expanded { get; set; } = default!;
    [Parameter] public bool DisableCheckBox { get; set; }
    [Parameter] public EventCallback<bool> ExpandedChanged { get; set; } = default!;
    [Parameter] public bool? IsChecked { get; set; } = false;
    [Parameter] public EventCallback<bool?> IsCheckedChanged { get; set; } = default!;
    [Parameter] public EventCallback OnClick { get; set; } = default!;
    [Parameter] public object? Data { get; set; } = default!;
    [Parameter] public string? Href { get; set; }
    [Parameter] public string? Target { get; set; }
    [Parameter] public bool? Draggable { get; set; }
    [Parameter] public Func<object> DragData { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? ItemTemplate { get; set; }
    [CascadingParameter] public Tree Tree { get; set; } = default!;
    [CascadingParameter] public DndContext? DndContext { get; set; } = default!;
    [CascadingParameter] public TreeItem? ParentItem { get; set; } = default!;
    public IReadOnlyList<TreeItem> Items => _items;

    internal bool HasSubItems => _items.Any();
    private bool CanDrop
    {
        get
        {
            if (DndContext?.Data != null)
            {
                if (DndContext.Data is TreeItem draggingTreeItem)
                {
                    if (!Tree.CanDrag(draggingTreeItem))
                        return false;

                    if (Tree.CanDrop != null && !Tree.CanDrop(draggingTreeItem, this))
                        return false;

                    if (Items.Contains(draggingTreeItem) || draggingTreeItem.Contains(this) || draggingTreeItem == this)
                    {
                        return false;
                    }
                }

                return true;
            }

            return false;
        }
    }

    private bool IsDraggable => Draggable ?? Tree.Draggable;

    public TreeItem()
    {
        DragData = () => Data ?? this;
    }
    
    private bool Contains(TreeItem subItem)
    {
        if (Items.Contains(subItem))
            return true;

        foreach (var item in Items)
        {
            if (item.Contains(subItem))
                return true;
        }

        return false;
    }

    protected override void OnInitialized()
    {
        if (Tree is null)
            throw new InvalidOperationException($"'{nameof(TreeItem)}' component should be nested inside a '{nameof(Components.Tree)}' or '{nameof(TreeItem)}' component.");

        if (ParentItem != null)
            ParentItem.Add(this);
        else
            Tree.Add(this);

        base.OnInitialized();
    }

    protected override async Task OnParametersSetAsync()
    {
        await base.OnParametersSetAsync();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
            StateHasChanged();

        base.OnAfterRender(firstRender);
    }

    public override void Dispose()
    {
        if (ParentItem != null)
            ParentItem.Remove(this);
        else
            Tree.Remove(this);

        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "item";

        if (Expanded)
            yield return "expanded";
    }

    private void Add(TreeItem item)
    {
        _items.Add(item);
        StateHasChanged();
    }

    private void Remove(TreeItem item)
    {
        _items.Remove(item);
        StateHasChanged();
    }

    private void OnDragStarted()
    {
        DndContext?.SetData(DragData.Invoke());
        _isDragging = true;
    }

    private void OnDragEnded()
    {
        _isDragging = false;
    }

    private async Task OnDropAsync()
    {
        if (DndContext?.Data != null && DndContext.Data != DragData.Invoke())
        {
            DndContext.SeDropTarget(this);

            await Tree.OnItemDropedAsync();

            _canDrop = false;
        }
    }

    private void OnDragOver()
    {
        _canDrop = (DndContext?.Data != null && DndContext.Data != DragData.Invoke());
    }

    private void OnDragLeave()
    {
        _canDrop = false;
    }

    private string GetLayoutClasses()
    {
        var classes = new List<string>();

        if (_canDrop)
            classes.Add("drop-target");

        if (_isDragging)
            classes.Add("dragging");

        return string.Join(' ', classes);
    }

    private async Task ItemClickHandler()
    {
        if (Tree.ToggleSubItemsOnClick)
            await ExpanderClickHandler();

        if (Tree.ToggleCheckStateOnClick)
            await CheckboxCheckedHandler(IsChecked != true);

        Tree.OnItemClick(this);
    }

    private async Task ExpanderClickHandler()
    {
        if (HasSubItems)
        {
            Expanded = !Expanded;
            await ExpandedChanged.InvokeAsync(Expanded);
        }
    }

    private void MouseEnterHandler() => _mouseEntered = true;

    private void MouseLeaveHandler() => _mouseEntered = false;

    private async Task CheckboxCheckedHandler(bool? value)
    {
        await SetCheckState(value);

        var mode = Tree.CheckboxMode;
        if (mode == TreeCheckboxMode.Independent)
            return;

        if (mode == TreeCheckboxMode.Cascade || mode == TreeCheckboxMode.CascadeDown)
        {
            if (value != null)
                await CascadeDownCheckState(value.Value);
        }

        if (mode == TreeCheckboxMode.Cascade || mode == TreeCheckboxMode.CascadeUp)
        {
            ParentItem?.CascadeUpCheckState();
        }
    }

    private async Task CascadeUpCheckState()
    {
        var currentState = IsChecked;

        if (_items.All(i => i.IsChecked == true) && currentState != true)
        {
            await SetCheckState(true);
        }
        else if (_items.All(i => i.IsChecked == false) && currentState != false)
        {
            await SetCheckState(false);
        }
        else if (currentState != null)
        {
            await SetCheckState(null);
        }

        ParentItem?.CascadeUpCheckState();
    }

    private bool? GetCheckState()
    {
        if (IsChecked == true)
            return true;

        var mode = Tree.CheckboxMode;
        if (mode == TreeCheckboxMode.Independent)
            return IsChecked;

        if (_items.Any() && (mode == TreeCheckboxMode.Cascade || mode == TreeCheckboxMode.CascadeUp))
        {
            var allChecked = _items.All(i => i.GetCheckState() == true);
            if (allChecked)
                return true;

            var allUnchecked = _items.All(i => i.GetCheckState() == false);
            if (allUnchecked)
                return false;

            return null;
        }
        if (ParentItem != null && (mode == TreeCheckboxMode.Cascade || mode == TreeCheckboxMode.CascadeDown))
        {
            if (ParentItem.IsChecked == true)
                return true;

            if (ParentItem.IsChecked == false)
                return false;
        }

        return false;
    }

    private async Task CascadeDownCheckState(bool isChecked)
    {
        foreach (var item in _items)
        {
            await item.SetCheckState(isChecked);
            await item.CascadeDownCheckState(isChecked);
        }
    }

    private async Task SetCheckState(bool? value)
    {
        if (!DisableCheckBox && IsChecked != value)
        {
            IsChecked = value;
            await IsCheckedChanged.InvokeAsync(IsChecked);
            StateHasChanged();
        }
    }
}
