using Bluent.UI.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDockService
{
    event EventHandler? PanelActivated;
    event EventHandler? PanelDeactivated;
    event EventHandler? PanelRegistered;
    event EventHandler? PanelUnregistered;

    void ActivatePanel(DockPanel activePanel, string dockName);
    DockPanel? GetActivePanel(string dockName);
    List<DockPanel> GetRegisteredPanels(string dockName);
    void RegisterPanel(DockPanel dockPanel, string dockName);
    void UnregisterPanel(DockPanel dockPanel);
    void DeactivatePanel(DockPanel activePanel);
}