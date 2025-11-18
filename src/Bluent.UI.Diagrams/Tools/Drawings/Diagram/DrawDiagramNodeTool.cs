using Bluent.UI.Diagrams.Commands.Diagram;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;
using System.Xml.Linq;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public abstract class DrawDiagramNodeTool<TNode> : DiagramSinglePointerToolBase
    where TNode : DiagramNodeBase, new()
{
    private const string _defaultCursor = "crosshair";
    private TNode? _node;

    public string Text { get; }

    public DrawDiagramNodeTool(string text)
    {
        Text = text;
        Cursor = _defaultCursor;
    }

    protected override void OnTargetPointerAvailable(PointerEventArgs e) { }
    protected override void OnTargetPointerUp(PointerEventArgs e) { }

    protected override void OnPointerMove(PointerEventArgs e)
    {
        if (_node is null)
        {
            var point = Canvas.ScreenToDiagram(e.ToOffsetPoint());

            var elements = Diagram.GetElementsAt(point);
            var container = elements.FirstOrDefault() as IDiagramContainer;

            if (container is null || !container.CanContain<TNode>())
                Cursor = "not-allowed";
            else
                Cursor = _defaultCursor;
        }

        base.OnPointerMove(e);
    }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {

        if (_node is null)
        {
            var startPoint = Canvas.ScreenToDiagram(Pointers.First().ToOffsetPoint());

            var elements = Diagram.GetElementsAt(startPoint);
            var container = elements.FirstOrDefault() as IDiagramContainer;

            if (container is null || !container.CanContain<TNode>())
            {
                return;
            }

            _node = new TNode
            {
                X = startPoint.X,
                Y = startPoint.Y,

                Text = Text
            };
            var cmd = new AddDiagramElementCommand(container, _node);
            Canvas.ExecuteCommand(cmd);
        }

        var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var width = endPoint.X - _node.X;
        var height = endPoint.Y - _node.Y;

        if (width < 0)
            _node.X += width;

        if (height < 0)
            _node.Y += height;

        _node.Width = Math.Abs(width);
        _node.Height = Math.Abs(height);
    }

    protected override void OnTargetPointerUnavailable()
    {
        _node = null;
    }
}
