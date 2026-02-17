using Bluent.UI.Components;

namespace Bluent.UI.Services.Abstractions;

public class DockAreaUpdateEventArgs : EventArgs
{
    public string DockName { get; }

    public DockAreaUpdateEventArgs(string dockName)
    {
        DockName = dockName;
    }
}

public class DockPanelUnregisteredEventArgs : DockAreaUpdateEventArgs
{
    public DockPanel Panel { get; }

    public DockPanelUnregisteredEventArgs(string dockName, DockPanel panel)
        : base(dockName)
    {
        Panel = panel;
    }
}

public interface IDockService
{
    event EventHandler<DockAreaUpdateEventArgs>? PanelActivated;
    event EventHandler<DockAreaUpdateEventArgs>? PanelDeactivated;
    event EventHandler<DockAreaUpdateEventArgs>? PanelRegistered;
    event EventHandler<DockAreaUpdateEventArgs>? PanelUnregistered;
    event EventHandler<DockAreaUpdateEventArgs>? PanelStateHasChanged;
    event EventHandler<DockAreaUpdateEventArgs>? PanelDockModeChanged;

    void ActivatePanel(DockPanel panel);
    void DeactivatePanel(DockPanel panel);
    DockPanel? GetActivePanel(string dockName);
    string[] GetDockNames();
    List<DockPanel> GetRegisteredPanels(string dockName);
    void NotifyStateHasChanged(string dockName);
    void RegisterPanel(DockPanel panel, string dockName);
    void SetDockMode(string dockName, DockMode mode);
    void UnregisterPanel(DockPanel panel);
}