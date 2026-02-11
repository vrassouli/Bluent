using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;

namespace Bluent.UI.Services;

internal class DockService : IDockService
{
    private readonly Dictionary<string, List<DockPanel>> _dockPanels = new();
    private readonly Dictionary<string, DockPanel?> _activePanels = new();

    public event EventHandler? PanelActivated;
    public event EventHandler? PanelDeactivated;
    public event EventHandler? PanelRegistered;
    public event EventHandler? PanelUnregistered;

    public void ActivatePanel(DockPanel activePanel, string dockName)
    {
        _activePanels[dockName] = activePanel;
        PanelActivated?.Invoke(this, EventArgs.Empty);
    }

    public void DeactivatePanel(DockPanel activePanel)
    {
        foreach (var kv in _activePanels)
        {
            if (kv.Value == activePanel)
            {
                _activePanels.Remove(kv.Key);
                PanelDeactivated?.Invoke(this, EventArgs.Empty);
                break;
            }
        }
    }

    public DockPanel? GetActivePanel(string dockName)
    {
        return _activePanels.GetValueOrDefault(dockName);
    }

    public List<DockPanel> GetRegisteredPanels(string dockName)
    {
        if (_dockPanels.TryGetValue(dockName, out var panels))
            return panels;

        return [];
    }
    
    public void RegisterPanel(DockPanel dockPanel, string dockName)
    {
        if (_dockPanels.TryGetValue(dockName, out var panels))
            panels.Add(dockPanel);
        else
            _dockPanels[dockName] = [dockPanel];
        
        PanelRegistered?.Invoke(this, EventArgs.Empty);
    }

    public void UnregisterPanel(DockPanel dockPanel)
    {
        foreach (var panels in _dockPanels.Values)
            panels.Remove(dockPanel);
        
        PanelUnregistered?.Invoke(this, EventArgs.Empty);
    }
}