using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;

namespace Bluent.UI.Services;

internal class DockService : IDockService
{
    private readonly Dictionary<string, List<DockPanel>> _dockPanels = new();
    private readonly Dictionary<string, DockPanel?> _activePanels = new();
    private readonly Dictionary<string, DockMode> _dockModes = new();

    public event EventHandler<DockPanelUpdateEventArgs>? PanelActivated;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelDeactivated;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelRegistered;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelUnregistered;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelStateHasChanged;
    public event EventHandler<DockPanelUpdateEventArgs>? PanelDockModeChanged;

    public void ActivatePanel(DockPanel activePanel)
    {
        var dockName = activePanel.DockName;
        _activePanels[dockName] = activePanel;

        PanelActivated?.Invoke(this, new DockPanelUpdateEventArgs(dockName));
    }

    public void DeactivatePanel(DockPanel activePanel)
    {
        _activePanels.TryGetValue(activePanel.DockName, out var panel);
        _activePanels[activePanel.DockName] = null;

        if (panel != null)
        {
            PanelDeactivated?.Invoke(this, new DockPanelUpdateEventArgs(panel.DockName));
        }
    }

    public DockPanel? GetActivePanel(string dockName)
    {
        if (_activePanels.TryGetValue(dockName, out var panel))
            return panel;

        var mode = GetDockMode(dockName);
        if (mode == DockMode.Pinned)
            return _dockPanels[dockName].FirstOrDefault();

        return null;
    }

    public DockMode GetDockMode(string dockName)
    {
        _dockModes.TryAdd(dockName, DockMode.Pinned);

        return _dockModes[dockName];
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

    public void SetDockMode(string dockName, DockMode mode)
    {
        var current = _dockModes.GetValueOrDefault(dockName);
        _dockModes[dockName] = mode;
        
        if (current != mode)
            PanelDockModeChanged?.Invoke(this, new DockPanelUpdateEventArgs(dockName));
    }

    public void UnregisterPanel(DockPanel dockPanel)
    {
        foreach (var panels in _dockPanels.Values)
            panels.Remove(dockPanel);

        _activePanels.Remove(dockPanel.DockName);

        PanelUnregistered?.Invoke(this, new DockPanelUpdateEventArgs(dockPanel.DockName));
    }

    // private string? FindPanelDockName(DockPanel dockPanel)
    // {
    //     foreach (var kv in _dockPanels)
    //     {
    //         if (kv.Value.Contains(dockPanel))
    //             return kv.Key;
    //     }
    //
    //     return null;
    // }
}