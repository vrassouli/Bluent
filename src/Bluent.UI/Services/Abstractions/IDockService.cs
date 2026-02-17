using Bluent.UI.Components;

namespace Bluent.UI.Services.Abstractions;

public class DockPanelUpdateEventArgs : EventArgs
{
    public string DockName { get; }

    public DockPanelUpdateEventArgs(string dockName)
    {
        DockName = dockName;
    }
}
public interface IDockService
{
    event EventHandler<DockPanelUpdateEventArgs>? PanelActivated;
    event EventHandler<DockPanelUpdateEventArgs>? PanelDeactivated;
    event EventHandler<DockPanelUpdateEventArgs>? PanelRegistered;
    event EventHandler<DockPanelUpdateEventArgs>? PanelUnregistered;
    event EventHandler<DockPanelUpdateEventArgs>? PanelStateHasChanged;
    event EventHandler<DockPanelUpdateEventArgs>? PanelDockModeChanged;

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