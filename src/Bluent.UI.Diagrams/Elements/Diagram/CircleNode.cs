using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public class CircleNode : DiagramNodeBase
{
    public CircleNode()
    {
        Fill = "var(--colorNeutralBackground1)";
        Stroke = "var(--colorNeutralStroke1)";
        StrokeWidth = 2;
    }

    public override RenderFragment Render()
    {
        return builder =>
        {
            int seq = 0;
            builder.OpenElement(seq++, "ellipse");

            builder.AddAttribute(seq++, "fill", Fill);
            builder.AddAttribute(seq++, "stroke", Stroke);
            builder.AddAttribute(seq++, "stroke-width", StrokeWidth);
            builder.AddAttribute(seq++, "stroke-dasharray", StrokeDashArray);

            builder.AddAttribute(seq++, "cx", X + Width / 2);
            builder.AddAttribute(seq++, "cy", Y + Height / 2);
            builder.AddAttribute(seq++, "rx", Width / 2);
            builder.AddAttribute(seq++, "ry", Height / 2);

            builder.CloseElement();

            if (!string.IsNullOrEmpty(Text))
            {
                builder.OpenElement(seq++, "text");

                builder.AddAttribute(seq++, "x", X + Width / 2);
                builder.AddAttribute(seq++, "y", Y + Height / 2);
                builder.AddAttribute(seq++, "fill", "var(--colorNeutralForeground1)");
                builder.AddAttribute(seq++, "text-anchor", "middle");
                builder.AddAttribute(seq++, "dominant-baseline", "middle");
                builder.AddAttribute(seq++, "style", "user-select: none");

                builder.AddContent(seq++, Text);

                builder.CloseElement();
            }
        };
    }
}
