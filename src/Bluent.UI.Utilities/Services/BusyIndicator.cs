using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services.Events;

namespace Bluent.UI.Utilities.Services;

internal class BusyIndicator : IBusyIndicator
{
    private int _busyCount;
    public bool IsBusy => _busyCount > 0;

    public event EventHandler<BusyIndicatorStatusChangedEventArgs>? StatusChanged;

    public void SetBusy()
    {
        var wasBusy = IsBusy;

        Interlocked.Increment(ref _busyCount);

        if(!wasBusy && IsBusy)
            StatusChanged?.Invoke(this, new BusyIndicatorStatusChangedEventArgs(IsBusy));
    }

    public void SetIdeal()
    {
        var wasBusy = IsBusy;

        Interlocked.Decrement(ref _busyCount);
        
        if (wasBusy && !IsBusy)
            StatusChanged?.Invoke(this, new BusyIndicatorStatusChangedEventArgs(IsBusy));
    }
}