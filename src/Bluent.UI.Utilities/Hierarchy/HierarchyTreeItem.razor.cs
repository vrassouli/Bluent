using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public partial class HierarchyTreeItem : ComponentBase, IDisposable
{
    private bool _expanded;
    private List<HierarchyItem>? _items;
    private readonly List<HierarchyTreeItem> _subItems = new();
    // private HierarchyRootItem? _newItem;
    [Parameter, EditorRequired] public HierarchyItem Item { get; set; }
    // [Parameter, EditorRequired] public bool Rename { get; set; }
    [CascadingParameter] public HierarchyTreeBrowser TreeBrowser { get; set; } = default!;
    [CascadingParameter] public HierarchyTreeItem? ParentItem { get; set; }

    private bool IsRootItem => Item is HierarchyRootItem;
    private bool ShouldExpand => IsRootItem;
    private string? Icon => IsRootItem ? TreeBrowser.RootItemIcon : TreeBrowser.ItemIcon;
    private string? ExpandedIcon => IsRootItem ? TreeBrowser.RootItemExpandedIcon : TreeBrowser.ItemIcon;
    public string? Path
    {
        get
        {
            if (IsRootItem)
                return ParentItem is null ? Item.Name : $"{ParentItem.Path}/{Item.Name}";

            return ParentItem?.Path;
        }
    }

    public bool IsSelected => TreeBrowser.IsSelected(this);

    protected override void OnInitialized()
    {
        if (ParentItem != null)
        {
            ParentItem.AddItem(this);
        }
        else
        {
            TreeBrowser.AddItem(this);
        }
        base.OnInitialized();
    }

    public void Dispose()
    {
        if (ParentItem != null)
        {
            ParentItem.RemoveItem(this);
        }
        else
        {
            TreeBrowser.RemoveItem(this);
        }
    }

    private void AddItem(HierarchyTreeItem item)
    {
        _subItems.Add(item);
    }
    
    private void RemoveItem(HierarchyTreeItem item)
    {
        _subItems.Remove(item);
    }
    
    private async Task OnExpandChanged(bool expanded)
    {
        _expanded = expanded;

        if (expanded)
        {
            await LoadItemsAsync();
        }
    }

    private async Task LoadItemsAsync()
    {
        _items = await TreeBrowser.GetHierarchyItems(Path);
    }

    private Task HandleClick()
    {
        return TreeBrowser.OnItemClicked(this);
    }

    internal async Task RefreshAsync()
    {
        if (!_expanded)
            return;
        
        await LoadItemsAsync();
        
        foreach (var subItem in _subItems)
            await subItem.RefreshAsync();
    }

    internal void SetStateHasChanged()
    {
        InvokeAsync(StateHasChanged);
    }
    //
    // internal void CreateNewRootItem()
    // {
    //     if (_items is null)
    //         _items = [];
    //     
    //     _newItem = new HierarchyRootItem("New Item");
    //     _items.Add(_newItem);
    //
    //     _expanded = true;
    //         
    //     SetStateHasChanged();
    // }
    //
    //
    // private Task HandleItemRenamed(string name)
    // {
    //     var oldPath = Path;
    //     var oldName = Item.Name;
    //     Item.Name = name;
    //
    //     if (ParentItem != null)
    //         return ParentItem.ItemRenamed(Item, Path, oldPath, name, oldName);
    //     
    //     return TreeBrowser.ItemRenamed(Item, Path, oldPath, name, oldName);
    // }
    //
    // private Task ItemRenamed(HierarchyItem item, string? path, string? oldPath, string name, string oldName)
    // {
    //     if (_newItem == item)
    //     {
    //         if (string.IsNullOrEmpty(name))
    //         {
    //             _items?.Remove(item);
    //             return Task.CompletedTask;
    //         }
    //         
    //         _newItem = null;
    //         return TreeBrowser.NotifyCreateRootItem(path);
    //     }
    //     else if (TreeBrowser.RenamingItem == item)
    //     {
    //         HierarchyPathSelection pathSelection;
    //
    //         if (TreeBrowser.RenamingItem is HierarchyRootItem rootItem)
    //         {
    //             pathSelection = new HierarchyPathSelection(oldPath);
    //         }
    //         else
    //         {
    //             pathSelection = new HierarchyItemSelection(oldPath, oldName);
    //         }
    //     
    //         return TreeBrowser.NotifyRenameItem(pathSelection, name);
    //     }
    //     return Task.CompletedTask;
    // }
}