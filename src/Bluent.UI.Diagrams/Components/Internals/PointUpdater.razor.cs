using Bluent.UI.Diagrams.Elements.Abstractions;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class PointUpdater
{
    [Parameter] public string Stroke { get; set; } = "#36a2eb";
    [Parameter] public double StrokeWidth { get; set; } = 1;
    [Parameter] public string Fill { get; set; } = "#61bffb";
    [Parameter] public double Size { get; set; } = 4;
    [Parameter] public UpdatablePoint UpdatablePoint { get; set; } = default!;
    [Parameter] public EventCallback<PointerEventArgs> PointerDown { get; set; }

    private string Cursor => "move";

    private async Task HandlePointerDown(PointerEventArgs e)
    {
        await PointerDown.InvokeAsync(e);
    }
}
