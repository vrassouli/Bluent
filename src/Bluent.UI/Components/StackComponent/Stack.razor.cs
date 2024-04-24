using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Stack
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Parameter] public StackAlignment HorizontalAlignment { get; set; } = StackAlignment.Start;
    [Parameter] public StackAlignment VerticalAlignment { get; set; } = StackAlignment.Start;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-stack";
        yield return "d-flex";

        if (Orientation == Orientation.Horizontal)
        {
            yield return "flex-row";
            yield return $"justify-content-{HorizontalAlignment}".ToString().Kebaberize();
            yield return $"align-items-{VerticalAlignment}".ToString().Kebaberize();
        }
        else
        {
            yield return "flex-column";
            yield return $"justify-content-{VerticalAlignment}".ToString().Kebaberize();
            yield return $"align-items-{HorizontalAlignment}".ToString().Kebaberize();
        }
    }
}
