using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Extensions;

public static class EventArgsExtensions
{
    public static ScreenPoint ToClientPoint(this PointerEventArgs e)
    {
        return new ScreenPoint(e.ClientX, e.ClientY);
    }

    public static ScreenPoint ToClientPoint(this WheelEventArgs e)
    {
        return new ScreenPoint(e.ClientX, e.ClientY);
    }

    public static ScreenPoint ToOffsetPoint(this PointerEventArgs e)
    {
        return new ScreenPoint(e.OffsetX, e.OffsetY);
    }

    public static ScreenPoint ToOffsetPoint(this WheelEventArgs e)
    {
        return new ScreenPoint(e.OffsetX, e.OffsetY);
    }
}
