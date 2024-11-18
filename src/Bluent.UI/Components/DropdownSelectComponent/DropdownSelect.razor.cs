using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class DropdownSelect
{
    private Popover? _popover;

    [Parameter] public RenderFragment? Dropdown { get; set; }
    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.BottomStart;
    [Parameter] public bool HideClear { get; set; } = false;
    [Parameter] public string? DisplayText { get; set; }
    [Parameter] public EventCallback ClearSelection { get; set; }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && _popover != null)
        {
            _popover.SetTrigger(this);
        }

        base.OnAfterRender(firstRender);
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-dropdown-select";
    }

    public void Close()
    {
        _popover?.Close();
    }

    public void Refresh()
    {
        _popover?.RefreshSurface();
    }
}
