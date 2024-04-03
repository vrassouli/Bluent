using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class MenuItem
{
    private Popover? _subMenuPopover;

    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }
    [Inject] IPopoverService PopoverService { get; set; } = default!;

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && ChildContent != null && _subMenuPopover != null)
            _subMenuPopover.SetTrigger(this);

        base.OnAfterRender(firstRender);
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "menu-item";
    }

    private void ClickHandler()
    {
        InvokeAsync(OnClick.InvokeAsync);

        if (Popover != null)
        {
            Popover.Hide();
        }
    }
}
