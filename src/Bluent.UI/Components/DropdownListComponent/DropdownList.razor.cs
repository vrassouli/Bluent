using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;
using Microsoft.Extensions.Localization;

namespace Bluent.UI.Components;

public partial class DropdownList<TItem, TValue>
    where TItem : class
{
    private TValue? _value;
    private DropdownSelect<TValue>? _dropdown;
    private Virtualize<TItem>? _virtualizer;
    private string? _filter;
    private readonly List<TItem> _selectedItems = new();


    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.BottomStart;
    [Parameter] public int MaxHeight { get; set; } = 180;
    [Parameter] public bool HideFilter { get; set; }
    [Parameter] public bool HideClear { get; set; }
    [Parameter] public string? FilterPlaceholder { get; set; }
    [Parameter] public TValue? Value { get; set; }
    [Parameter] public EventCallback<TValue?> ValueChanged { get; set; }
    [Parameter] public EventCallback<TItem> SelectedItemChanged { get; set; }
    [Parameter] public EventCallback<IEnumerable<TItem>> SelectedItemsChanged { get; set; }
    [Parameter] public IEnumerable<TValue> Values { get; set; } = [];
    [Parameter] public EventCallback<IEnumerable<TValue>> ValuesChanged { get; set; }
    [Parameter] public string EmptyDisplayText { get; set; } = default!;
    [Parameter] public float ItemSize { get; set; } = 50;
    [Parameter, EditorRequired] public Func<TItem, TValue?> ItemValue { get; set; } = _ => default;
    [Parameter, EditorRequired] public Func<TItem?, string> ItemText { get; set; } = default!;
    [Parameter] public RenderFragment<TItem>? ItemContent { get; set; }
    [Parameter, EditorRequired] public FilteredItemsProviderDelegate<TItem> ItemsProvider { get; set; } = default!;
    [Parameter, EditorRequired] public Func<TValue, TItem>? ItemProvider { get; set; }
    [Parameter] public RenderFragment<PlaceholderContext>? Placeholder { get; set; }
    [Parameter] public RenderFragment? EmptyContent { get; set; }
    [Inject] private IStringLocalizer<DropdownListComponent.Resources.DropdownList> Localizer { get; set; } = default!;

    private RenderFragment<TItem> ItemContentTemplate => ItemContent ?? GetDefaultItemTemplate();

    private RenderFragment<TItem> GetDefaultItemTemplate()
    {
        return item => builder =>
        {
            builder.OpenElement(0, "div");
            builder.AddContent(1, ItemText(item));
            builder.CloseElement();
        };
    }

    private IEnumerable<DropdownOption<TValue>> SelectedOptions
    {
        get
        {
            var defaultValue = default(TValue);

            if (!_selectedItems.Any() && Value is not null && !Value.Equals(defaultValue))
            {
                return [new DropdownOption<TValue>(ItemText(null), Value)];
            }

            return _selectedItems.Select(item => new DropdownOption<TValue>(ItemText(item), ItemValue(item)));
        }
    }

    private bool IsMultiSelect => ValuesChanged.HasDelegate;

    protected override void OnParametersSet()
    {
        if (string.IsNullOrEmpty(EmptyDisplayText))
            EmptyDisplayText = Localizer["Select..."];

        if (string.IsNullOrEmpty(FilterPlaceholder))
            FilterPlaceholder = Localizer["Search"];

        base.OnParametersSet();
    }

    protected override async Task OnParametersSetAsync()
    {
        if (!Equals(_value, Value))
        {
            _value = Value;
            await OnValueChanged();
        }

        await base.OnParametersSetAsync();
    }

    private async Task OnValueChanged()
    {
        if (!ValueChanged.HasDelegate)
            return;

        // User has used @bind-Value on the component
        // So he is intending to use it in single-select mode
        // If value is changed from outside the component, we should try to resolve the selection
        if (Value is null)
            await ClearSelection();
        else
        {
            var item = ItemProvider?.Invoke(Value);
            if (item != null)
                await AddToSelections(item);
        }
    }

    private ValueTask<ItemsProviderResult<TItem>> ListItemsProvider(ItemsProviderRequest request)
        => ItemsProvider(new FilteredItemsProviderRequest(request.StartIndex, request.Count, _filter,
            request.CancellationToken));

    private bool IsSelected(TItem item)
    {
        return _selectedItems.Any(i => ItemValue(i)?.Equals(ItemValue(item)) ?? false);
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
        if (!IsMultiSelect)
            _selectedItems.Clear();

        if (!IsSelected(item))
        {
            _selectedItems.Add(item);
            await InvokeChangeEvents();
        }
    }

    private async Task RemoveFromSelections(IEnumerable<TItem> items)
    {
        foreach (var item in items)
            _selectedItems.Remove(item);

        await InvokeChangeEvents();
    }

    private async Task ClearSelection()
    {
        _selectedItems.Clear();

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
                _value = Value = lastItemValue; // prevent OnValueChanged, when Value is set from inside the component
                await ValueChanged.InvokeAsync(lastItemValue);
            }
            else
            {
                _value = Value = default; // prevent OnValueChanged, when Value is set from inside the component
                await ValueChanged.InvokeAsync(default(TValue));
            }
        }

        if (ValuesChanged.HasDelegate)
        {
            var values = _selectedItems.Select(x => ItemValue(x))
                .Where(value => value != null);

            await ValuesChanged.InvokeAsync(values!);
        }

        await SelectedItemChanged.InvokeAsync(_selectedItems.LastOrDefault());
        await SelectedItemsChanged.InvokeAsync(_selectedItems);
    }

    private async Task OnFilterChanged(string? filter)
    {
        _filter = filter;
        await ReloadAsync();
    }

    private async Task ReloadAsync()
    {
        if (_virtualizer != null)
        {
            await _virtualizer.RefreshDataAsync();
            Refresh();
        }
    }

    private void Refresh()
    {
        _dropdown?.Refresh();
    }

    private async Task OnClearFilter()
    {
        await OnFilterChanged(null);
    }

    private async Task OnClearSelection(TValue? value)
    {
        var items = _selectedItems.Where(x => ItemValue(x)?.Equals(value) == true).ToList();

        await RemoveFromSelections(items);
        Refresh();
    }
}