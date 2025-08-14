using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Diagrams.Components.Internals;

public partial class SelectionOptionsContainer : IDisposable
{
    private IDrawingShape? _shape;

    [Parameter, EditorRequired] public IDrawingShape Shape { get; set; }
    [Parameter, EditorRequired] public Distance2D Pan { get; set; }
    [Parameter, EditorRequired] public double Scale { get; set; }

    protected override void OnParametersSet()
    {
        if (_shape != Shape)
        {
            ClearShapeEvents();

            _shape = Shape;

            InitializeShapeEvents();
        }

        base.OnParametersSet();
    }

    public void Dispose()
    {
        ClearShapeEvents();
    }

    private void InitializeShapeEvents()
    {
        if (_shape is not null)
        {
            _shape.PropertyChanged += ShapePropertyChanged;
        }
    }

    private void ClearShapeEvents()
    {
        if (_shape != null)
        {
            _shape.PropertyChanged -= ShapePropertyChanged;
        }
    }

    private void ShapePropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        //if (e.PropertyName == nameof(Shape.Boundary))
            StateHasChanged();
    }
}
