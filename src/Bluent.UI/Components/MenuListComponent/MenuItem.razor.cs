using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Components;

public partial class MenuItem
{
    private Popover? _subMenuPopover;

    [Parameter, EditorRequired]
    public string Title { get; set; } = default!;

    [Parameter]
    public EventCallback OnClick { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public IconDefinition? Icon { get; set; }

    [Parameter]
    public bool Checked { get; set; }

    [Parameter]
    public object? Data { get; set; }

    [CascadingParameter]
    public MenuList MenuList { get; set; } = default!;

    [CascadingParameter]
    public Popover? Popover { get; set; }

    [Parameter]
    public string? Href { get; set; }

    [Inject]
    IPopoverService PopoverService { get; set; } = default!;

    private bool IsLink => !string.IsNullOrEmpty(Href);

    protected override void OnInitialized()
    {
        if (MenuList is null)
            throw new InvalidOperationException($"'{nameof(MenuItem)}' component should be nested in a '{nameof(Components.Menu)}' component.");

        MenuList.Add(this);

        base.OnInitialized();
    }

    public override ValueTask DisposeAsync()
    {
        MenuList.Remove(this);
        return base.DisposeAsync();
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
        if (IsDisabled)
            yield return "disabled";
    }

    private Task HandleKeyDown(KeyboardEventArgs args)
    {
        if (args.Key is not ("Enter" or " "))
            return Task.CompletedTask;

        if (IsDisabled)
            return Task.CompletedTask;

        if (ChildContent is not null)
        {
            _subMenuPopover?.Show();
            return Task.CompletedTask;
        }

        // Leaf activation is routed through the shared keyboard controller as a single click.
        return Task.CompletedTask;
    }

    private async Task ClickHandler()
    {
        if (IsDisabled)
            return;

        if (ChildContent is not null)
        {
            _subMenuPopover?.Show();
            return;
        }

        // Close before invoking the consumer callback. In InteractiveWebAssembly, the callback
        // can synchronously rerender the menu content; closing first keeps the popover owner
        // and its JS interop reference alive for the close request.
        if (Popover != null)
            await Popover.CloseAsync();

        await OnClick.InvokeAsync();
    }

    private string GetItemTag()
    {
        if (IsLink && !IsDisabled)
            return "a";

        return "div";
    }
}
