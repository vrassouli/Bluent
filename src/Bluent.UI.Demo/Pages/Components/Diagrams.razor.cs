using Bluent.Core;
using Bluent.UI.Diagrams.Commands.Basic;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Basic;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Drawings.Basic;
using Bluent.UI.Diagrams.Tools.Drawings.Diagram;
using Bluent.UI.Diagrams.Tools.Utilities;

namespace Bluent.UI.Demo.Pages.Components;

public partial class Diagrams
{
    private bool _canUndo;
    private bool _canRedo;

    private CommandManager _commandManager;
    private IDiagramTool? _tool;
    private DrawingCanvas? _canvas;

    private IDiagramTool? Tool
    {
        get => _tool;
        set
        {
            if (_tool != value)
            {
                UnbindToolEvents();

                _tool = value;

                BindToolEvents();
            }
        }
    }

    public Diagrams()
    {
        _commandManager = new();
        _commandManager.CommandExecuted += OnCommandExecuted;
    }

    private void OnCommandExecuted(object? sender, EventArgs e)
    {
        if (_canUndo != _commandManager.CanUndo || _canRedo != _commandManager.CanRedo)
        {
            _canUndo = _commandManager.CanUndo;
            _canRedo = _commandManager.CanRedo;

            StateHasChanged();
        }
    }

    private void Undo()
    {
        _commandManager.Undo();
    }

    private void Redo()
    {
        _commandManager.Redo();
    }

    private void DeselectTool() => Tool = null;
    private void SelectAreaSelectTool() => Tool = new DiagramAreaSelectTool();
    //private void SelectLineTool() => Tool = new DrawLineTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectRectTool() => Tool = new DrawRectangleNodeTool() { };
    private void SelectRectContainerTool() => Tool = new DrawRectangleContainerNodeTool() { };
    private void SelectCircleTool() => Tool = new DrawCircleNodeTool() { };
    private void SelectBoundaryCircleTool() => Tool = new DrawBoundaryCircleNodeTool() { };
    //private void SelectDiamondTool() => Tool = new DrawDiamondTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    //private void SelectInkToShapeTool() => Tool = new InkToShapeTool() { };
    private void ToolOperationCompleted()
    {
        if (Tool is not InkToShapeTool)
            Tool = null;
    }

    private void UnbindToolEvents()
    {
        if (_tool is InkToShapeTool inkToShapeTool)
            inkToShapeTool.OnShapeDetected -= OnShapeDetected;
    }

    private void BindToolEvents()
    {
        if (_tool is InkToShapeTool inkToShapeTool)
            inkToShapeTool.OnShapeDetected += OnShapeDetected;
    }

    private void OnShapeDetected(object? sender, ShapeDetectionResult e)
    {
        if (_canvas is null)
            return;

        IDrawingElement? element = null;

        //if (e.Shape == CommonShapes.Circle)
        //{
        //    var r = DiagramPoint.GetDistance(e.StartPoint, e.CenterPoint);
        //    element = new CircleElement(e.CenterPoint.X, e.CenterPoint.Y, r);
        //}
        //else if (e.Shape == CommonShapes.Rectangle)
        //{
        //    var width = Math.Abs((e.CenterPoint - e.StartPoint).Dx * 2);
        //    var height = Math.Abs((e.CenterPoint - e.StartPoint).Dy * 2);
        //    element = new RectElement(e.StartPoint.X, e.StartPoint.Y, width, height);
        //}
        //else if (e.Shape == CommonShapes.Diamond)
        //{
        //    var width = Math.Abs((e.CenterPoint - e.StartPoint).Dx * 2);
        //    var height = Math.Abs((e.CenterPoint - e.StartPoint).Dy * 2);
        //    element = new DiamondElement(e.StartPoint.X, e.StartPoint.Y, width, height);
        //}

        //if (element is not null)
        //{
        //    element.Stroke = StrokeColor;
        //    element.StrokeWidth = StrokeWidth;
        //    element.Fill = FillColor;
        //    _canvas.ExecuteCommand(new AddElementCommand(_canvas, element));
        //}
    }
}
