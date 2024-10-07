using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DataGridComponent.Internal;

public partial class DataGridCell<TItem> where TItem : class
{
    [Parameter, EditorRequired] public DataGridColumn<TItem> Column { get; set; } = default!;
    [Parameter] public TItem? Item { get; set; }

    private string? GetContent()
    {
        if(Item is null)
            return Column.GetHeader();

        return Column.GetData(Item)?.ToString();
    }

    private string GetStyle() => Column.GetStyle();
    private string GetClass() => string.Join(' ', Column.GetClasses(Item));
    private string GetContentClass()
    {
        return string.Join(' ', ["content", Column.Wrap ? null : "text-truncate"]);
    }
}
