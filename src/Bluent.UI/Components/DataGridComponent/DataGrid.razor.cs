using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web.Virtualization;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class DataGrid<TItem> : IDataGridEventHandler, IAsyncDisposable
    where TItem : class
{
    private readonly List<DataGridColumn<TItem>> _columns = new();
    private DataGridInterop? _interop;

    [Parameter] public ItemsProviderDelegate<TItem>? ItemsProvider { get; set; }
    [Parameter] public RenderFragment? Columns { get; set; }
    [Parameter] public int RowSize { get; set; } = 32;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    protected override void OnInitialized()
    {
        _interop = new DataGridInterop(this, JsRuntime);
        base.OnInitialized();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && _interop != null)
        {
            await _interop.Initialize();
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public async ValueTask DisposeAsync()
    {
        if (_interop != null)
            await _interop.DisposeAsync();
    }

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
