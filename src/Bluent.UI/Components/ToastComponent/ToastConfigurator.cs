namespace Bluent.UI.Components;

public class ToastConfigurator
{
    private int? _duration = 3500;
    private ToastPlacement _placement = ToastPlacement.BottomEnd;
    private string? _message;
    private ToastIntend _intend = ToastIntend.None;
    private string? _dismissTitle;

    public ToastConfigurator SetDuration(int? duration)
    {
        _duration = duration;

        return this;
    }

    public ToastConfigurator SetPlace(ToastPlacement placement)
    {
        _placement = placement;

        return this;
    }

    public ToastConfigurator SetMessage(string? message)
    {
        _message = message;

        return this;
    }

    public ToastConfigurator SetDismissTitle(string? dismissTitle)
    {
        _dismissTitle = dismissTitle;

        return this;
    }

    public ToastConfigurator SetIntend(ToastIntend intend)
    {
        _intend = intend;

        return this;
    }

    internal ToastConfiguration Configuration
    {
        get
        {
            return new ToastConfiguration(_duration, _placement);
        }
    }

    internal string? Message { get => _message; }
    internal ToastIntend Intend { get => _intend; }
    internal string? DismissTitle { get => _dismissTitle; }
}
