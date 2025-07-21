using Microsoft.AspNetCore.Components;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements;

public interface ISvgElement : INotifyPropertyChanged
{
    RenderFragment Render();

    string? Fill { get; set; }

    Boundary Boundary { get; }
}