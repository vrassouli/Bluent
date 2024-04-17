namespace Bluent.UI.Components;

public class ToastConfiguration
{
    public ToastConfiguration(int? duration = 2500,
                              ToastPlacement placement = ToastPlacement.BottomEnd)
    {
        Duration = duration;
        Placement = placement;
    }

    public int? Duration { get; }
    public ToastPlacement Placement { get; }
}
