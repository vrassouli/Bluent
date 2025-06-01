using Bluent.UI.Charts.Interops;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class Chart : IChartJsHost, IAsyncDisposable
{
    private ChartJsInterop _interop = default!;
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    protected override void OnInitialized()
    {
        _interop = new ChartJsInterop(this, JsRuntime);

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

}
