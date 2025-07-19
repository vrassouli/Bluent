using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace Bluent.UI.Diagrams.Elements;

internal abstract class SvgElementBase : ISvgElement
{
    public string? Fill { get; set; }
    public string? Stroke { get; set; }

    public event PropertyChangedEventHandler? PropertyChanged;

    public abstract RenderFragment Render(ElementState state);

    protected void NotifyPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
