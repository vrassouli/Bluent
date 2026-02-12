using Bluent.UI.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDockService
{
    event EventHandler? PanelActivated;
    event EventHandler? PanelDeactivated;
    event EventHandler? PanelRegistered;
    event EventHandler? PanelUnregistered;

    void ActivatePanel(DockPanel activePanel);
    void DeactivatePanel(DockPanel activePanel);
    DockPanel? GetActivePanel(string dockName);
    string[] GetDockNames();
    List<DockPanel> GetRegisteredPanels(string dockName);
    void RegisterPanel(DockPanel dockPanel, string dockName);
    void UnregisterPanel(DockPanel dockPanel);
}