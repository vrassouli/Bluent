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

    protected override void OnInitialized()
    {
        DockService.PanelActivated += OnPanelActivated;
        DockService.PanelDeactivated += OnPanelDeactivated;
        UpdateSplitPanel();

        base.OnInitialized();
    }

    public override void Dispose()
    {
        DockService.PanelActivated -= OnPanelActivated;
        DockService.PanelDeactivated -= OnPanelDeactivated;

        base.Dispose();
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
}