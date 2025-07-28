using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public class RectangleNode : DiagramNode
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
            int seq = 0;
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
        };
    }
}
