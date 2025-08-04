using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Elements.Diagram;

public class CircleNode : DiagramNodeBase, IHasIncomingConnector, IHasOutgoingConnector
{
    private List<IDiagramConnector> _incomingConnectors = new();
    private List<IDiagramConnector> _outgoingConnectors = new();

    public IEnumerable<IDiagramConnector> IncomingConnectors => _incomingConnectors;
    public IEnumerable<IDiagramConnector> OutgoingConnectors => _outgoingConnectors;

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

    public override void SetDrag(Distance2D drag)
    {
        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.DragStart(drag);
        }
        foreach (var incoming in IncomingConnectors)
        {
            incoming.DragEnd(drag);
        }
        base.SetDrag(drag);
    }

    public override void CancelDrag()
    {
        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.CancelStartDrag();
        }
        foreach (var incoming in IncomingConnectors)
        {
            incoming.CancelEndDrag();
        }
        base.CancelDrag();
    }

    public override void ApplyDrag()
    {
        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.ApplyStartDrag();
        }
        foreach (var incoming in IncomingConnectors)
        {
            incoming.ApplyEndDrag();
        }
        base.ApplyDrag();
    }

    public override void Clean()
    {
        foreach (var outgoing in OutgoingConnectors)
        {
            outgoing.Clean();
        }
        foreach (var incoming in IncomingConnectors)
        {
            incoming.Clean();
        }
        base.Clean();
    }

    public void AddIncomingConnector(IDiagramConnector connector)
    {
        _incomingConnectors.Add(connector);

        var point = StickToBoundary(connector.End);
        connector.End = point;
    }

    public void RemoveIncomingConnector(IDiagramConnector connector)
    {
        _incomingConnectors.Remove(connector);
    }
    
    public bool CanConnectIncoming<T>() where T: IDiagramConnector => CanConnectIncoming(typeof(T));
    
    public bool CanConnectIncoming(Type connectorType) => true;

    public void AddOutgoingConnector(IDiagramConnector connector)
    {
        _outgoingConnectors.Add(connector);

        var point = StickToBoundary(connector.Start);
        connector.Start = point;
    }

    public void RemoveOutgoingConnector(IDiagramConnector connector)
    {
        _outgoingConnectors.Remove(connector);
    }

    public bool CanConnectOutgoing<T>() where T: IDiagramConnector => CanConnectOutgoing(typeof(T));
    
    public bool CanConnectOutgoing(Type connectorType) => true;
}
