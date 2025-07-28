using Bluent.Core;
using Bluent.UI.Diagrams.Commands;
using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Tools;
using Bluent.UI.Diagrams.Tools.Utilities;

namespace Bluent.UI.Demo.Pages.Components;

public partial class DrawingCanvases
{
    private bool _canUndo;
    private bool _canRedo;

    private string _fillColor = "#e66465";
    private string _strokeColor = "#f6b73c";
    private int _strokeWidth = 1;
    private CommandManager _commandManager;
    private ISvgTool? _tool;
    private DrawingCanvas? _canvas;

    public string FillColor
    {
        get => _fillColor;
        set
        {
            _fillColor = value;
            if (Tool is ISvgDrawingTool drawingTool)
                drawingTool.Fill = _fillColor;
        }
    }
    public string StrokeColor
    {
        get => _strokeColor;
        set
        {
            _strokeColor = value;
            if (Tool is ISvgDrawingTool drawingTool)
                drawingTool.Stroke = _strokeColor;
        }
    }

    public int StrokeWidth
    {
        get => _strokeWidth;
        set
        {
            _strokeWidth = value;
            if (Tool is ISvgDrawingTool drawingTool)
                drawingTool.StrokeWidth = _strokeWidth;
        }
    }
    private ISvgTool? Tool
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

    public DrawingCanvases()
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

    private void SetStrokeWidth(int width) => StrokeWidth = width;

    private void DeselectTool() => Tool = null;
    private void SelectAreaSelectTool() => Tool = new AreaSelectTool();
    private void SelectLineTool() => Tool = new DrawLineTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectRectTool() => Tool = new DrawRectTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectCircleTool() => Tool = new DrawCircleTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectDiamondTool() => Tool = new DrawDiamondTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectInkToShapeTool() => Tool = new InkToShapeTool() { };
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

        if (e.Shape == CommonShapes.Circle)
        {
            var r = DiagramPoint.GetDistance(e.StartPoint, e.CenterPoint);
            element = new CircleElement(e.CenterPoint.X, e.CenterPoint.Y, r);
        }
        else if (e.Shape == CommonShapes.Rectangle)
        {
            var width = Math.Abs((e.CenterPoint - e.StartPoint).Dx * 2);
            var height = Math.Abs((e.CenterPoint - e.StartPoint).Dy * 2);
            element = new RectElement(e.StartPoint.X, e.StartPoint.Y, width, height);
        }
        else if (e.Shape == CommonShapes.Diamond)
        {
            var width = Math.Abs((e.CenterPoint - e.StartPoint).Dx * 2);
            var height = Math.Abs((e.CenterPoint - e.StartPoint).Dy * 2);
            element = new DiamondElement(e.StartPoint.X, e.StartPoint.Y, width, height);
        }

        if (element is not null)
        {
            element.Stroke = StrokeColor;
            element.StrokeWidth = StrokeWidth;
            element.Fill = FillColor;
            _canvas.ExecuteCommand(new AddElementCommand(_canvas, element));
        }
    }
}
