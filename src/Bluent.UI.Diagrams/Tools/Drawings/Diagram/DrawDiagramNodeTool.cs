using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public abstract class DrawDiagramNodeTool<TNode> : DiagramSinglePointerToolBase
    where TNode : DiagramNodeBase, new()
{
    private TNode? _node;

    public string Text { get; }

    public DrawDiagramNodeTool(string text)
    {
        Text = text;
        Cursor = "crosshair";
    }

    protected override void OnTargetPointerAvailable(PointerEventArgs e) { }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        var startPoint = Canvas.ScreenToDiagram(Pointers.First().ToOffsetPoint());

        var containers = Diagram.GetContainersAt(startPoint);

        if (_node is null)
        {
            _node = new TNode
            {
                X = startPoint.X,
                Y = startPoint.Y,

                Text = Text
            };

            var container = containers.FirstOrDefault(x => x.CanContain(_node));
            if (container is null)
            {
#if DEBUG
                //throw new InvalidOperationException("Could not find any container to add the Node.");
#endif
                //Cursor = "";
                return;
            }

            var cmd = new AddDiagramElementCommand(container, _node);
            Canvas.ExecuteCommand(cmd);
        }

        var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var width = endPoint.X - _node.X;
        var height = endPoint.Y - _node.Y;

        var dragX = 0d;
        var dragY = 0d;
        if (width < 0)
            dragX = startPoint.X + width;

        if (height < 0)
            dragY = startPoint.Y + height;

        var deltaW = Math.Abs(width) - _node.Width;
        var deltaH = Math.Abs(height) - _node.Height;

        _node.SetDrag(new Elements.Distance2D(dragX, dragY));
        _node.ResizeRight(deltaW);
        _node.ResizeBottom(deltaH);
        _node.ApplyDrag();
        _node.ApplyResize();
    }

    protected override void OnTargetPointerUnavailable()
    {
        _node = null;
    }
}
