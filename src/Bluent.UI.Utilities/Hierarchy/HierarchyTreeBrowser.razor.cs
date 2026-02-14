using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public delegate ValueTask<List<HierarchyItem>> ReadHierarchyItemsDelegate(string? path);

public partial class HierarchyTreeBrowser
{
    private List<HierarchyItem>? _items;
    private readonly List<HierarchyTreeItem> _treeItems = new ();
    private HierarchyTreeItem? _selectedTreeItem;
    private HierarchyRootItem? _newItem;
    private HierarchyItem? _renameItem;

    [Parameter] public string? RootItemIcon { get; set; } = "icon-ic_fluent_folder_20_regular";
    [Parameter] public string? RootItemExpandedIcon { get; set; } = "icon-ic_fluent_folder_open_20_regular";
    [Parameter] public string? ItemIcon { get; set; } = "icon-ic_fluent_document_20_regular";
    [Parameter] public bool RootOnly { get; set; }

    [Parameter] public EventCallback<HierarchyPathSelection> OnPathSelected { get; set; }
    [Parameter] public EventCallback<HierarchyItemSelection> OnItemSelected { get; set; }
    [Parameter] public EventCallback OnItemDeselected { get; set; }
    [Parameter] public EventCallback<HierarchyPathSelection> OnCreateRootItem { get; set; }
    [Parameter] public EventCallback<(HierarchyPathSelection item, string name)> OnRenameItem { get; set; }
    
    [Parameter, EditorRequired]
    public ReadHierarchyItemsDelegate GetHierarchyItems { get; set; }
        = _ => new ValueTask<List<HierarchyItem>>(new List<HierarchyItem>());
    public HierarchyItem? RenamingItem => _renameItem;

    protected override async Task OnInitializedAsync()
    {
        await LoadRootItemsAsync();
        await base.OnInitializedAsync();
    }

    private async Task LoadRootItemsAsync()
    {
        _items = await GetHierarchyItems(null);
    }
    
    public async Task RefreshAsync()
    {
        await LoadRootItemsAsync();

        foreach (var treeItem in _treeItems)
            await treeItem.RefreshAsync();
    }

    public void CreateNewRootItem()
    {
        if (_selectedTreeItem is null && _items is not null)
        {
            _newItem = new HierarchyRootItem("New Item");
            _items.Add(_newItem);
        }
        else if (_selectedTreeItem is not null && _selectedTreeItem.Item is HierarchyRootItem)
        {
            _selectedTreeItem.CreateNewRootItem();
        }
    }

    public void Rename()
    {
        _renameItem = _selectedTreeItem?.Item;
        
        // if (_selectedTreeItem is not null)
        //     _selectedTreeItem.SetStateHasChanged();
    }
    
    public Task OnItemClicked(HierarchyTreeItem treeItem)
    {
        if (_newItem is not null)
        {
            NotifyCreateRootItem(treeItem.Path);
        }

        if (_renameItem is not null)
        {
            ///////////
        }
        
        if (treeItem != _selectedTreeItem)
        {
            _selectedTreeItem?.SetStateHasChanged();

            _selectedTreeItem = treeItem;

            if (treeItem.Item is HierarchyRootItem)
            {
                return OnPathSelected.InvokeAsync(new HierarchyPathSelection(treeItem.Path));
            }

            return OnItemSelected.InvokeAsync(new HierarchyItemSelection(treeItem.Path, treeItem.Item.Name));
        }
        else
        {
            var currentSelection = _selectedTreeItem;
            _selectedTreeItem = null;
            currentSelection?.SetStateHasChanged();

            return OnItemDeselected.InvokeAsync();
        }
    }

    public void AddItem(HierarchyTreeItem item)
    {
        _treeItems.Add(item);
    }

    public void RemoveItem(HierarchyTreeItem item)
    {
        _treeItems.Remove(item);
    }

    public Task ItemRenamed(HierarchyItem item, string? path, string? oldPath, string name, string oldName)
    {
        if (item == _newItem)
        {
            _newItem = null;
            return NotifyCreateRootItem(path);
        }
        else if (item == _renameItem)
        {
            HierarchyPathSelection pathSelection;

            if (_renameItem is HierarchyRootItem rootItem)
            {
                pathSelection = new HierarchyPathSelection(oldPath);
            }
            else
            {
                pathSelection = new HierarchyItemSelection(oldPath, oldName);
            }
        
            return NotifyRenameItem(pathSelection, name);
        }
        
        return Task.CompletedTask;
    }


    public bool IsSelected(HierarchyTreeItem item) => item == _selectedTreeItem;

    internal Task NotifyCreateRootItem(string? path) => OnCreateRootItem.InvokeAsync(new HierarchyPathSelection(path));

    internal Task NotifyRenameItem(HierarchyPathSelection pathSelection, string name)
    {
        _renameItem = null;
        return OnRenameItem.InvokeAsync((pathSelection, name));
    }
}