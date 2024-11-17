using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Stack
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Parameter] public StackAlignment HorizontalAlignment { get; set; } = StackAlignment.Stretch;
    [Parameter] public StackAlignment VerticalAlignment { get; set; } = StackAlignment.Stretch;
    [Parameter] public bool Fill { get; set; }
    [Parameter] public bool Wrap { get; set; }
    [Parameter] public bool Reverse { get; set; }
    [Parameter] public StackOverflow Overflow { get; set; } = StackOverflow.Default;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-stack";
        yield return "d-flex";

        if (Orientation == Orientation.Horizontal)
        {
            if (Reverse)
                yield return "flex-row-reverse";
            //yield return "flex-row";
            if (HorizontalAlignment != StackAlignment.Stretch)
                yield return $"justify-content-{HorizontalAlignment.ToString().ToLowerInvariant()}";

            if (VerticalAlignment != StackAlignment.Stretch)
                yield return $"align-items-{VerticalAlignment.ToString().ToLowerInvariant()}";
        }
        else
        {
            if (Reverse)
                yield return "flex-column-reverse";
            else
                yield return "flex-column";

            if (VerticalAlignment != StackAlignment.Stretch)
                yield return $"justify-content-{VerticalAlignment.ToString().ToLowerInvariant()}";
            if (HorizontalAlignment != StackAlignment.Stretch)
                yield return $"align-items-{HorizontalAlignment.ToString().ToLowerInvariant()}";
        }

        if (Fill)
            yield return "flex-fill";

        if (Wrap)
            yield return "flex-wrap";

        if (Overflow != StackOverflow.Default)
            yield return $"overflow-{Overflow.ToString().ToLowerInvariant()}";
    }
}
