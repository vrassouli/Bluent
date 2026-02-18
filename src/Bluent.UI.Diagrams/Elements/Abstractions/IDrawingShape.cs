using Microsoft.AspNetCore.Components;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements;

public interface IDrawingShape : INotifyPropertyChanged
{
    Boundary Boundary { get; }
    bool IsSelected { get; set; }
    string? Stroke { get; set; }
    double? StrokeWidth { get; set; }
    string? StrokeDashArray { get; set; }
    string? SelectionStroke { get; set; }
    double? SelectionStrokeWidth { get; set; }
    string? SelectionStrokeDashArray { get; set; }
    RenderFragment? SelectionOptions { get; set; }
    RenderFragment Render();
    void RequestRender();
}
