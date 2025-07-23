using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Extensions;

internal static class PointerEventArgsExtensions
{
    public static Point ToClientPoint(this PointerEventArgs e)
    {
        return new Point(e.ClientX, e.ClientY);
    }

    public static Point ToOffsetPoint(this PointerEventArgs e)
    {
        return new Point(e.OffsetX, e.OffsetY);
    }
}
