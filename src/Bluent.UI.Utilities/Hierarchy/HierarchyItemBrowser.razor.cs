using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public partial class HierarchyItemBrowser
{
    private List<HierarchyItem>? _items;
    private HierarchyItemSelection? _selectionResult;
    private string? _selectedPath;
    private readonly Stack<string> _backStack = new();
    private readonly Stack<string> _forwardStack = new();
    private HierarchyRootItem? _newItem;
    private HierarchyItem? _renameItem;
    private int _selectedSegmentIndex;
    private HierarchyTreeBrowser? _tree;

    [Parameter] public string EmptyMessage { get; set; } = "Nothing to display.";
    [Parameter] public string LabelTitle { get; set; } = "Item:";
    [Parameter] public string SelectButtonTitle { get; set; } = "Select";
    [Parameter] public string CancelButtonTitle { get; set; } = "Cancel";
    [Parameter] public string CreateButtonTitle { get; set; } = "New";
    [Parameter] public string RootTitle { get; set; } = "Root";
    [Parameter] public string? RootItemIcon { get; set; } = "icon-ic_fluent_folder_20_regular";
    [Parameter] public string? RootItemExpandedIcon { get; set; } = "icon-ic_fluent_folder_open_20_regular";
    [Parameter] public string? ItemIcon { get; set; } = "icon-ic_fluent_document_20_regular";
    [Parameter] public bool HideCancel { get; set; }
    [Parameter] public bool MustExist { get; set; }
    [Parameter] public string? DefaultFileName { get; set; }

    [Parameter] public EventCallback<HierarchyItemSelection> OnSelect { get; set; }
    [Parameter] public EventCallback OnCancel { get; set; }
    [Parameter] public EventCallback<HierarchyPathSelection> OnCreateRootItem { get; set; }
    [Parameter] public EventCallback<(HierarchyPathSelection item, string name)> OnRenameItem { get; set; }
    [Parameter] public EventCallback<HierarchyPathSelection> OnDeleteItem { get; set; }

    [Parameter, EditorRequired]
    public ReadHierarchyItemsDelegate GetHierarchyItems { get; set; }
        = _ => new ValueTask<List<HierarchyItem>>(new List<HierarchyItem>());

    [CascadingParameter] public Dialog? Dialog { get; set; }

    private string? SelectedItemName => _selectionResult?.Name;

    private bool CanSelect
    {
        get
        {
            if (_selectionResult is null)
                return false;

            var fileName = _selectionResult.Name;

            // File open mode...
            if (MustExist && _items is not null && _items.Any(x => x.Name == fileName))
                return true;

            // File create mode...
            if (!MustExist && _items is not null && _items.All(x => x.Name.CompareTo(fileName, StringComparison.OrdinalIgnoreCase) != 0))
                return true;

            return false;
        }
    }

    private bool CanGoBack => _backStack.Count > 0;
    private bool CanGoForward => _forwardStack.Count > 0;
    private bool CanGoUp => PathSegments.Count > 1;

    private IList<string> PathSegments
    {
        get
        {
            if (_backStack.Count == 0)
                return [RootTitle];

            var current = _backStack.Peek();
            return [RootTitle, ..current.Split('/', '\\')];
        }
    }

    private IEnumerable<HierarchyItem>? FilteredItems => _items?
        .OrderBy(x => x is not HierarchyRootItem)
        .ThenBy(x => x.Name);

    protected override async Task OnInitializedAsync()
    {
        if (!string.IsNullOrEmpty(DefaultFileName))
            _selectionResult = new HierarchyItemSelection(null, DefaultFileName);

        await LoadPathAsync();

        await base.OnInitializedAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "d-flex flex-column gap-3";
    }

    public async Task RefreshAsync()
    {
        _items = await GetHierarchyItems.Invoke(_selectedPath);

        if (_tree != null)
            await _tree.RefreshAsync();
    }
    
    private async Task OpenPathAsync(HierarchyPathSelection selectedPath)
    {
        await ChoosePathAsync(selectedPath.Path);
    }

    private async Task LoadPathAsync(string? path = null)
    {
        if (!string.IsNullOrEmpty(path))
        {
            if (!_backStack.TryPeek(out var peakedItem) || peakedItem != path)
            {
                _backStack.Push(path);
            }
        }

        _selectedPath = path;
        await RefreshAsync();
    }

    private string? GetIcon(HierarchyItem item)
    {
        if (item is HierarchyRootItem)
            return RootItemIcon;

        return ItemIcon;
    }

    private async Task OnGoBack()
    {
        var current = _backStack.Pop();
        _forwardStack.Push(current);

        await LoadPathAsync(_backStack.Count == 0 ? null : _backStack.Peek());
    }

    private async Task OnGoForward()
    {
        if (_forwardStack.Count == 0)
            return;

        var next = _forwardStack.Pop();

        await LoadPathAsync(next);
    }

    private void OnGoUp()
    {
        GoToUpperSegment(PathSegments.Count-2);
    }
    
    private void OnItemNameChanged(string? name)
    {
        if (name is null && _selectionResult is not null)
            _selectionResult = null;
        else if (name is not null && name != _selectionResult?.Name)
            _selectionResult = new HierarchyItemSelection(_selectedPath, name);
    }

    private async Task HandleCancelClick()
    {
        if (OnCancel.HasDelegate)
            await OnCancel.InvokeAsync();
        else
            Dialog?.Close();
    }

    private async Task HandleSelectClick()
    {
        await SelectItem();
    }

    private async Task SelectItem()
    {
        if (_selectionResult is null)
            return;

        _selectionResult = new HierarchyItemSelection(_selectedPath, _selectionResult.Name);
        if (OnSelect.HasDelegate)
            await OnSelect.InvokeAsync(_selectionResult);
        else
            Dialog?.Close(_selectionResult);
    }

    private bool IsSelected(HierarchyItem item)
    {
        if (item is HierarchyRootItem)
            return false;

        return item.Name == _selectionResult?.Name;
    }

    private void ItemSelectionChanged(HierarchyItem item, bool selected)
    {
        if (item is not HierarchyRootItem && selected)
            ChooseItem(item);
        else
            _selectionResult = null;
    }

    private void ChooseItem(HierarchyItem item)
    {
        _selectionResult = new HierarchyItemSelection(_selectedPath, item.Name);
    }

    private async Task ChoosePathAsync(string? path)
    {
        _forwardStack.Clear();
        await LoadPathAsync(path);
    }

    private async Task HandleItemDoubleClick(HierarchyItem item)
    {
        if (_newItem == item || _renameItem == item)
            return;

        if (item is HierarchyRootItem rootItem)
        {
            if (string.IsNullOrEmpty(_selectedPath))
                await ChoosePathAsync(rootItem.Name);
            else
                await ChoosePathAsync(Path.Combine(_selectedPath, rootItem.Name));
        }
        else
        {
            ChooseItem(item);
            await SelectItem();
        }
    }

    private void CreateNewRootItem()
    {
        if (_items is not null)
        {
            var newRoot = new HierarchyRootItem("New Item");

            _items.Add(newRoot);
            _newItem = newRoot;
        }
    }

    private async Task OnNewItemRenamed(string? name)
    {
        if (_newItem is null || name is null)
            return;

        _newItem.Name = name;

        var path = name;
        if (!string.IsNullOrEmpty(_selectedPath))
            path = Path.Combine(_selectedPath, name);

        var pathSelection = new HierarchyPathSelection(path);
        await OnCreateRootItem.InvokeAsync(pathSelection);
        _newItem = null;
    }

    private void Rename(HierarchyItem item)
    {
        _renameItem = item;
    }

    private async Task Delete(HierarchyItem item)
    {
        _renameItem = item;
        
        HierarchyPathSelection pathSelection;

        if (_renameItem is HierarchyRootItem rootItem)
        {
            var path = rootItem.Name;
            if (!string.IsNullOrEmpty(_selectedPath))
                path = Path.Combine(_selectedPath, rootItem.Name);
            
            pathSelection = new HierarchyPathSelection(path);
        }
        else
        {
            pathSelection = new HierarchyItemSelection(_selectedPath, _renameItem.Name);
        }
        
        await OnDeleteItem.InvokeAsync(pathSelection);
    }

    private async Task OnItemRenamed(string? name)
    {
        if (_renameItem is null || name is null)
            return;

        HierarchyPathSelection pathSelection;

        if (_renameItem is HierarchyRootItem rootItem)
        {
            var path = rootItem.Name;
            if (!string.IsNullOrEmpty(_selectedPath))
                path = Path.Combine(_selectedPath, rootItem.Name);
            
            pathSelection = new HierarchyPathSelection(path);
        }
        else
        {
            pathSelection = new HierarchyItemSelection(_selectedPath, _renameItem.Name);
        }
        
        await OnRenameItem.InvokeAsync((pathSelection, name));
        _renameItem = null;

        await RefreshAsync();
    }

    private Task SelectedSegmentChanged(int index)
    {
        return GoToUpperSegment(index);
    }

    private Task GoToUpperSegment(int index)
    {
        _selectedSegmentIndex = index;
        
        if (index == 0)
            return ChoosePathAsync(null);

        var path = string.Join('/', PathSegments.Skip(1).Take(index));

        return ChoosePathAsync(path);
    }
}