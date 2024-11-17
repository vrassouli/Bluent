using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class ProgressBar
{
    /// <summary>
    /// Progress bar value in percentage.
    /// Minimum value is 0, and the maximum value is 100.
    /// </summary>
    [Parameter] public float Value { get; set; }

    [Parameter] public string? Message { get; set; }

    [Parameter] public string? Icon { get; set; }

    [Parameter] public ProgressBarColor Color { get; set; } = ProgressBarColor.Brand;
    [Parameter] public ProgressBarSize Size { get; set; } = ProgressBarSize.Small;
    [Parameter] public bool Indeterminate { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-progress-bar";

        if (Indeterminate)
            yield return "indeterminate";

        if (Color != ProgressBarColor.Brand)
            yield return Color.ToString().Kebaberize();

        if (Size != ProgressBarSize.Small)
            yield return Size.ToString().Kebaberize();
    }

    private string? GetBarStyles()
    {
        if (!Indeterminate)
            return $"width: {Math.Max(0, Math.Min(Value, 100))}%";

        return null;
    }
}
