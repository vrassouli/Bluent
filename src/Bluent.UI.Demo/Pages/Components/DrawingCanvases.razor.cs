using Bluent.Core;
using Bluent.UI.Diagrams.Tools;

namespace Bluent.UI.Demo.Pages.Components;

public partial class DrawingCanvases
{
    private ISvgTool? _tool;
    private bool _canUndo;
    private bool _canRedo;

    private string _fillColor = "#e66465";
    private string _strokeColor = "#f6b73c";
    private int _strokeWidth = 1;
    private CommandManager _commandManager;

    public string FillColor
    {
        get => _fillColor;
        set
        {
            _fillColor = value;
            if (_tool is ISvgDrawingTool drawingTool)
                drawingTool.Fill = _fillColor;
        }
    }
    public string StrokeColor
    {
        get => _strokeColor;
        set
        {
            _strokeColor = value;
            if (_tool is ISvgDrawingTool drawingTool)
                drawingTool.Stroke = _strokeColor;
        }
    }

    public int StrokeWidth
    {
        get => _strokeWidth;
        set
        {
            _strokeWidth = value;
            if (_tool is ISvgDrawingTool drawingTool)
                drawingTool.StrokeWidth = _strokeWidth;
        }
    }

    public DrawingCanvases()
    {
        _commandManager = new();
        _commandManager.CommandExecuted += OnCommandExecuted;
    }

    private void OnCommandExecuted(object? sender, EventArgs e)
    {
        if(_canUndo != _commandManager.CanUndo || _canRedo != _commandManager.CanRedo)
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

    private void DeselectTool() => _tool = null;
    private void SelectAreaSelectTool() => _tool = new AreaSelectTool();
    private void SelectPanTool() => _tool = new PanTool();
    private void SelectLineTool() => _tool = new DrawLineTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectRectTool() => _tool = new DrawRectTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void SelectCircleTool() => _tool = new DrawCircleTool() { Fill = FillColor, Stroke = StrokeColor, StrokeWidth = StrokeWidth };
    private void ToolOperationCompleted() => _tool = null;
}
