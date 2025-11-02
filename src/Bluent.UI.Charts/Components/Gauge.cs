using System.Globalization;
using Bluent.Core;
using Bluent.UI.Charts.Interops;
using Bluent.UI.Charts.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.JSInterop;

namespace Bluent.UI.Charts.Components;

public class Gauge : BluentComponentBase, IGaugeHost, IAsyncDisposable
{
    private bool _isGaugeInitialized;
    
    private double? _value;
    private GaugeInterop _interop = default!;

    [Parameter]
    public Func<double, Task<string>> FormatValue { get; set; } = value => Task.FromResult(value.ToString(CultureInfo.CurrentCulture));

    [Parameter] public int StartAngle { get; set; } = 135;
    [Parameter] public int EndAngle { get; set; } = 45;
    [Parameter] public int Radius { get; set; } = 40;
    [Parameter] public double Min { get; set; }
    [Parameter] public double Max { get; set; } = 100;
    [Parameter] public bool HideValue { get; set; }
    [Parameter] public string? GaugeClass { get; set; }
    [Parameter] public string? DialClass { get; set; }
    [Parameter] public string? ValueDialClass { get; set; }
    [Parameter] public string? ValueClass { get; set; }
    [Parameter] public string? ViewBox { get; set; }
    [Parameter] public Dictionary<double, string>? Colors { get; set; }
    
    [Parameter] public double Value { get; set; }
    [Parameter] public bool DisableAnimation { get; set; }
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    protected override void OnInitialized()
    {
        _interop = new GaugeInterop(this, JsRuntime);

        base.OnInitialized();
    }

    protected override async Task OnParametersSetAsync()
    {
        if (_isGaugeInitialized && _value != Value)
        {
            _value = Value;
            await UpdateAsync();
        }

        await base.OnParametersSetAsync();
    }

    private async Task UpdateAsync()
    {
        await _interop.SetValueAsync(Value, !DisableAnimation);
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        var seq = -1;

        builder.OpenElement(++seq, "div");
        builder.AddMultipleAttributes(++seq, AdditionalAttributes);
        builder.AddAttribute(++seq, "id", Id);
        builder.AddAttribute(++seq, "class", GetComponentClass());
        builder.AddAttribute(++seq, "style", Style);
        builder.CloseElement();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            _isGaugeInitialized = true;
            
            await _interop.InitializeAsync(new GuageConfig
            {
                StartAngle = StartAngle,
                EndAngle = EndAngle,
                Radius = Radius,
                Min = Min,
                Max = Max,
                ShowValue = !HideValue,
                GaugeClass = GaugeClass,
                DialClass = DialClass,
                ValueDialClass = ValueDialClass,
                ValueClass = ValueClass,
                ViewBox = ViewBox,
                Colors = Colors
            });
            await _interop.SetValueAsync(Value, !DisableAnimation);
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public async ValueTask DisposeAsync()
    {
        await _interop.DisposeAsync();
    }

    [JSInvokable]
    public Task<string> GetLabelAsync(double value)
    {
        return FormatValue?.Invoke(value) ?? Task.FromResult(string.Empty);
    }
}