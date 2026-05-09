using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class TileLayout
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public string CellMinWidth { get; set; } = "300px";
    [Parameter] public string CellGap { get; set; } = "1rem";

    public override IEnumerable<string> GetClasses()
    {
        return [..base.GetClasses(), "bui-tile-layout"];
    }

    protected override IEnumerable<(string key, string value)> GetStyles()
    {
        return
        [
            ..base.GetStyles(),
            ("--tile-cell-width", CellMinWidth),
            ("--tile-cell-gap", CellGap)
        ];
    }
}