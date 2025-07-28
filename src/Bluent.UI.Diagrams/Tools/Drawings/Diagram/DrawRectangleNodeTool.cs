using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public class DrawRectangleNodeTool : DiagramSinglePointerToolBase
{
    private RectangleNode? _node;

    public override string Cursor => "crosshair";

    protected override void OnTargetPointerAvailable(PointerEventArgs e)
    {

    }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        var startPoint = Canvas.ScreenToDiagram(Pointers.First().ToOffsetPoint());
        var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        if (_node is null)
        {
            _node = new RectangleNode
            {
                X = startPoint.X,
                Y = startPoint.Y
            };

            var cmd = new AddDiagramNodeCommand(Canvas, _node);
            Canvas.ExecuteCommand(cmd);
        }

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
