using Bluent.UI.Components.SplitPanelComponent.Internal;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class DockContainer
{
    [Parameter, EditorRequired] public string DockName { get; set; }
    [CascadingParameter] public SplitPanel? SplitPanel { get; set; }
    [Inject] private IDockService DockService { get; set; } = default!;

    private DockPanel? ActivePanel => DockService.GetActivePanel(DockName);
    private string[] DockNames => DockService.GetDockNames();

    protected override void OnInitialized()
    {
        DockService.PanelActivated += OnPanelActivated;
        DockService.PanelDeactivated += OnPanelDeactivated;
        UpdateSplitPanel();

        base.OnInitialized();
    }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-dock-container";
    }

    public override ValueTask DisposeAsync()
    {
        DockService.PanelActivated -= OnPanelActivated;
        DockService.PanelDeactivated -= OnPanelDeactivated;

        return base.DisposeAsync();
    }

    private void OnPanelDeactivated(object? sender, EventArgs e)
    {
        UpdateSplitPanel();
        StateHasChanged();
    }

    private void OnPanelActivated(object? sender, EventArgs e)
    {
        UpdateSplitPanel();
        StateHasChanged();
    }

    private void UpdateSplitPanel()
    {
        if (SplitPanel is null)
            return;

        if (ActivePanel is not null)
            SplitPanel.SetAllowResize(true);
        else
        {
            SplitPanel.ResetSize();
            SplitPanel.SetAllowResize(false);
        }
    }

    private void ChangeDock(string name)
    {
        if (ActivePanel is null || ActivePanel.DockName == name)
            return;
        
        // preserve active panel reference, before deactivation
        var activePanel = ActivePanel;
        DockService.DeactivatePanel(ActivePanel);
        
        // use the preserved reference, as ActivePanel should be null here...
        activePanel.SetDockName(name);
        DockService.ActivatePanel(activePanel);
    }

    private void Deactivate()
    {
        if (ActivePanel is null)
            return;
        
        DockService.DeactivatePanel(ActivePanel);
    }
}