using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;
using Microsoft.Extensions.Localization;

namespace Bluent.UI.Components;


public partial class DropdownList<TItem, TValue>
    where TItem : class
{
    private DropdownSelect<TValue>? _dropdown;
    private Virtualize<TItem>? _virtualizer;
    private string? _filter;
    private List<TItem> _selectedItems = new();


    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.BottomStart;
    [Parameter] public int MaxHeight { get; set; } = 180;
    [Parameter] public bool HideFilter { get; set; } = false;
    [Parameter] public bool HideClear { get; set; } = false;
    [Parameter] public string? FilterPlaceholder { get; set; }
    [Parameter] public TValue? Value { get; set; }
    [Parameter] public EventCallback<TValue?> ValueChanged { get; set; }
    [Parameter] public IEnumerable<TValue> Values { get; set; } = Enumerable.Empty<TValue>();
    [Parameter] public EventCallback<IEnumerable<TValue>> ValuesChanged { get; set; }
    [Parameter] public string EmptyDisplayText { get; set; } = default!;
    [Parameter] public float ItemSize { get; set; } = 50;
    [Parameter, EditorRequired] public Func<TItem, TValue?> ItemValue { get; set; } = _ => default;
    [Parameter, EditorRequired] public Func<TItem?, string> ItemText { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment<TItem> ItemContent { get; set; } = default!;
    [Parameter, EditorRequired] public FilteredItemsProviderDelegate<TItem> ItemsProvider { get; set; } = default!;
    [Parameter] public RenderFragment<PlaceholderContext>? Placeholder { get; set; }
    [Parameter] public RenderFragment? EmptyContent { get; set; }
    [Inject] private IStringLocalizer<DropdownListComponent.Resources.DropdownList> Localizer { get; set; } = default!;

    private IEnumerable<DropdownOption<TValue>> SelectedOptions => _selectedItems.Select(item => new DropdownOption<TValue>(ItemText(item), ItemValue(item)));
    private bool IsMultiSelect => ValuesChanged.HasDelegate;

    protected override void OnParametersSet()
    {
        if (string.IsNullOrEmpty(EmptyDisplayText))
            EmptyDisplayText = Localizer["Select..."];

        if (string.IsNullOrEmpty(FilterPlaceholder))
            FilterPlaceholder = Localizer["Search"];

        base.OnParametersSet();
    }

    private ValueTask<ItemsProviderResult<TItem>> ListItemsProvider(ItemsProviderRequest request)
        => ItemsProvider(new FilteredItemsProviderRequest(request.StartIndex, request.Count, _filter, request.CancellationToken));

    private bool IsSelected(TItem item)
    {
        return _selectedItems.Any(i => ItemValue(i)?.Equals(ItemValue(item)) ?? false);
        //if (Value is null)
        //    return false;

        //return Value.Equals(GetItemValue(item));
    }

    private async Task OnItemSelectionChanged(TItem item, bool selected)
    {
        if (selected && !IsSelected(item))
            await AddToSelections(item);
        else if (!selected && IsSelected(item))
            await RemoveFromSelections([item]);

        if (!IsMultiSelect)
            _dropdown?.Close();
    }

    private async Task AddToSelections(TItem item)
    {
        _selectedItems.Add(item);
        await InvokeChangeEvents();
    }

    private async Task RemoveFromSelections(IEnumerable<TItem> items)
    {
        foreach (var item in items)
            _selectedItems.Remove(item);

        await InvokeChangeEvents();
    }

    private async Task InvokeChangeEvents()
    {
        if (ValueChanged.HasDelegate)
        {
            var lastItem = _selectedItems.LastOrDefault();
            if (lastItem != null)
            {
                var lastItemValue = ItemValue(lastItem);
                await ValueChanged.InvokeAsync(lastItemValue);
            }
            else
            {
                await ValueChanged.InvokeAsync(default(TValue));
            }
        }

        if (ValuesChanged.HasDelegate)
        {
            var values = _selectedItems.Select(x => ItemValue(x))
                .Where(value => value != null);

            await ValuesChanged.InvokeAsync(values!);
        }
    }

    //private async Task OnSelectionChanged(TItem? selection)
    //{
    //    _selectedItem = selection;

    //    if (selection == null)
    //    {
    //        Value = default;
    //    }
    //    else
    //    {
    //        Value = GetItemValue(selection);
    //    }

    //    await ValueChanged.InvokeAsync(Value);

    //    _dropdown?.Close();
    //}

    private async Task OnFilterChanged(string? filter)
    {
        _filter = filter;
        if (_virtualizer != null)
        {
            await _virtualizer.RefreshDataAsync();
            _dropdown?.Refresh();
        }
    }

    private async Task OnClearFilter()
    {
        await OnFilterChanged(null);
    }

    private async Task OnClearSelection(TValue? value)
    {
        var items = _selectedItems.Where(x => ItemValue(x)?.Equals(value) == true).ToList();

        await RemoveFromSelections(items);
    }
}
