using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;

namespace Bluent.UI.Services;

internal sealed class DockService : IDockService
{
    private readonly Dictionary<string, List<DockPanel>> _dockPanels = new();
    private readonly Dictionary<string, DockPanel?> _activePanels = new();
    private readonly Dictionary<string, DockMode> _dockModes = new();

    public event EventHandler<DockAreaUpdateEventArgs>? PanelActivated;
    public event EventHandler<DockAreaUpdateEventArgs>? PanelDeactivated;
    public event EventHandler<DockAreaUpdateEventArgs>? PanelRegistered;
    public event EventHandler<DockAreaUpdateEventArgs>? PanelUnregistered;
    public event EventHandler<DockAreaUpdateEventArgs>? PanelStateHasChanged;
    public event EventHandler<DockAreaUpdateEventArgs>? PanelDockModeChanged;

    public void ActivatePanel(DockPanel panel)
    {
        var dockName = panel.DockName;
        _activePanels[dockName] = panel;

        PanelActivated?.Invoke(this, new DockAreaUpdateEventArgs(dockName));
    }

    public void DeactivatePanel(DockPanel panel)
    {
        _activePanels[panel.DockName] = null;

        PanelDeactivated?.Invoke(this, new DockAreaUpdateEventArgs(panel.DockName));
    }

    public DockPanel? GetActivePanel(string dockName)
    {
        if (_activePanels.TryGetValue(dockName, out var panel))
            return panel;

        var mode = GetDockMode(dockName);
        if (mode == DockMode.Pinned && _dockPanels.TryGetValue(dockName, out var dockPanel))
            return dockPanel.FirstOrDefault();

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
        PanelStateHasChanged?.Invoke(this, new DockAreaUpdateEventArgs(dockName));
    }

    public void RegisterPanel(DockPanel panel, string dockName)
    {
        UnregisterPanel(panel);
        if (_dockPanels.TryGetValue(dockName, out var panels))
            panels.Add(panel);
        else
            _dockPanels[dockName] = [panel];

        PanelRegistered?.Invoke(this, new DockAreaUpdateEventArgs(dockName));
    }

    public void SetDockMode(string dockName, DockMode mode)
    {
        var current = _dockModes.GetValueOrDefault(dockName);
        _dockModes[dockName] = mode;

        if (current != mode)
            PanelDockModeChanged?.Invoke(this, new DockAreaUpdateEventArgs(dockName));
    }

    public void UnregisterPanel(DockPanel panel)
    {
        if (_dockPanels.TryGetValue(panel.DockName, out var panels))
        {
            if (panels.Remove(panel))
            {
                if (GetActivePanel(panel.DockName) == panel)
                    _activePanels.Remove(panel.DockName);

                PanelUnregistered?.Invoke(this, new DockAreaUpdateEventArgs(panel.DockName));
            }
        }

        // foreach (var panels in _dockPanels.Values)
        //     panels.Remove(panel);
        //
        // _activePanels.Remove(panel.DockName);
        //
        // PanelUnregistered?.Invoke(this, new DockPanelUpdateEventArgs(panel.DockName));
    }
}