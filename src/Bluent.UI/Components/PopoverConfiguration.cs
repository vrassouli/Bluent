using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class PopoverConfiguration
{
    internal PopoverConfiguration(PopoverSettings settings, RenderFragment content, bool displayArrow)
    {
        Settings = settings;
        Content = content;
        DisplayArrow = displayArrow;
    }

    internal PopoverSettings Settings { get; }
    internal RenderFragment Content { get; }
    internal bool DisplayArrow { get; }

    internal bool Visible { get; set; }
    internal string SurfaceId => $"{Settings.TriggerId}_surface";
}
