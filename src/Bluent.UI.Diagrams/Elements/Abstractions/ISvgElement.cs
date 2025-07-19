using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements;

public interface ISvgElement : INotifyPropertyChanged
{
    RenderFragment Render(ElementState state);

    string? Fill { get; set; }
}