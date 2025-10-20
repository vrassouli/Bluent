using Bluent.UI.Diagrams.Commands.Diagram;
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
    private DiagramConnectorBase? _connector;

    /// <summary>
    /// Indicates that the source and target elements should be at the same container
    /// </summary>
    public bool SameContainers { get; set; } = true;

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

            new ConnectorRouter().RouteConnector(_connector, gridSize: Diagram.SnapSize);
        }

        base.OnPointerMove(e);
    }

    protected override void OnTargetPointerMove(PointerEventArgs e)
    {
        var point = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var nodesAtPoint = Diagram.GetElementsAt(point).OfType<IDiagramNode>();
        var pointingElement = nodesAtPoint.FirstOrDefault();

        if (pointingElement is null)
            return;

        var pointingElementContainer = Diagram
            .GetElementsAt(new DiagramPoint(pointingElement.Boundary.Cx, pointingElement.Boundary.Cy))
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

            _connector = BuildConnector(sourceElement, point);
            _sourceElementContainer.AddDiagramElement(_connector);
            sourceElement.AddOutgoingConnector(_connector);
        }
        
        if (pointingElement is IHasIncomingConnector targetElement && 
            targetElement.CanConnectIncoming(_connector.GetType()) && 
            (!SameContainers || _sourceElementContainer == pointingElementContainer))
            Cursor = DefaultCursor;
        else
            Cursor = "not-allowed";
    }

    protected override void OnTargetPointerUp(PointerEventArgs e)
    {
        if (_sourceElement is null || _connector is null)
            return;

        var point = Canvas.ScreenToDiagram(e.ToOffsetPoint());
        var nodesAtPoint = Diagram.GetElementsAt(point).OfType<IDiagramNode>();
        var pointingElement = nodesAtPoint.FirstOrDefault();

        if (pointingElement is null)
        {
            Cancel();
            return;
        }

        var pointingElementContainer = Diagram
            .GetElementsAt(new DiagramPoint(pointingElement.Boundary.Cx, pointingElement.Boundary.Cy))
            .OfType<IDiagramContainer>()
            .FirstOrDefault(x => x != pointingElement && x.CanContain<DiagramConnector>());

        if (pointingElement is IHasIncomingConnector targetElement && targetElement.CanConnectIncoming(_connector.GetType()) && (!SameContainers || pointingElementContainer == _sourceElementContainer))
        {
            Cursor = DefaultCursor;
            _connector.TargetElement = targetElement;
            targetElement.AddIncomingConnector(_connector);
            new ConnectorRouter().RouteConnector(_connector, gridSize: Diagram.SnapSize);

            // Delete! Get ready for AddConnectorCommand
            if (_sourceElementContainer is not null)
            {
                _sourceElementContainer.RemoveDiagramElement(_connector);

                var cmd = new AddDiagramConnectorCommand(_sourceElementContainer, _sourceElement, targetElement, _connector);
                Diagram.ExecuteCommand(cmd);
            }
        }
        else
        {
            Cancel();
        }
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
            Cursor = DefaultCursor;
    }
    
    protected virtual DiagramConnectorBase BuildConnector(IHasOutgoingConnector sourceElement, DiagramPoint start)
    {
        return new DiagramConnector(sourceElement, start);
    }
}
