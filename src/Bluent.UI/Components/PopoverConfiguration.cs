using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class PopoverConfiguration
{
    internal PopoverConfiguration(PopoverSettings settings, RenderFragment content, bool displayArrow, PopoverAppearance appearance, bool keepSurface)
    {
        Settings = settings;
        Content = content;
        DisplayArrow = displayArrow;
        Appearance = appearance;
        KeepSurface = keepSurface;
    }

    internal PopoverSettings Settings { get; }
    internal RenderFragment Content { get; }
    internal bool DisplayArrow { get; }
    public PopoverAppearance Appearance { get; }
    public bool KeepSurface { get; }
    internal bool Visible { get; set; }
    internal string SurfaceId => $"{Settings.TriggerId}_surface";
}
