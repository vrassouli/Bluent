using Bluent.Core;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class MasterContainer : BluentComponentBase
{
    private Breakpoints? _currentBreakpoint;
    private Drawer? _detailsDrawer;
    private bool _openDetails;

    [Parameter] public RenderFragment? MasterPanel { get; set; }
    [Parameter] public RenderFragment? DetailPanel { get; set; }
    [Parameter] public Breakpoints Breakpoint { get; set; } = Breakpoints.Md;
    [Parameter] public int? MasterWidth { get; set; }
    [Parameter] public string? DrawerHeader { get; set; }
    [Parameter] public bool OpenDetails { get; set; }
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }

    protected override void OnParametersSet()
    {
        if (_openDetails != OpenDetails)
        {
            _openDetails = OpenDetails;
            //Console.WriteLine("Open details changed:" + OpenDetails);
        }

        base.OnParametersSet();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (OpenDetails && _detailsDrawer != null)
        {
            _detailsDrawer.Open();
            //_openDetails = false;
            //StateHasChanged();
            //Console.WriteLine("Details drawer opened.");
        }

        base.OnAfterRender(firstRender);
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "master-container";
    }

    private void BreakpointChanged(Breakpoints breakpoint)
    {
        _currentBreakpoint = breakpoint;
    }

    private void HandleDrawerClosed(dynamic? result)
    {
        _openDetails = false;
        OnClose.InvokeAsync(result);
    }
}
