using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
    [Parameter] public bool Indeterminate { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-progress-bar";

        if (Indeterminate)
            yield return "indeterminate";

        if (Color != ProgressBarColor.Brand)
            yield return Color.ToString().Kebaberize();
    }

    private string? GetBarStyles()
    {
        if (!Indeterminate)
            return $"width: {Math.Max(0, Math.Min(Value, 100))}%";

        return null;
    }
}
