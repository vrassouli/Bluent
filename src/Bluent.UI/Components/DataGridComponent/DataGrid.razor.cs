using Bluent.UI.Components.DataGridComponent;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace Bluent.UI.Components;

public partial class DataGrid<TItem>
    where TItem : class
{
    private readonly List<DataGridColumn<TItem>> _columns = new();
    [Parameter] public ItemsProviderDelegate<TItem>? ItemsProvider { get; set; }
    [Parameter] public RenderFragment? Columns { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-data-grid";

        //if (IsActive)
        //    yield return "active";

        //if (Selected)
        //    yield return "selected";

        //if (Orientation != CardOrientation.Vertical)
        //    yield return Orientation.ToString().Kebaberize();

        //if (Size != CardSize.Medium)
        //    yield return Size.ToString().Kebaberize();

        //if (Appearance != CardAppearance.Filled)
        //    yield return Appearance.ToString().Kebaberize();
    }

    internal void AddColumn(DataGridColumn<TItem> column)
    {
        _columns.Add(column);
        StateHasChanged();
    }

    internal void RemoveColumn(DataGridColumn<TItem> column)
    {
        _columns.Remove(column);
        StateHasChanged();
    }
}
