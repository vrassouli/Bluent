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

    void ActivatePanel(DockPanel activePanel);
    void DeactivatePanel(DockPanel activePanel);
    DockPanel? GetActivePanel(string dockName);
    string[] GetDockNames();
    List<DockPanel> GetRegisteredPanels(string dockName);
    void NotifyStateHasChanged(string dockName);
    void RegisterPanel(DockPanel dockPanel, string dockName);
    void UnregisterPanel(DockPanel dockPanel);
}