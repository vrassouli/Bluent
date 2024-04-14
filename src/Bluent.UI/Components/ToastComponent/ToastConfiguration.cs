namespace Bluent.UI.Components;

public class ToastConfiguration
{
    public ToastConfiguration(int? duration = 1000,
                              ToastPlacement placement = ToastPlacement.BottomEnd,
                              ToastIntend intend = ToastIntend.None)
    {
        Duration = duration;
        Placement = placement;
        Intend = intend;
    }

    public int? Duration { get; }
    public ToastPlacement Placement { get; }
    public ToastIntend Intend { get; }
}
