using Bluent.UI.Utilities.Services.Events;

namespace Bluent.UI.Utilities.Abstractions;

public interface IBusyIndicator
{
    event EventHandler<BusyIndicatorStatusChangedEventArgs>? StatusChanged;

    void SetBusy();

    void SetIdeal();
}