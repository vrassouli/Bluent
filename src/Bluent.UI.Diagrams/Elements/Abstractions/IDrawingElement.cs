using Microsoft.AspNetCore.Components;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements;

public interface IDrawingElement : INotifyPropertyChanged
{
    bool AllowVerticalDrag { get; }
    bool AllowHorizontalResize { get; }
    bool AllowVerticalResize { get; }
    Boundary Boundary { get; }
    string? Fill { get; set; }
    string? Stroke { get; set; }
    bool AllowHorizontalDrag { get; }

    RenderFragment Render();
    void SetDrag(Distance2D drag);
    void ApplyDrag();
    void CancelDrag();
}