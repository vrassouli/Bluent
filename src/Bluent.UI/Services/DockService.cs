using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;

namespace Bluent.UI.Services;

internal class DockService : IDockService
{
    private readonly Dictionary<string, List<DockPanel>> _dockPanels = new();
    private readonly Dictionary<string, DockPanel?> _activePanels = new();

    public event EventHandler<DockPanelUpdateEventArgs>? PanelActivated;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelDeactivated;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelRegistered;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelUnregistered;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelStateHasChanged;

    public void ActivatePanel(DockPanel activePanel)
    {
        var dockName = FindPanelDockName(activePanel);
        if (dockName == null)
            return;
        
        _activePanels[dockName] = activePanel;
        PanelActivated?.Invoke(this, new DockPanelUpdateEventArgs(dockName));
    }

    public void DeactivatePanel(DockPanel activePanel)
    {
        foreach (var kv in _activePanels)
        {
            if (kv.Value == activePanel)
            {
                _activePanels.Remove(kv.Key);
                PanelDeactivated?.Invoke(this, new DockPanelUpdateEventArgs(kv.Key));
                break;
            }
        }
    }

    public DockPanel? GetActivePanel(string dockName)
    {
        if (!_dockPanels.ContainsKey(dockName))
            _dockPanels[dockName] = [];
        
        return _activePanels.GetValueOrDefault(dockName);
    }

    public string[] GetDockNames() => _dockPanels.Keys.OrderBy(x => x).ToArray();
    
    public List<DockPanel> GetRegisteredPanels(string dockName)
    {
        if (!_dockPanels.ContainsKey(dockName))
            _dockPanels[dockName] = [];
        
        if (_dockPanels.TryGetValue(dockName, out var panels))
            return panels;

        return [];
    }

    public void NotifyStateHasChanged(string dockName)
    {
        PanelStateHasChanged?.Invoke(this, new DockPanelUpdateEventArgs(dockName));
    }

    public void RegisterPanel(DockPanel dockPanel, string dockName)
    {
        UnregisterPanel(dockPanel);
        if (_dockPanels.TryGetValue(dockName, out var panels))
            panels.Add(dockPanel);
        else
            _dockPanels[dockName] = [dockPanel];
        
        PanelRegistered?.Invoke(this, new DockPanelUpdateEventArgs(dockName));
    }

    public void UnregisterPanel(DockPanel dockPanel)
    {
        foreach (var panels in _dockPanels.Values)
            panels.Remove(dockPanel);
        
        PanelUnregistered?.Invoke(this, new DockPanelUpdateEventArgs(dockPanel.DockName));
    }

    private string? FindPanelDockName(DockPanel dockPanel)
    {
        foreach (var kv in _dockPanels)
        {
            if (kv.Value.Contains(dockPanel))
                return kv.Key;
        }
        
        return null;
    }
}