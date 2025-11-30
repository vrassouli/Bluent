using System;

namespace Bluent.UI.Services.Abstractions;

public record DomRectReadOnly
{
    public double Top { get; set; }
    public double Right { get; set; }
    public double Bottom { get; set; }
    public double Left { get; set; }
}

public record DomRect : DomRectReadOnly
{
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
}
