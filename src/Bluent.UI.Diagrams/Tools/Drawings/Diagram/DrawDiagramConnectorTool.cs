using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public class DrawDiagramConnectorTool : DiagramSinglePointerToolBase
{
    private const string DefaultCursor = "crosshair";
    private IHasOutgoingConnector? _sourceElement;
    private IDiagramContainer? _sourceElementContainer;
    private DiagramConnector? _connector;

    public DrawDiagramConnectorTool()
    {
        Cursor = DefaultCursor;
    }

    protected override void OnTargetPointerAvailable(PointerEventArgs e) { }

    protected override void OnPointerMove(PointerEventArgs e)
    {
        //var point = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        //var elements = Diagram.GetDiagramElementsAt(point);
        //var container = elements.FirstOrDefault() as IDiagramContainer;

        //if (container is null || !container.CanContain<TNode>())
        //    Cursor = "not-allowed";
        //else
        //    Cursor = DefaultCursor;

        if (_connector is not null)
        {
            var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());
            _connector.End = endPoint;

            ConnectorRouter.RouteConnector(_connector, gridSize: Diagram.SnapSize);
        }

        base.OnPointerMove(e);
    }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        var point = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var nodesAtPoint = Diagram.GetDiagramElementsAt(point).OfType<IDiagramNode>();
        var pointingElement = nodesAtPoint.FirstOrDefault();

        if (pointingElement is null)
            return;

        var pointingElementContainer = Diagram
            .GetDiagramElementsAt(new DiagramPoint(pointingElement.Boundary.Cx, pointingElement.Boundary.Cy))
            .OfType<IDiagramContainer>()
            .FirstOrDefault(x => x != pointingElement && x.CanContain<DiagramConnector>());

        if (pointingElementContainer is null)
            return;

        if (_connector is null)
        {
            if (pointingElement is not IHasOutgoingConnector sourceElement || !sourceElement.CanConnectOutgoing<DiagramConnector>())
                return;

            _sourceElement = sourceElement;
            _sourceElementContainer = pointingElementContainer;

            _connector = new DiagramConnector(sourceElement, point);
            pointingElementContainer.AddDiagramElement(_connector);
            sourceElement.AddOutgoingConnector(_connector);
        }

        if (pointingElement is not IHasIncomingConnector targetElement ||
            !targetElement.CanConnectIncoming(_connector.GetType()) ||
            _sourceElementContainer != pointingElementContainer)
            Cursor = "not-allowed";
        else
            Cursor = DefaultCursor;
    }

    protected override void OnTargetPointerUp(PointerEventArgs e)
    {
        if (_sourceElement is null || _connector is null)
            return;

        var point = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var nodesAtPoint = Diagram.GetDiagramElementsAt(point).OfType<IDiagramNode>();
        var pointingElement = nodesAtPoint.FirstOrDefault();

        if (pointingElement is null)
        {
            Cancel();
            return;
        }

        var pointingElementContainer = Diagram
            .GetDiagramElementsAt(new DiagramPoint(pointingElement.Boundary.Cx, pointingElement.Boundary.Cy))
            .OfType<IDiagramContainer>()
            .FirstOrDefault(x => x != pointingElement && x.CanContain<DiagramConnector>());

        if (pointingElement is not IHasIncomingConnector targetElement ||
            !targetElement.CanConnectIncoming<DiagramConnector>() ||
            pointingElementContainer != _sourceElementContainer)
        {
            Cancel();
            return;
        }

        Cursor = DefaultCursor;
        _connector.TargetElement = targetElement;
        targetElement.AddIncomingConnector(_connector);
        ConnectorRouter.RouteConnector(_connector, gridSize: Diagram.SnapSize);
    }

    protected override void OnTargetPointerUnavailable()
    {
        Reset();
    }

    private void Cancel()
    {
        if (_connector != null)
        {
            _connector.Clean();
            _sourceElementContainer?.RemoveDiagramElement(_connector);
            _sourceElement?.RemoveOutgoingConnector(_connector);
        }

        Reset();
    }

    private void Reset()
    {
        _connector = null;
        _sourceElement = null;
        _sourceElementContainer = null;
    }

}
