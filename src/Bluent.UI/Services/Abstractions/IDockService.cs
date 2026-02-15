using Bluent.UI.Components;

namespace Bluent.UI.Services.Abstractions;

public class DockPanelEventArgs : EventArgs
{
    public string DockName { get; }

    public DockPanelEventArgs(string dockName)
    {
        DockName = dockName;
    }
}
public interface IDockService
{
    event EventHandler<DockPanelEventArgs>? PanelActivated;
    event EventHandler<DockPanelEventArgs>? PanelDeactivated;
    event EventHandler<DockPanelEventArgs>? PanelRegistered;
    event EventHandler<DockPanelEventArgs>? PanelUnregistered;
    event EventHandler<DockPanelEventArgs>? PanelStateHasChanged;

    void ActivatePanel(DockPanel activePanel);
    void DeactivatePanel(DockPanel activePanel);
    DockPanel? GetActivePanel(string dockName);
    string[] GetDockNames();
    List<DockPanel> GetRegisteredPanels(string dockName);
    void NotifyStateHasChanged(string dockName);
    void RegisterPanel(DockPanel dockPanel, string dockName);
    void UnregisterPanel(DockPanel dockPanel);
}