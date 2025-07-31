using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public class RectangleNode : DiagramBoundaryContainerNodeBase
{
    private double _raduis;

    public double Raduis
    {
        get => _raduis;
        set
        {
            if (_raduis != value)
            {
                _raduis = value;
                NotifyPropertyChanged();
            }
        }
    }

    public RectangleNode()
    {
        Fill = "var(--colorNeutralBackground1)";
        Stroke = "var(--colorNeutralStroke1)";
        StrokeWidth = 2;
        Raduis = 10;
    }

    public override RenderFragment Render()
    {
        return builder =>
        {
            RenderRect(1, builder);
            RenderText(2, builder);
            RenderChildElements(4, builder);
        };
    }

    private void RenderText(int regionSeq, RenderTreeBuilder builder)
    {
        int seq = 0;

        if (!string.IsNullOrEmpty(Text))
        {
            builder.OpenRegion(regionSeq);
            builder.OpenElement(seq++, "text");

            builder.AddAttribute(seq++, "x", X + Width / 2);
            builder.AddAttribute(seq++, "y", Y + Height / 2);
            builder.AddAttribute(seq++, "fill", "var(--colorNeutralForeground1)");
            builder.AddAttribute(seq++, "text-anchor", "middle");
            builder.AddAttribute(seq++, "dominant-baseline", "middle");
            builder.AddAttribute(seq++, "style", "user-select: none");

            builder.AddContent(seq++, Text);

            builder.CloseElement();
            builder.CloseRegion();
        }
    }

    private void RenderRect(int regionSeq, RenderTreeBuilder builder)
    {
        int seq = 0;

        builder.OpenRegion(regionSeq);

        builder.OpenElement(seq++, "rect");
        builder.AddAttribute(seq++, "fill", Fill);
        builder.AddAttribute(seq++, "stroke", Stroke);
        builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
        builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);

        builder.AddAttribute(seq++, "x", X);
        builder.AddAttribute(seq++, "y", Y);
        builder.AddAttribute(seq++, "width", Width);
        builder.AddAttribute(seq++, "height", Height);

        builder.AddAttribute(seq++, "rx", Raduis);
        builder.AddAttribute(seq++, "ry", Raduis);
        builder.CloseElement();

        builder.CloseRegion();
    }
}
