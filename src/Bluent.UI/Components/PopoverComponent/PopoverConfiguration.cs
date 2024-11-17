namespace Bluent.UI.Components;

public class PopoverConfiguration
{
    internal PopoverConfiguration(PopoverSettings settings, bool displayArrow, PopoverAppearance appearance, bool keepSurface)
    {
        Settings = settings;
        DisplayArrow = displayArrow;
        Appearance = appearance;
        KeepSurface = keepSurface;
    }

    internal PopoverSettings Settings { get; }
    internal bool DisplayArrow { get; }
    public PopoverAppearance Appearance { get; }
    public bool KeepSurface { get; }
    internal bool Visible { get; set; }
    internal string SurfaceId => $"{Settings.TriggerId}_surface";
}
