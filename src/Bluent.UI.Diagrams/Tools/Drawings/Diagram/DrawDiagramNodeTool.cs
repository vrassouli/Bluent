using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public abstract class DrawDiagramNodeTool<TNode> : DiagramSinglePointerToolBase
    where TNode : DiagramNode, new()
{
    private TNode? _node;

    public override string Cursor => "crosshair";

    public string Text { get; }

    public DrawDiagramNodeTool(string text)
    {
        Text = text;
    }

    protected override void OnTargetPointerAvailable(PointerEventArgs e) { }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        var startPoint = Canvas.ScreenToDiagram(Pointers.First().ToOffsetPoint());

        var containers = Diagram.GetContainersAt(startPoint);
        var container = containers.FirstOrDefault();
        if (container is null)
            return;

        if (_node is null)
        {
            _node = new TNode
            {
                X = startPoint.X,
                Y = startPoint.Y,

                Text = Text
            };

            var cmd = new AddDiagramNodeCommand(container, _node);
            Canvas.ExecuteCommand(cmd);
        }

        var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var size = endPoint - startPoint;
        if (size.Dx < 0)
            _node.X = startPoint.X + size.Dx;

        if (size.Dy < 0)
            _node.Y = startPoint.Y + size.Dy;

        _node.Width = Math.Abs(size.Dx);
        _node.Height = Math.Abs(size.Dy);
    }

    protected override void OnTargetPointerUnavailable()
    {
        _node = null;
    }
}
