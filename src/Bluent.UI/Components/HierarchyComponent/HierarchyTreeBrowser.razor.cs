using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public delegate ValueTask<List<HierarchyItem>> ReadHierarchyItemsDelegate(string? path);

public partial class HierarchyTreeBrowser
{
    private List<HierarchyItem>? _items;
    private readonly List<HierarchyTreeItem> _treeItems = new ();

    [Parameter] public string? RootItemIcon { get; set; } = "icon-ic_fluent_folder_20_regular";
    [Parameter] public string? RootItemExpandedIcon { get; set; } = "icon-ic_fluent_folder_open_20_regular";
    [Parameter] public string? ItemIcon { get; set; } = "icon-ic_fluent_document_20_regular";
    [Parameter] public bool RootOnly { get; set; }

    [Parameter] public EventCallback<HierarchyPathSelection> OnPathSelected { get; set; }
    [Parameter] public EventCallback<HierarchyItemSelection> OnItemSelected { get; set; }
    
    [Parameter, EditorRequired]
    public ReadHierarchyItemsDelegate GetHierarchyItems { get; set; }
        = _ => new ValueTask<List<HierarchyItem>>(new List<HierarchyItem>());

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

    public Task OnItemClicked(HierarchyTreeItem treeItem)
    {
        if (treeItem.Item is HierarchyRootItem)
        {
            return OnPathSelected.InvokeAsync(new HierarchyPathSelection(treeItem.Path));
        }

        return OnItemSelected.InvokeAsync(new HierarchyItemSelection(treeItem.Path, treeItem.Item.Name));
    }

    public void AddItem(HierarchyTreeItem item)
    {
        _treeItems.Add(item);
    }

    public void RemoveItem(HierarchyTreeItem item)
    {
        _treeItems.Remove(item);
    }
}