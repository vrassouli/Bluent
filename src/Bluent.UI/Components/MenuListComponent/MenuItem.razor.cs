using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class MenuItem
{
    private Popover? _subMenuPopover;

    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public bool Checked { get; set; }
    [CascadingParameter] public MenuList MenuList { get; set; } = default!;
    [CascadingParameter] public Popover? Popover { get; set; }
    [Inject] IPopoverService PopoverService { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (MenuList is null)
            throw new InvalidOperationException($"'{nameof(MenuItem)}' component should be nested in a '{nameof(Components.Menu)}' component.");

        MenuList.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        MenuList.Remove(this);

        base.Dispose();
    }

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

    private string GetItemTag()
    {
        if (AdditionalAttributes?.ContainsKey("href") == true)
            return "a";

        return "div";
    }
}
