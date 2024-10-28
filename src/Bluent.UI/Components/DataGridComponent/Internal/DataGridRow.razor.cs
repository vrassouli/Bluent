using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DataGridComponent.Internal;

public partial class DataGridRow<TItem> where TItem : class
{
    [Parameter, EditorRequired] public IEnumerable<DataGridColumn<TItem>> Columns { get; set; } = default!;
    [Parameter] public TItem? Item { get; set; }
}
