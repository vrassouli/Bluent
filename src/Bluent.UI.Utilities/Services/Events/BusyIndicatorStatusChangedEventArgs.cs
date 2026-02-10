namespace Bluent.UI.Utilities.Services.Events;

public class BusyIndicatorStatusChangedEventArgs : System.EventArgs
{
    public BusyIndicatorStatusChangedEventArgs(bool isBusy) => this.IsBusy = isBusy;

    public bool IsBusy { get; }
}
